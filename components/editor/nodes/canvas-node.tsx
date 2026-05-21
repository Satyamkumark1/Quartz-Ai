"use client";

import { Handle, Position, NodeResizer, useReactFlow, NodeToolbar } from "@xyflow/react";
import { CanvasNodeData, NODE_COLOR_PALETTE } from "@/types/canvas";
import { useState, useRef, useEffect } from "react";
import { 
  Trash2, 
  ArrowUpToLine, 
  ArrowDownToLine,
  Server, 
  Database, 
  Cloud, 
  User, 
  Shield, 
  Cpu, 
  Globe, 
  MessageSquare
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  server: Server,
  database: Database,
  cloud: Cloud,
  user: User,
  shield: Shield,
  cpu: Cpu,
  globe: Globe,
  messageSquare: MessageSquare,
};


interface CanvasNodeProps {
  id: string;
  data: CanvasNodeData;
  selected?: boolean;
  width?: number;
  height?: number;
}

export function CanvasNode({ id, data, selected, width = 120, height = 60 }: CanvasNodeProps) {
  const shape = data.shape || "rectangle";
  const isText = shape === "text";
  const isSvgShape = ["diamond", "hexagon", "cylinder", "triangle", "star", "parallelogram", "arrow"].includes(shape);
  const w = width;
  const h = height;

  const nodeColorConfig = NODE_COLOR_PALETTE.find(c => c.name === data.color) || NODE_COLOR_PALETTE[0];
  const fillColor = isText ? "transparent" : nodeColorConfig.bg;
  const textColor = nodeColorConfig.text;
  const strokeColor = selected ? "#22d3ee" : (isText ? "transparent" : nodeColorConfig.border);

  const borderStyleVal = data.borderStyle || "solid";
  const opacityVal = data.opacity !== undefined ? data.opacity : 1;
  const shadowVal = data.shadow || "md";

  const shadowStyles = {
    none: "none",
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.3)",
    md: selected ? "0 0 20px rgba(34,211,238,0.4), inset 0 0 20px rgba(34,211,238,0.1)" : "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
    lg: selected ? "0 0 25px rgba(34,211,238,0.5), inset 0 0 25px rgba(34,211,238,0.2)" : "0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.4)",
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(data.label);
  const { setNodes, deleteElements } = useReactFlow();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTimeout(() => setEditLabel(data.label), 0);
  }, [data.label]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Move cursor to the end
      inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length);
    }
  }, [isEditing]);

  const onDoubleClick = () => {
    setIsEditing(true);
  };

  const submitLabel = () => {
    if (!isEditing) return;
    setIsEditing(false);
    setNodes((nds) => 
      nds.map((n) => 
        n.id === id 
          ? { ...n, data: { ...n.data, label: editLabel } } 
          : n
      )
    );
  };

  const onDelete = () => {
    deleteElements({ nodes: [{ id }] });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitLabel();
    }
    if (e.key === "Escape") {
      setIsEditing(false);
      setEditLabel(data.label);
    }
  };

  const bringToFront = () => {
    setNodes((nds) => {
      const zIndices = nds.map((n) => typeof n.style?.zIndex === 'number' ? n.style.zIndex : 0);
      const maxZIndex = zIndices.length > 0 ? Math.max(...zIndices) : 0;
      return nds.map((n) =>
        n.id === id
          ? { ...n, style: { ...n.style, zIndex: maxZIndex + 1 } }
          : n
      );
    });
  };

  const sendToBack = () => {
    setNodes((nds) => {
      const zIndices = nds.map((n) => typeof n.style?.zIndex === 'number' ? n.style.zIndex : 0);
      const minZIndex = zIndices.length > 0 ? Math.min(...zIndices) : 0;
      return nds.map((n) =>
        n.id === id
          ? { ...n, style: { ...n.style, zIndex: minZIndex - 1 } }
          : n
      );
    });
  };

  const renderSvgShape = () => {
    const strokeWidth = selected ? 3 : 2;
    const inset = strokeWidth / 2;
    const strokeDasharray = borderStyleVal === "dashed" ? "6,6" : borderStyleVal === "dotted" ? "2,4" : undefined;
    const commonProps = {
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth,
      strokeDasharray,
      className: "transition-all duration-300 ease-in-out",
      filter: selected ? "drop-shadow(0 0 12px rgba(34,211,238,0.4))" : "drop-shadow(0 4px 6px rgba(0,0,0,0.5))",
    };

    switch (shape) {
      case "diamond":
        return <polygon points={`${w / 2},${inset} ${w - inset},${h / 2} ${w / 2},${h - inset} ${inset},${h / 2}`} {...commonProps} />;
      case "hexagon":
        return <polygon points={`${w * 0.25},${inset} ${w * 0.75},${inset} ${w - inset},${h / 2} ${w * 0.75},${h - inset} ${w * 0.25},${h - inset} ${inset},${h / 2}`} {...commonProps} />;
      case "cylinder": {
        const ry = h * 0.15;
        const rx = w / 2 - inset;
        return (
          <>
            <path d={`M ${inset} ${ry + inset} L ${inset} ${h - ry - inset} A ${rx} ${ry} 0 0 0 ${w - inset} ${h - ry - inset} L ${w - inset} ${ry + inset} A ${rx} ${ry} 0 0 1 ${inset} ${ry + inset} Z`} {...commonProps} />
            <ellipse cx={w / 2} cy={ry + inset} rx={rx} ry={ry} {...commonProps} />
          </>
        );
      }
      case "triangle":
        return <polygon points={`${w / 2},${inset} ${w - inset},${h - inset} ${inset},${h - inset}`} {...commonProps} />;
      case "star": {
        const points = [
          [w * 0.5, inset],
          [w * 0.62, h * 0.38],
          [w - inset, h * 0.38],
          [w * 0.69, h * 0.58],
          [w * 0.8, h * 0.95 - inset],
          [w * 0.5, h * 0.75],
          [w * 0.2, h * 0.95 - inset],
          [w * 0.31, h * 0.58],
          [inset, h * 0.38],
          [w * 0.38, h * 0.38]
        ].map(p => p.join(',')).join(' ');
        return <polygon points={points} {...commonProps} />;
      }
      case "parallelogram":
        return <polygon points={`${w * 0.25},${inset} ${w - inset},${inset} ${w * 0.75},${h - inset} ${inset},${h - inset}`} {...commonProps} />;
      case "arrow": {
        const arrowPoints = [
          [inset, h * 0.3],
          [w * 0.6, h * 0.3],
          [w * 0.6, inset],
          [w - inset, h * 0.5],
          [w * 0.6, h - inset],
          [w * 0.6, h * 0.7],
          [inset, h * 0.7]
        ].map(p => p.join(',')).join(' ');
        return <polygon points={arrowPoints} {...commonProps} />;
      }
      default:
        return null;
    }
  };

  const renderCssShape = () => {
    let borderRadiusClass = "rounded-xl";
    if (shape === "circle" || shape === "pill") {
      borderRadiusClass = "rounded-full";
    } else if (shape === "group" || shape === "custom") {
      borderRadiusClass = "rounded-2xl";
    }

    if (isText) {
      return (
        <div 
          className={`absolute inset-0 w-full h-full border-dashed transition-all duration-300 ease-in-out`}
          style={{ 
            width: w, 
            height: h, 
            backgroundColor: 'transparent', 
            borderColor: selected ? strokeColor : 'transparent',
            borderWidth: selected ? '2px' : '0px',
          }}
        />
      );
    }

    if (shape === "group") {
      return (
        <div 
          className={`absolute inset-0 w-full h-full rounded-2xl border-2 border-dashed transition-all duration-300 ease-in-out`}
          style={{
            width: w,
            height: h,
            backgroundColor: selected ? "rgba(34,211,238,0.06)" : "rgba(255,255,255,0.02)",
            borderColor: selected ? strokeColor : "rgba(255,255,255,0.15)",
            borderWidth: "2px",
            opacity: opacityVal,
          }}
        />
      );
    }

    return (
      <div 
        className={`absolute inset-0 w-full h-full ${borderRadiusClass} transition-all duration-300 ease-in-out`}
        style={{ 
          width: w, 
          height: h, 
          backgroundColor: fillColor, 
          borderColor: strokeColor,
          borderWidth: selected ? '3px' : '2px',
          borderStyle: borderStyleVal,
          opacity: opacityVal,
          boxShadow: shadowStyles[shadowVal],
        }}
      />
    );
  };

  return (
    <div className="group relative w-full h-full">
      <NodeToolbar
        isVisible={selected}
        position={Position.Top}
        className="flex flex-col gap-1.5 p-1.5 bg-card/90 backdrop-blur-xl border border-border rounded-xl shadow-2xl nodrag nopan mb-2 min-w-[260px] z-[9999]"
      >
        <div className="flex items-center gap-1.5 w-full">
          <div className="flex gap-1 pr-1.5 border-r border-border mr-1.5">
            {NODE_COLOR_PALETTE.map((palette) => (
              <button
                key={palette.name}
                className={`w-5 h-5 rounded-full transition-all duration-300 border-[1.5px] ${
                  data.color === palette.name || (!data.color && palette.name === 'default')
                    ? 'border-primary scale-110 shadow-[0_0_10px_rgba(34,211,238,0.4)]'
                    : 'border-transparent hover:scale-110 hover:border-white/20'
                }`}
                style={{ backgroundColor: palette.bg }}
                onClick={() => {
                  setNodes((nds) => 
                    nds.map((n) => 
                      n.id === id 
                        ? { ...n, data: { ...n.data, color: palette.name } } 
                        : n
                    )
                  );
                }}
              />
            ))}
          </div>
          
          <div className="flex items-center gap-1 mr-auto">
            <button
              className="p-1 rounded hover:bg-white/[0.04] text-muted-foreground hover:text-white transition-colors"
              onClick={bringToFront}
              title="Bring to Front"
            >
              <ArrowUpToLine className="h-3.5 w-3.5" />
            </button>
            <button
              className="p-1 rounded hover:bg-white/[0.04] text-muted-foreground hover:text-white transition-colors"
              onClick={sendToBack}
              title="Send to Back"
            >
              <ArrowDownToLine className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            className="p-1 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors ml-1"
            onClick={onDelete}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 w-full pt-1.5 border-t border-border/60 text-[10px]">
          <div className="flex flex-col gap-0.5 flex-1">
            <span className="text-muted-foreground font-semibold">Border</span>
            <select
              value={borderStyleVal}
              onChange={(e) => {
                const val = e.target.value as any;
                setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, borderStyle: val } } : n));
              }}
              className="bg-zinc-800 border border-zinc-700 text-zinc-300 rounded px-1 py-0.5 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
            </select>
          </div>

          <div className="flex flex-col gap-0.5 flex-1">
            <span className="text-muted-foreground font-semibold">Opacity</span>
            <select
              value={opacityVal}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, opacity: val } } : n));
              }}
              className="bg-zinc-800 border border-zinc-700 text-zinc-300 rounded px-1 py-0.5 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="1">100%</option>
              <option value="0.75">75%</option>
              <option value="0.5">50%</option>
              <option value="0.25">25%</option>
            </select>
          </div>

          <div className="flex flex-col gap-0.5 flex-1">
            <span className="text-muted-foreground font-semibold">Shadow</span>
            <select
              value={shadowVal}
              onChange={(e) => {
                const val = e.target.value as any;
                setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, shadow: val } } : n));
              }}
              className="bg-zinc-800 border border-zinc-700 text-zinc-300 rounded px-1 py-0.5 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="none">None</option>
              <option value="sm">Soft</option>
              <option value="md">Medium</option>
              <option value="lg">Hard</option>
            </select>
          </div>

          {shape === "custom" && (
            <div className="flex flex-col gap-0.5 flex-1">
              <span className="text-muted-foreground font-semibold">Icon</span>
              <select
                value={data.icon || "server"}
                onChange={(e) => {
                  const val = e.target.value;
                  setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, icon: val } } : n));
                }}
                className="bg-zinc-800 border border-zinc-700 text-zinc-300 rounded px-1 py-0.5 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="server">Server</option>
                <option value="database">Database</option>
                <option value="cloud">Cloud</option>
                <option value="user">User</option>
                <option value="shield">Security</option>
                <option value="cpu">Compute</option>
                <option value="globe">Internet</option>
                <option value="messageSquare">Queue</option>
              </select>
            </div>
          )}
        </div>
      </NodeToolbar>

      <NodeResizer 
        color={selected ? "#22d3ee" : "rgba(255,255,255,0.1)"} 
        isVisible={selected} 
        minWidth={isText ? 20 : 40} 
        minHeight={isText ? 20 : 40}
        handleClassName="w-2.5 h-2.5 rounded-sm border-none bg-primary shadow-[0_0_10px_rgba(34,211,238,0.6)]"
        lineClassName="border-primary opacity-50"
      />
      {!isText && shape !== "group" && (
        <>
          <Handle type="source" position={Position.Top} className="w-2.5 h-2.5 !bg-primary border-none shadow-[0_0_10px_rgba(34,211,238,0.5)] z-50 opacity-0 group-hover:opacity-100 transition-all duration-300" id="top" />
          <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 !bg-primary border-none shadow-[0_0_10px_rgba(34,211,238,0.5)] z-50 opacity-0 group-hover:opacity-100 transition-all duration-300" id="bottom" />
          <Handle type="source" position={Position.Left} className="w-2.5 h-2.5 !bg-primary border-none shadow-[0_0_10px_rgba(34,211,238,0.5)] z-50 opacity-0 group-hover:opacity-100 transition-all duration-300" id="left" />
          <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 !bg-primary border-none shadow-[0_0_10px_rgba(34,211,238,0.5)] z-50 opacity-0 group-hover:opacity-100 transition-all duration-300" id="right" />
        </>
      )}

      <div 
        className="relative flex items-center justify-center w-full h-full" 
        style={{ width: w, height: h }}
        onDoubleClick={onDoubleClick}
      >
        {isSvgShape ? (
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none" 
            width={w} 
            height={h} 
            style={{ overflow: "visible", opacity: opacityVal }}
          >
            {renderSvgShape()}
          </svg>
        ) : (
          renderCssShape()
        )}
        
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center pointer-events-none p-2 gap-1">
          {shape === "custom" && !isEditing && (
            <div className="p-1">
              {(() => {
                const IconComp = ICON_MAP[data.icon || "server"] || Server;
                return <IconComp className="w-8 h-8 opacity-80" style={{ color: textColor }} />;
              })()}
            </div>
          )}
          
          {isEditing ? (
            <textarea
              ref={inputRef}
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              onBlur={submitLabel}
              onKeyDown={onKeyDown}
              className="w-full bg-transparent border-none outline-none text-sm font-medium text-center resize-none pointer-events-auto nodrag nopan"
              style={{ height: 'auto', minHeight: '1.5em', alignSelf: 'center', color: textColor }}
              placeholder={isText ? "Type text..." : (shape === "group" ? "Group Label..." : "Type label...")}
            />
          ) : (
            <div className={`text-sm font-medium text-center break-words max-w-[90%] pointer-events-auto select-none ${isText ? 'text-lg' : ''}`} style={{ color: textColor }}>
              {data.label || <span style={{ color: textColor, opacity: 0.7 }} className="italic">{isText ? "Type text..." : (shape === "group" ? "Group Label..." : "Type label...")}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
