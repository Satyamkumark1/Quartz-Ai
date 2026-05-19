"use client";

import { Handle, Position, NodeResizer, useReactFlow, NodeToolbar } from "@xyflow/react";
import { CanvasNodeData, NODE_COLOR_PALETTE } from "@/types/canvas";
import { useState, useRef, useEffect } from "react";

interface CanvasNodeProps {
  id: string;
  data: CanvasNodeData;
  selected?: boolean;
  width?: number;
  height?: number;
}

export function CanvasNode({ id, data, selected, width = 120, height = 60 }: CanvasNodeProps) {
  const shape = data.shape || "rectangle";
  const isSvgShape = ["diamond", "hexagon", "cylinder"].includes(shape);
  const w = width;
  const h = height;

  const nodeColorConfig = NODE_COLOR_PALETTE.find(c => c.name === data.color) || NODE_COLOR_PALETTE[0];
  const fillColor = nodeColorConfig.bg;
  const textColor = nodeColorConfig.text;
  const strokeColor = selected ? "#06b6d4" : nodeColorConfig.border;

  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(data.label);
  const { setNodes } = useReactFlow();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditLabel(data.label);
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
    const strokeWidth = 2;
    const inset = strokeWidth / 2;
    const commonProps = {
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth,
      className: "transition-colors duration-200",
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
    let borderRadiusClass = "rounded-md";
    if (shape === "circle" || shape === "pill") {
      borderRadiusClass = "rounded-full";
    }

    return (
      <div 
        className={`absolute inset-0 w-full h-full border-2 ${borderRadiusClass} transition-colors duration-200`}
        style={{ width: w, height: h, backgroundColor: fillColor, borderColor: strokeColor }}
      />
    );
  };

  return (
    <div className="group relative w-full h-full">
      <NodeToolbar
        isVisible={selected}
        position={Position.Top}
        className="flex gap-1 p-1 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg nodrag nopan"
      >
        {NODE_COLOR_PALETTE.map((palette) => (
          <button
            key={palette.name}
            className={`w-6 h-6 rounded-full transition-all duration-200 border-2 ${
              data.color === palette.name || (!data.color && palette.name === 'default')
                ? 'border-zinc-200 scale-110'
                : 'border-transparent hover:scale-110'
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
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 0 8px ${palette.text}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        ))}
      </NodeToolbar>

      <NodeResizer 
        color={selected ? "#06b6d4" : "#3f3f46"} 
        isVisible={selected} 
        minWidth={40} 
        minHeight={40}
        handleClassName="w-2 h-2 rounded-sm border-none bg-cyan-500"
        lineClassName="border-cyan-500"
      />
      <Handle type="source" position={Position.Top} className="w-2.5 h-2.5 !bg-white border border-zinc-800 z-50 opacity-0 group-hover:opacity-100 transition-opacity" id="top" />
      <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 !bg-white border border-zinc-800 z-50 opacity-0 group-hover:opacity-100 transition-opacity" id="bottom" />
      <Handle type="source" position={Position.Left} className="w-2.5 h-2.5 !bg-white border border-zinc-800 z-50 opacity-0 group-hover:opacity-100 transition-opacity" id="left" />
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 !bg-white border border-zinc-800 z-50 opacity-0 group-hover:opacity-100 transition-opacity" id="right" />

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
              placeholder="Type label..."
            />
          ) : (
            <div className="text-sm font-medium text-center break-words max-w-[90%] pointer-events-auto select-none" style={{ color: textColor }}>
              {data.label || <span style={{ color: textColor, opacity: 0.7 }} className="italic">Type label...</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
