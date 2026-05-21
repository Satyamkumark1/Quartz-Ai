"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { ReactFlow, Background, BackgroundVariant, ConnectionMode, useReactFlow, ReactFlowProvider, Panel } from "@xyflow/react";
import { useLiveblocksFlow, Cursors } from "@liveblocks/react-flow";
import { useUndo, useRedo, useCanUndo, useCanRedo, useOther } from "@liveblocks/react";
import { Cursor as LiveblocksCursor } from "@liveblocks/react-ui";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { CanvasNode } from "./nodes/canvas-node";
import { ShapePanel } from "./shape-panel";
import { Button } from "@/components/ui/button";
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Undo2, 
  Redo2, 
  Loader2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  Folder,
  FolderMinus,
  Download,
  Upload,
  Grid,
  Image as ImageIcon
} from "lucide-react";
import { CanvasEdge } from "./edges/canvas-edge";
import { StarterTemplatesModal } from "./starter-templates-modal";
import { CanvasTemplate } from "./starter-templates";
import { useCanvasAutosave } from "@/hooks/use-canvas-autosave";
import { useParams } from "next/navigation";
import { PresenceAvatars } from "./presence-avatars";
import { toPng, toSvg } from "html-to-image";
import { CanvasNode as CanvasNodeType, CanvasEdge as CanvasEdgeType } from "@/types/canvas";
import "@xyflow/react/dist/style.css";
import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-flow/styles.css";

const nodeTypes = {
  canvasNode: CanvasNode,
};

const edgeTypes = {
  canvasEdge: CanvasEdge,
};

function CursorWithThinking({ connectionId }: { userId: string; connectionId: number }) {
  const cursor = useOther(connectionId, (other) => ({
    color: other.info.color,
    name: other.info.name,
    thinking: Boolean(other.presence.thinking || other.presence.isThinking),
  }));

  return (
    <LiveblocksCursor
      color={cursor.color}
      label={
        <span className="inline-flex items-center gap-1">
          {cursor.thinking ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          <span>{cursor.name}</span>
        </span>
      }
    />
  );
}

function Flow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNodeType, CanvasEdgeType>({
      suspense: true,
      nodes: {
        initial: [],
      },
      edges: {
        initial: [],
      },
    });

  const reactFlowInstance = useReactFlow<CanvasNodeType, CanvasEdgeType>();
  const { screenToFlowPosition, setNodes, setEdges } = reactFlowInstance;

  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isSnapToGrid, setIsSnapToGrid] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    visible: boolean;
    nodeId?: string;
    edgeId?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOpenTemplates = () => setIsTemplatesOpen(true);
    window.addEventListener("open-templates-modal", handleOpenTemplates);
    return () => window.removeEventListener("open-templates-modal", handleOpenTemplates);
  }, []);

  const handleImport = useCallback((template: CanvasTemplate) => {
    setNodes(template.nodes);
    setEdges(template.edges);
    setIsTemplatesOpen(false);
    setTimeout(() => {
      reactFlowInstance.fitView({ duration: 500, padding: 0.2 });
    }, 100);
  }, [setNodes, setEdges, reactFlowInstance]);

  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  useKeyboardShortcuts({
    reactFlowInstance,
    undo,
    redo,
  });

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const payloadStr = event.dataTransfer.getData("application/reactflow");
      if (!payloadStr) return;

      try {
        const payload = JSON.parse(payloadStr);
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        const timestamp = Date.now();
        const counter = Math.floor(Math.random() * 1000);
        const newNodeId = `${payload.shape}-${timestamp}-${counter}`;

        const newNode: CanvasNodeType = {
          id: newNodeId,
          type: "canvasNode",
          position: {
            x: position.x - payload.width / 2,
            y: position.y - payload.height / 2,
          },
          data: {
            label: "",
            shape: payload.shape,
          },
          style: {
            width: payload.width,
            height: payload.height,
          }
        };

        setNodes((nds) => nds.concat(newNode));
      } catch (e) {
        console.error("Drop error", e);
      }
    },
    [screenToFlowPosition, setNodes]
  );

  const params = useParams();
  const projectId = (Array.isArray(params?.roomId) ? params.roomId[0] : params?.roomId) ?? "";
  const saveStatus = useCanvasAutosave({ projectId, nodes, edges });

  // Alignment Logic
  const alignNodes = useCallback((alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    const selected = nodes.filter(n => n.selected && n.type === 'canvasNode');
    if (selected.length < 2) return;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    selected.forEach(n => {
      const x = n.position.x;
      const y = n.position.y;
      const w = n.style?.width as number || 120;
      const h = n.style?.height as number || 60;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x + w > maxX) maxX = x + w;
      if (y + h > maxY) maxY = y + h;
    });

    const centerX = minX + (maxX - minX) / 2;
    const centerY = minY + (maxY - minY) / 2;

    setNodes((nds) => nds.map(n => {
      if (n.selected && n.type === 'canvasNode') {
        const w = n.style?.width as number || 120;
        const h = n.style?.height as number || 60;
        let newPos = { ...n.position };

        switch (alignment) {
          case 'left':
            newPos.x = minX;
            break;
          case 'center':
            newPos.x = centerX - w / 2;
            break;
          case 'right':
            newPos.x = maxX - w;
            break;
          case 'top':
            newPos.y = minY;
            break;
          case 'middle':
            newPos.y = centerY - h / 2;
            break;
          case 'bottom':
            newPos.y = maxY - h;
            break;
        }

        return { ...n, position: newPos };
      }
      return n;
    }));
  }, [nodes, setNodes]);

  // Grouping Logic
  const groupSelectedNodes = useCallback(() => {
    const selected = nodes.filter(n => n.selected && n.type === 'canvasNode');
    if (selected.length < 2) return;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    selected.forEach(n => {
      const x = n.position.x;
      const y = n.position.y;
      const w = n.style?.width as number || 120;
      const h = n.style?.height as number || 60;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x + w > maxX) maxX = x + w;
      if (y + h > maxY) maxY = y + h;
    });

    const padding = 40;
    const parentX = minX - padding;
    const parentY = minY - padding;
    const parentW = (maxX - minX) + padding * 2;
    const parentH = (maxY - minY) + padding * 2;

    const timestamp = Date.now();
    const groupId = `group-${timestamp}`;

    const groupNode: CanvasNodeType = {
      id: groupId,
      type: "canvasNode",
      position: { x: parentX, y: parentY },
      data: {
        label: "Group Container",
        shape: "group",
      },
      style: {
        width: parentW,
        height: parentH,
        zIndex: -1,
      }
    };

    const updatedNodes: CanvasNodeType[] = nodes.map(n => {
      if (n.selected && n.type === 'canvasNode') {
        return {
          ...n,
          parentId: groupId,
          extent: 'parent' as const,
          position: {
            x: n.position.x - parentX,
            y: n.position.y - parentY
          }
        };
      }
      return n;
    });

    setNodes(updatedNodes.concat(groupNode));
  }, [nodes, setNodes]);

  // Ungrouping Logic
  const ungroupSelectedNodes = useCallback(() => {
    const selected = nodes.filter(n => n.selected);
    const groupIdsToUngroup = new Set<string>();

    selected.forEach(n => {
      if (n.data?.shape === 'group') {
        groupIdsToUngroup.add(n.id);
      }
      if (n.parentId) {
        groupIdsToUngroup.add(n.parentId);
      }
    });

    if (groupIdsToUngroup.size === 0) return;

    setNodes((nds) => {
      const groupNodesMap = new Map<string, { x: number; y: number }>();
      nds.forEach(n => {
        if (groupIdsToUngroup.has(n.id)) {
          groupNodesMap.set(n.id, { x: n.position.x, y: n.position.y });
        }
      });

      return nds
        .filter(n => !groupIdsToUngroup.has(n.id) || !selected.some(s => s.id === n.id && s.data?.shape === 'group'))
        .map(n => {
          if (n.parentId && groupIdsToUngroup.has(n.parentId)) {
            const parentPos = groupNodesMap.get(n.parentId) || { x: 0, y: 0 };
            const absoluteX = parentPos.x + n.position.x;
            const absoluteY = parentPos.y + n.position.y;
            const { parentId, extent, ...rest } = n as any;
            return {
              ...rest,
              position: { x: absoluteX, y: absoluteY }
            } as CanvasNodeType;
          }
          return n;
        });
    });
  }, [nodes, setNodes]);

  // Import/Export Logic
  const exportJSON = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ nodes, edges }));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `canvas-export-${projectId || "project"}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [nodes, edges, projectId]);

  const handleImportJSON = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
          setNodes(parsed.nodes);
          setEdges(parsed.edges);
        } else {
          alert("Invalid file format. JSON must contain nodes and edges arrays.");
        }
      } catch (err) {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [setNodes, setEdges]);

  const exportPNG = useCallback(() => {
    const flowElement = document.querySelector(".react-flow") as HTMLElement;
    if (!flowElement) return;
    toPng(flowElement, {
      backgroundColor: "#0b0b0c",
    })
      .then((dataUrl) => {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `canvas-${projectId || "export"}.png`;
        a.click();
      })
      .catch((err) => {
        console.error("Export PNG failed", err);
      });
  }, [projectId]);

  const exportSVG = useCallback(() => {
    const flowElement = document.querySelector(".react-flow") as HTMLElement;
    if (!flowElement) return;
    toSvg(flowElement, {
      backgroundColor: "#0b0b0c",
    })
      .then((dataUrl) => {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `canvas-${projectId || "export"}.svg`;
        a.click();
      })
      .catch((err) => {
        console.error("Export SVG failed", err);
      });
  }, [projectId]);

  // Context Menu Handlers
  const onNodeContextMenu = useCallback((event: any, node: any) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      visible: true,
      nodeId: node.id
    });
  }, []);

  const onEdgeContextMenu = useCallback((event: any, edge: any) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      visible: true,
      edgeId: edge.id
    });
  }, []);

  const onPaneContextMenu = useCallback((event: any) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      visible: true
    });
  }, []);

  useEffect(() => {
    const handleCloseMenu = () => {
      setContextMenu(null);
    };
    window.addEventListener("click", handleCloseMenu);
    return () => window.removeEventListener("click", handleCloseMenu);
  }, []);

  const selectedNodes = nodes.filter(n => n.selected && n.type === 'canvasNode');

  return (
    <div className="w-full h-full relative">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImportJSON} 
        accept=".json" 
        className="hidden" 
      />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodesDelete={(deletedNodes) => onDelete({ nodes: deletedNodes, edges: [] })}
        onEdgesDelete={(deletedEdges) => onDelete({ nodes: [], edges: deletedEdges })}
        onDragOver={onDragOver}
        onDrop={onDrop}
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={{
          type: "canvasEdge",
        }}
        fitView
        panOnScroll={true}
        zoomOnScroll={false}
        zoomOnPinch={true}
        minZoom={0.1}
        maxZoom={2}
        snapToGrid={isSnapToGrid}
        snapGrid={[15, 15]}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
      >
        <svg style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0 }}>
          <defs>
            <marker id="arrow-default" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#52525b" />
            </marker>
            <marker id="arrow-hovered" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#a1a1aa" />
            </marker>
            <marker id="arrow-selected" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#06b6d4" />
            </marker>
          </defs>
        </svg>
        <Background variant={BackgroundVariant.Dots} color="#ffffff30" />
        <Cursors components={{ Cursor: CursorWithThinking }} />
        
        <Panel position="top-right" className="mt-4 mr-4">
          <PresenceAvatars />
        </Panel>

        {selectedNodes.length > 1 && (
          <Panel position="top-center" className="mt-4">
            <div className="flex items-center gap-1.5 p-1.5 bg-card/90 border border-border rounded-xl shadow-2xl backdrop-blur-xl nodrag nopan">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-cyan-400 hover:bg-white/[0.04]"
                onClick={() => alignNodes('left')}
                title="Align Left"
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-cyan-400 hover:bg-white/[0.04]"
                onClick={() => alignNodes('center')}
                title="Align Center"
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-cyan-400 hover:bg-white/[0.04]"
                onClick={() => alignNodes('right')}
                title="Align Right"
              >
                <AlignRight className="h-4 w-4" />
              </Button>
              <div className="w-px h-4 bg-border/60 mx-0.5" />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-cyan-400 hover:bg-white/[0.04]"
                onClick={() => alignNodes('top')}
                title="Align Top"
              >
                <AlignStartVertical className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-cyan-400 hover:bg-white/[0.04]"
                onClick={() => alignNodes('middle')}
                title="Align Middle"
              >
                <AlignCenterVertical className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-cyan-400 hover:bg-white/[0.04]"
                onClick={() => alignNodes('bottom')}
                title="Align Bottom"
              >
                <AlignEndVertical className="h-4 w-4" />
              </Button>
              <div className="w-px h-4 bg-border/60 mx-0.5" />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-cyan-400 hover:bg-white/[0.04]"
                onClick={groupSelectedNodes}
                title="Group Nodes"
              >
                <Folder className="h-4 w-4" />
              </Button>
            </div>
          </Panel>
        )}

        {nodes.some(n => n.selected && (n.parentId || n.data?.shape === 'group')) && (
          <Panel position="top-center" className="mt-4">
            <div className="flex items-center gap-1.5 p-1.5 bg-card/90 border border-border rounded-xl shadow-2xl backdrop-blur-xl nodrag nopan">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={ungroupSelectedNodes}
                title="Ungroup / Delete Container"
              >
                <FolderMinus className="h-4 w-4" />
              </Button>
              <span className="text-[10px] text-muted-foreground px-1">Release from Container</span>
            </div>
          </Panel>
        )}

        <Panel position="bottom-left" className="mb-6 ml-6">
          <div className="flex items-center gap-1.5 p-1.5 bg-card/80 border border-border rounded-full shadow-2xl backdrop-blur-xl">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-muted-foreground hover:text-cyan-400 hover:bg-white/[0.04] transition-colors"
                onClick={() => reactFlowInstance.zoomOut({ duration: 200 })}
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-muted-foreground hover:text-cyan-400 hover:bg-white/[0.04] transition-colors"
                onClick={() => reactFlowInstance.fitView({ duration: 200 })}
                title="Fit View"
              >
                <Maximize className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-muted-foreground hover:text-cyan-400 hover:bg-white/[0.04] transition-colors"
                onClick={() => reactFlowInstance.zoomIn({ duration: 200 })}
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="w-px h-5 bg-border mx-1" />
            
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-muted-foreground hover:text-cyan-400 hover:bg-white/[0.04] disabled:opacity-50 transition-colors"
                onClick={undo}
                disabled={!canUndo}
                title="Undo (Cmd+Z)"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-muted-foreground hover:text-cyan-400 hover:bg-white/[0.04] disabled:opacity-50 transition-colors"
                onClick={redo}
                disabled={!canRedo}
                title="Redo (Cmd+Shift+Z)"
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="w-px h-5 bg-border mx-1" />
            
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 rounded-full transition-colors ${
                  isSnapToGrid 
                    ? "text-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20" 
                    : "text-muted-foreground hover:text-cyan-400 hover:bg-white/[0.04]"
                }`}
                onClick={() => setIsSnapToGrid(prev => !prev)}
                title={isSnapToGrid ? "Disable Snap to Grid" : "Enable Snap to Grid"}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Panel>

        <Panel position="bottom-right" className="mb-6 mr-6">
          <div className="flex items-center gap-1.5 p-1.5 bg-card/80 border border-border rounded-full shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-muted-foreground hover:text-cyan-400 hover:bg-white/[0.04] transition-colors"
                onClick={() => fileInputRef.current?.click()}
                title="Import JSON"
              >
                <Upload className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-muted-foreground hover:text-cyan-400 hover:bg-white/[0.04] transition-colors"
                onClick={exportJSON}
                title="Export JSON"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-muted-foreground hover:text-cyan-400 hover:bg-white/[0.04] transition-colors"
                onClick={exportPNG}
                title="Export PNG Image"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-muted-foreground hover:text-cyan-400 hover:bg-white/[0.04] transition-colors font-semibold text-[10px]"
                onClick={exportSVG}
                title="Export SVG"
              >
                SVG
              </Button>
            </div>

            <div className="w-px h-5 bg-border mx-1" />
            <div className="flex items-center text-xs text-muted-foreground font-medium min-w-16 justify-center pr-2">
              {saveStatus === "saving" && "Saving..."}
              {saveStatus === "saved" && "Saved"}
              {saveStatus === "error" && <span className="text-red-400">Error</span>}
            </div>
          </div>
        </Panel>
        
        <Panel position="top-left" className="!top-1/2 -!translate-y-1/2 mt-0 ml-4">
          <ShapePanel group="basic" />
        </Panel>

        <Panel position="bottom-center" className="mb-6">
          <ShapePanel group="special" />
        </Panel>
      </ReactFlow>

      {contextMenu && contextMenu.visible && (
        <div 
          className="fixed bg-card/95 backdrop-blur border border-border rounded-xl shadow-2xl p-1.5 z-[99999] nodrag nopan min-w-44 flex flex-col gap-0.5"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          {contextMenu.nodeId && (
            <>
              <button
                onClick={() => {
                  const node = nodes.find(n => n.id === contextMenu.nodeId);
                  if (node) {
                    const zIndices = nodes.map((n) => typeof n.style?.zIndex === 'number' ? n.style.zIndex : 0);
                    const maxZ = Math.max(...zIndices, 0);
                    setNodes(nds => nds.map(n => n.id === node.id ? { ...n, style: { ...n.style, zIndex: maxZ + 1 } } : n));
                  }
                }}
                className="w-full text-left px-2 py-1.5 hover:bg-white/[0.04] rounded-lg text-xs text-muted-foreground hover:text-white transition-colors"
              >
                Bring to Front
              </button>
              <button
                onClick={() => {
                  const node = nodes.find(n => n.id === contextMenu.nodeId);
                  if (node) {
                    const zIndices = nodes.map((n) => typeof n.style?.zIndex === 'number' ? n.style.zIndex : 0);
                    const minZ = Math.min(...zIndices, 0);
                    setNodes(nds => nds.map(n => n.id === node.id ? { ...n, style: { ...n.style, zIndex: minZ - 1 } } : n));
                  }
                }}
                className="w-full text-left px-2 py-1.5 hover:bg-white/[0.04] rounded-lg text-xs text-muted-foreground hover:text-white transition-colors"
              >
                Send to Back
              </button>
              <button
                onClick={() => {
                  const node = nodes.find(n => n.id === contextMenu.nodeId);
                  if (node) {
                    const timestamp = Date.now();
                    const newNode = {
                      ...node,
                      id: `${node.data.shape}-${timestamp}`,
                      position: { x: node.position.x + 30, y: node.position.y + 30 },
                      selected: true,
                    };
                    setNodes(nds => nds.map(n => ({...n, selected: false})).concat(newNode));
                  }
                }}
                className="w-full text-left px-2 py-1.5 hover:bg-white/[0.04] rounded-lg text-xs text-muted-foreground hover:text-white transition-colors"
              >
                Duplicate
              </button>
              <button
                onClick={() => {
                  reactFlowInstance.deleteElements({ nodes: [{ id: contextMenu.nodeId! }] });
                }}
                className="w-full text-left px-2 py-1.5 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-xs text-red-500 transition-colors"
              >
                Delete Node
              </button>
            </>
          )}

          {contextMenu.edgeId && (
            <button
              onClick={() => {
                reactFlowInstance.deleteElements({ edges: [{ id: contextMenu.edgeId! }] });
              }}
              className="w-full text-left px-2 py-1.5 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-xs text-red-500 transition-colors"
            >
              Delete Connector
            </button>
          )}

          {!contextMenu.nodeId && !contextMenu.edgeId && (
            <>
              <button
                onClick={() => {
                  setNodes(nds => nds.map(n => ({ ...n, selected: true })));
                }}
                className="w-full text-left px-2 py-1.5 hover:bg-white/[0.04] rounded-lg text-xs text-muted-foreground hover:text-white transition-colors"
              >
                Select All
              </button>
              <button
                onClick={() => {
                  exportJSON();
                }}
                className="w-full text-left px-2 py-1.5 hover:bg-white/[0.04] rounded-lg text-xs text-muted-foreground hover:text-white transition-colors"
              >
                Export Canvas (JSON)
              </button>
              <button
                onClick={() => {
                  setIsSnapToGrid(prev => !prev);
                }}
                className="w-full text-left px-2 py-1.5 hover:bg-white/[0.04] rounded-lg text-xs text-muted-foreground hover:text-white transition-colors"
              >
                {isSnapToGrid ? "Disable Grid Snapping" : "Enable Grid Snapping"}
              </button>
              <button
                onClick={() => {
                  setNodes([]);
                  setEdges([]);
                }}
                className="w-full text-left px-2 py-1.5 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-xs text-red-500 transition-colors"
              >
                Clear Canvas
              </button>
            </>
          )}
        </div>
      )}
      
      <StarterTemplatesModal 
        isOpen={isTemplatesOpen} 
        onClose={() => setIsTemplatesOpen(false)} 
        onImport={handleImport} 
      />
    </div>
  );
}

export function CanvasFlow() {
  return <Flow />;
}
