"use client";

import { Handle, Position, NodeResizer, useReactFlow, NodeToolbar } from "@xyflow/react";
import { CanvasNodeData, NODE_COLOR_PALETTE } from "@/types/canvas";
import { useState, useRef, useEffect } from "react";
import { Trash2 } from "lucide-react";

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
  const isSvgShape = ["diamond", "hexagon", "cylinder"].includes(shape);
  const w = width;
  const h = height;

  const nodeColorConfig = NODE_COLOR_PALETTE.find(c => c.name === data.color) || NODE_COLOR_PALETTE[0];
  const fillColor = isText ? "transparent" : nodeColorConfig.bg;
  const textColor = nodeColorConfig.text;
  const strokeColor = selected ? "#22d3ee" : (isText ? "transparent" : nodeColorConfig.border);

  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(data.label);
  const { setNodes, setEdges, deleteElements } = useReactFlow();
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

  const renderSvgShape = () => {
    const strokeWidth = selected ? 3 : 2;
    const inset = strokeWidth / 2;
    const commonProps = {
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth,
      className: "transition-all duration-300 ease-in-out",
      filter: selected ? "drop-shadow(0 0 12px rgba(34,211,238,0.4))" : "drop-shadow(0 4px 6px rgba(0,0,0,0.5))",
    };

    switch (shape) {
      case "diamond":
        return <polygon points={`${w / 2},${inset} ${w - inset},${h / 2} ${w / 2},${h - inset} ${inset},${h / 2}`} {...commonProps} />;
      case "hexagon":
        return <polygon points={`${w * 0.25},${inset} ${w * 0.75},${inset} ${w - inset},${h / 2} ${w * 0.75},${h - inset} ${w * 0.25},${h - inset} ${inset},${h / 2}`} {...commonProps} />;
      case "cylinder":
        const ry = h * 0.15;
        const rx = w / 2 - inset;
        return (
          <>
            <path d={`M ${inset} ${ry + inset} L ${inset} ${h - ry - inset} A ${rx} ${ry} 0 0 0 ${w - inset} ${h - ry - inset} L ${w - inset} ${ry + inset} A ${rx} ${ry} 0 0 1 ${inset} ${ry + inset} Z`} {...commonProps} />
            <ellipse cx={w / 2} cy={ry + inset} rx={rx} ry={ry} {...commonProps} />
          </>
        );
      default:
        return null;
    }
  };

  const renderCssShape = () => {
    let borderRadiusClass = "rounded-xl";
    if (shape === "circle" || shape === "pill") {
      borderRadiusClass = "rounded-full";
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

    return (
      <div 
        className={`absolute inset-0 w-full h-full ${borderRadiusClass} transition-all duration-300 ease-in-out`}
        style={{ 
          width: w, 
          height: h, 
          backgroundColor: fillColor, 
          borderColor: strokeColor,
          borderWidth: selected ? '3px' : '2px',
          boxShadow: selected ? '0 0 20px rgba(34,211,238,0.4), inset 0 0 20px rgba(34,211,238,0.1)' : '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
        }}
      />
    );
  };

  return (
    <div className="group relative w-full h-full">
      <NodeToolbar
        isVisible={selected}
        position={Position.Top}
        className="flex items-center gap-1.5 p-1.5 bg-card/90 backdrop-blur-xl border border-border rounded-xl shadow-2xl nodrag nopan mb-2"
      >
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
        
        <button
          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
          onClick={onDelete}
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </NodeToolbar>

      <NodeResizer 
        color={selected ? "#22d3ee" : "rgba(255,255,255,0.1)"} 
        isVisible={selected} 
        minWidth={isText ? 20 : 40} 
        minHeight={isText ? 20 : 40}
        handleClassName="w-2.5 h-2.5 rounded-sm border-none bg-primary shadow-[0_0_10px_rgba(34,211,238,0.6)]"
        lineClassName="border-primary opacity-50"
      />
      {!isText && (
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
          <svg className="absolute inset-0 w-full h-full pointer-events-none" width={w} height={h} style={{ overflow: "visible" }}>
            {renderSvgShape()}
          </svg>
        ) : (
          renderCssShape()
        )}
        
        <div className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none p-2">
          {isEditing ? (
            <textarea
              ref={inputRef}
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              onBlur={submitLabel}
              onKeyDown={onKeyDown}
              className="w-full bg-transparent border-none outline-none text-sm font-medium text-center resize-none pointer-events-auto nodrag nopan"
              style={{ height: 'auto', minHeight: '1.5em', alignSelf: 'center', color: textColor }}
              placeholder={isText ? "Type text..." : "Type label..."}
            />
          ) : (
            <div className={`text-sm font-medium text-center break-words max-w-[90%] pointer-events-auto select-none ${isText ? 'text-lg' : ''}`} style={{ color: textColor }}>
              {data.label || <span style={{ color: textColor, opacity: 0.7 }} className="italic">{isText ? "Type text..." : "Type label..."}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
