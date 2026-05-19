"use client";

import React from "react";
import { Square, Diamond, Circle, Hexagon, Cylinder, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";

const SHAPES = [
  { id: "rectangle", icon: Square, width: 160, height: 100 },
  { id: "diamond", icon: Diamond, width: 120, height: 120 },
  { id: "circle", icon: Circle, width: 100, height: 100 },
  { id: "pill", icon: Minus, width: 140, height: 60 },
  { id: "cylinder", icon: Cylinder, width: 120, height: 160 },
  { id: "hexagon", icon: Hexagon, width: 120, height: 100 },
];

function ShapePreview({ shape, width, height }: { shape: string; width: number; height: number }) {
  const isSvgShape = ["diamond", "hexagon", "cylinder"].includes(shape);
  const strokeColor = "#3f3f46"; // zinc-700
  const fillColor = "#18181b"; // zinc-900

  const renderSvgShape = () => {
    const strokeWidth = 2;
    const inset = strokeWidth / 2;
    const commonProps = { fill: fillColor, stroke: strokeColor, strokeWidth };

    switch (shape) {
      case "diamond":
        return <polygon points={`${width / 2},${inset} ${width - inset},${height / 2} ${width / 2},${height - inset} ${inset},${height / 2}`} {...commonProps} />;
      case "hexagon":
        return <polygon points={`${width * 0.25},${inset} ${width * 0.75},${inset} ${width - inset},${height / 2} ${width * 0.75},${height - inset} ${width * 0.25},${height - inset} ${inset},${height / 2}`} {...commonProps} />;
      case "cylinder": {
        const ry = height * 0.15;
        const rx = width / 2 - inset;
        return (
          <>
            <path d={`M ${inset} ${ry + inset} L ${inset} ${height - ry - inset} A ${rx} ${ry} 0 0 0 ${width - inset} ${height - ry - inset} L ${width - inset} ${ry + inset} A ${rx} ${ry} 0 0 1 ${inset} ${ry + inset} Z`} {...commonProps} />
            <ellipse cx={width / 2} cy={ry + inset} rx={rx} ry={ry} {...commonProps} />
          </>
        );
      }
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
        className={`w-full h-full bg-zinc-900 border-2 border-zinc-700 ${borderRadiusClass}`}
        style={{ width, height }}
      />
    );
  };

  return (
    <div 
      id={`drag-preview-${shape}`} 
      className="absolute top-0 left-0 flex items-center justify-center"
      style={{ width, height }}
    >
      {isSvgShape ? (
        <svg width={width} height={height} style={{ overflow: "visible" }}>
          {renderSvgShape()}
        </svg>
      ) : (
        renderCssShape()
      )}
    </div>
  );
}

export function ShapePanel() {
  const onDragStart = (event: React.DragEvent, shapeType: string, width: number, height: number) => {
    const payload = JSON.stringify({ shape: shapeType, width, height });
    event.dataTransfer.setData("application/reactflow", payload);
    event.dataTransfer.effectAllowed = "move";
    
    const previewElement = document.getElementById(`drag-preview-${shapeType}`);
    if (previewElement) {
      event.dataTransfer.setDragImage(previewElement, width / 2, height / 2);
    }
  };

  return (
    <>
      <div className="fixed -top-[9999px] -left-[9999px] pointer-events-none z-0">
        {SHAPES.map(shape => (
          <ShapePreview key={`preview-${shape.id}`} shape={shape.id} width={shape.width} height={shape.height} />
        ))}
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <div className="flex items-center gap-1 p-2 bg-[#0f0f11] border border-white/10 rounded-full shadow-2xl backdrop-blur-md">
          {SHAPES.map((shape) => {
            const Icon = shape.icon;
            return (
              <Button
                key={shape.id}
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-white/10 text-zinc-400 hover:text-zinc-100 cursor-grab active:cursor-grabbing"
                draggable
                onDragStart={(e) => onDragStart(e, shape.id, shape.width, shape.height)}
                title={shape.id.charAt(0).toUpperCase() + shape.id.slice(1)}
              >
                <Icon className="h-5 w-5" />
              </Button>
            );
          })}
        </div>
      </div>
    </>
  );
}
