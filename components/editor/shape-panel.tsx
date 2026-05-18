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

export function ShapePanel() {
  const onDragStart = (event: React.DragEvent, shapeType: string, width: number, height: number) => {
    const payload = JSON.stringify({ shape: shapeType, width, height });
    event.dataTransfer.setData("application/reactflow", payload);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
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
  );
}
