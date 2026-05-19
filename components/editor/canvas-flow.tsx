"use client";

import { useCallback, useState, useEffect } from "react";
import { ReactFlow, Background, BackgroundVariant, ConnectionMode, useReactFlow, ReactFlowProvider, Panel } from "@xyflow/react";
import { useLiveblocksFlow, Cursors } from "@liveblocks/react-flow";
import { useUndo, useRedo, useCanUndo, useCanRedo, useOther } from "@liveblocks/react";
import { Cursor as LiveblocksCursor } from "@liveblocks/react-ui";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { CanvasNode } from "./nodes/canvas-node";
import { ShapePanel } from "./shape-panel";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize, Undo2, Redo2, Loader2 } from "lucide-react";
import { CanvasEdge } from "./edges/canvas-edge";
import { StarterTemplatesModal } from "./starter-templates-modal";
import { CanvasTemplate } from "./starter-templates";
import { useCanvasAutosave } from "@/hooks/use-canvas-autosave";
import { useParams } from "next/navigation";
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
    useLiveblocksFlow({
      suspense: true,
      nodes: {
        initial: [],
      },
      edges: {
        initial: [],
      },
    });

  const reactFlowInstance = useReactFlow();
  const { screenToFlowPosition, setNodes, setEdges } = reactFlowInstance;

  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);

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

        const newNode = {
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

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
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
        <Panel position="bottom-left" className="mb-6 ml-6">
          <div className="flex items-center gap-1 p-1 bg-[#18181b] border border-white/10 rounded-full shadow-lg">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-white/10"
                onClick={() => reactFlowInstance.zoomOut({ duration: 200 })}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-white/10"
                onClick={() => reactFlowInstance.fitView({ duration: 200 })}
              >
                <Maximize className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-white/10"
                onClick={() => reactFlowInstance.zoomIn({ duration: 200 })}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-white/10 disabled:opacity-50"
                onClick={undo}
                disabled={!canUndo}
              >
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-white/10 disabled:opacity-50"
                onClick={redo}
                disabled={!canRedo}
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <div className="flex items-center text-xs text-zinc-400 min-w-15 justify-center">
              {saveStatus === "saving" && "Saving..."}
              {saveStatus === "saved" && "Saved"}
              {saveStatus === "error" && <span className="text-red-400">Error</span>}
            </div>
          </div>
        </Panel>
        <Panel position="bottom-center" className="mb-6">
          <ShapePanel />
        </Panel>
      </ReactFlow>
      
      <StarterTemplatesModal 
        isOpen={isTemplatesOpen} 
        onClose={() => setIsTemplatesOpen(false)} 
        onImport={handleImport} 
      />
    </div>
  );
}

export function CanvasFlow() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
