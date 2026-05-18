"use client";

import { Handle, Position } from "@xyflow/react";
import { CanvasNodeData } from "@/types/canvas";

interface CanvasNodeProps {
  data: CanvasNodeData;
  selected?: boolean;
  width?: number;
  height?: number;
}

export function CanvasNode({ data, selected, width = 120, height = 60 }: CanvasNodeProps) {
  const strokeColor = selected ? "#06b6d4" : "#3f3f46"; // cyan-500 or zinc-700
  const fillColor = "#18181b"; // zinc-900

  // 1px inset to avoid clipping the stroke
  const w = width;
  const h = height;
  const strokeWidth = 2;
  const inset = strokeWidth / 2;

  const renderShape = () => {
    const commonProps = {
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth,
      className: "transition-colors duration-200",
    };

    switch (data.shape) {
      case "circle":
        return <circle cx={w / 2} cy={h / 2} r={Math.min(w, h) / 2 - inset} {...commonProps} />;
      case "pill":
        return <rect x={inset} y={inset} width={w - strokeWidth} height={h - strokeWidth} rx={Math.min(w, h) / 2} {...commonProps} />;
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
      case "rectangle":
      default:
        return <rect x={inset} y={inset} width={w - strokeWidth} height={h - strokeWidth} rx={6} {...commonProps} />;
    }
  };

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <svg className="absolute inset-0 w-full h-full" width={w} height={h} style={{ overflow: "visible" }}>
        {renderShape()}
      </svg>
      
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-zinc-400 border-none" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-zinc-400 border-none" />
      <Handle type="source" position={Position.Left} className="w-2 h-2 !bg-zinc-400 border-none" id="left" />
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-zinc-400 border-none" id="right" />
      
      <div className="relative z-10 text-sm text-zinc-100 font-medium text-center break-words max-w-[80%] pointer-events-none">
        {data.label}
      </div>
    </div>
  );
}
