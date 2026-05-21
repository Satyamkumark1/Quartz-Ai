"use client";

import React from "react";
import { Square, Diamond, Circle, Hexagon, Cylinder, Minus, Type, Triangle, Star, ArrowRight, Folder, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const SHAPES = [
  { id: "rectangle", icon: Square, width: 160, height: 100 },
  { id: "diamond", icon: Diamond, width: 120, height: 120 },
  { id: "circle", icon: Circle, width: 100, height: 100 },
  { id: "pill", icon: Minus, width: 140, height: 60 },
  { id: "cylinder", icon: Cylinder, width: 120, height: 160 },
  { id: "hexagon", icon: Hexagon, width: 120, height: 100 },
  { id: "triangle", icon: Triangle, width: 120, height: 120 },
  { id: "star", icon: Star, width: 120, height: 120 },
  { id: "parallelogram", icon: Square, width: 140, height: 90 },
  { id: "arrow", icon: ArrowRight, width: 140, height: 80 },
  { id: "group", icon: Folder, width: 240, height: 180 },
  { id: "custom", icon: PlusCircle, width: 100, height: 100 },
  { id: "text", icon: Type, width: 120, height: 40 },
];

function ShapePreview({ shape, width, height }: { shape: string; width: number; height: number }) {
  const isSvgShape = ["diamond", "hexagon", "cylinder", "triangle", "star", "parallelogram", "arrow"].includes(shape);
  const strokeColor = "rgba(255,255,255,0.15)";
  const fillColor = "#0b0b0c";

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
      case "triangle":
        return <polygon points={`${width / 2},${inset} ${width - inset},${height - inset} ${inset},${height - inset}`} {...commonProps} />;
      case "star": {
        const points = [
          [width * 0.5, inset],
          [width * 0.62, height * 0.38],
          [width - inset, height * 0.38],
          [width * 0.69, height * 0.58],
          [width * 0.8, height * 0.95 - inset],
          [width * 0.5, height * 0.75],
          [width * 0.2, height * 0.95 - inset],
          [width * 0.31, height * 0.58],
          [inset, height * 0.38],
          [width * 0.38, height * 0.38]
        ].map(p => p.join(',')).join(' ');
        return <polygon points={points} {...commonProps} />;
      }
      case "parallelogram":
        return <polygon points={`${width * 0.25},${inset} ${width - inset},${inset} ${width * 0.75},${height - inset} ${inset},${height - inset}`} {...commonProps} />;
      case "arrow": {
        const arrowPoints = [
          [inset, height * 0.3],
          [width * 0.6, height * 0.3],
          [width * 0.6, inset],
          [width - inset, height * 0.5],
          [width * 0.6, height - inset],
          [width * 0.6, height * 0.7],
          [inset, height * 0.7]
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

    if (shape === "text") {
      return (
        <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-white/15 rounded-lg text-white/40 text-sm font-medium">
          Text
        </div>
      );
    }

    if (shape === "group") {
      return (
        <div 
          className="w-full h-full bg-white/[0.01] border-2 border-dashed border-white/20 rounded-2xl flex items-center justify-center text-white/40 text-xs font-semibold"
          style={{ width, height }}
        >
          Group Container
        </div>
      );
    }

    if (shape === "custom") {
      return (
        <div 
          className="w-full h-full bg-[#0b0b0c] border-2 border-white/15 rounded-2xl flex items-center justify-center"
          style={{ width, height }}
        >
          <PlusCircle className="w-6 h-6 text-white/40" />
        </div>
      );
    }

    return (
      <div 
        className={`w-full h-full bg-[#0b0b0c] border-2 border-white/15 ${borderRadiusClass}`}
        style={{ width, height }}
      />
    );
  };

  return (
    <div 
      id={`drag-preview-${shape}`} 
      className="absolute top-0 left-0 flex items-center justify-center pointer-events-none"
      style={{ width, height, opacity: 0.8 }}
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

export function ShapePanel({ group = 'basic' }: { group?: 'basic' | 'special' }) {
  const onDragStart = (event: React.DragEvent, shapeType: string, width: number, height: number) => {
    const payload = JSON.stringify({ shape: shapeType, width, height });
    event.dataTransfer.setData("application/reactflow", payload);
    event.dataTransfer.effectAllowed = "move";
    
    const previewElement = document.getElementById(`drag-preview-${shapeType}`);
    if (previewElement) {
      event.dataTransfer.setDragImage(previewElement, width / 2, height / 2);
    }
  };

  const SHAPE_NAMES: Record<string, string> = {
    rectangle: "Rectangle",
    diamond: "Diamond",
    circle: "Circle",
    pill: "Pill",
    cylinder: "Cylinder",
    hexagon: "Hexagon",
    triangle: "Triangle",
    star: "Star",
    parallelogram: "Parallelogram",
    arrow: "Block Arrow",
    group: "Group Container",
    custom: "Custom Icon Node",
    text: "Text Label",
  };

  const BASIC_SHAPE_IDS = ["rectangle", "circle", "triangle", "diamond", "hexagon", "cylinder", "pill", "star", "parallelogram", "arrow"];
  const CONTAINER_SHAPE_IDS = ["group"];
  const SPECIAL_SHAPE_IDS = ["custom", "text"];

  const basicShapes = SHAPES.filter(s => BASIC_SHAPE_IDS.includes(s.id));
  const containerShapes = SHAPES.filter(s => CONTAINER_SHAPE_IDS.includes(s.id));
  const specialShapes = SHAPES.filter(s => SPECIAL_SHAPE_IDS.includes(s.id));

  const renderShapeButton = (shape: typeof SHAPES[number]) => {
    const Icon = shape.icon;
    return (
      <Button
        key={shape.id}
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-xl hover:bg-white/[0.04] text-muted-foreground hover:text-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.15)] cursor-grab active:cursor-grabbing flex-shrink-0 transition-all duration-300"
        draggable
        onDragStart={(e) => onDragStart(e, shape.id, shape.width, shape.height)}
        title={SHAPE_NAMES[shape.id] || shape.id}
      >
        <Icon className="h-4 w-4" />
      </Button>
    );
  };

  if (group === 'basic') {
    return (
      <>
        <div className="fixed -top-[9999px] -left-[9999px] pointer-events-none z-0">
          {basicShapes.map(shape => (
            <ShapePreview key={`preview-${shape.id}`} shape={shape.id} width={shape.width} height={shape.height} />
          ))}
        </div>

        <div className="flex flex-col items-center gap-1.5 p-1.5 bg-[#121214]/90 border border-border/80 rounded-2xl shadow-2xl backdrop-blur-xl">
          {basicShapes.map(renderShapeButton)}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed -top-[9999px] -left-[9999px] pointer-events-none z-0">
        {[...containerShapes, ...specialShapes].map(shape => (
          <ShapePreview key={`preview-${shape.id}`} shape={shape.id} width={shape.width} height={shape.height} />
        ))}
      </div>

      <div className="flex items-center gap-1.5 p-1.5 bg-[#121214]/90 border border-border/80 rounded-2xl shadow-2xl backdrop-blur-xl max-w-[90vw] overflow-x-auto">
        {/* Group Container */}
        <div className="flex items-center gap-1">
          {containerShapes.map(renderShapeButton)}
        </div>

        <div className="w-px h-5 bg-border/60 mx-1 flex-shrink-0" />

        {/* Special shapes */}
        <div className="flex items-center gap-1">
          {specialShapes.map(renderShapeButton)}
        </div>
      </div>
    </>
  );
}

