import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CANVAS_TEMPLATES, CanvasTemplate } from "./starter-templates";
import { NODE_COLOR_PALETTE } from "@/types/canvas";

interface StarterTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (template: CanvasTemplate) => void;
}

// A simple preview component that renders nodes and edges as lightweight SVG
function TemplatePreview({ template }: { template: CanvasTemplate }) {
  // Calculate bounding box for viewBox
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  template.nodes.forEach((node) => {
    const x = node.position.x;
    const y = node.position.y;
    const w = node.style?.width ? (node.style.width as number) : 100;
    const h = node.style?.height ? (node.style.height as number) : 60;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + w);
    maxY = Math.max(maxY, y + h);
  });

  // Add some padding
  const padding = 40;
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;
  
  const width = maxX - minX;
  const height = maxY - minY;

  return (
    <svg 
      viewBox={`${minX} ${minY} ${width} ${height}`} 
      className="w-full h-full text-zinc-500"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Draw edges as simple lines connecting node centers */}
      {template.edges.map((edge) => {
        const sourceNode = template.nodes.find(n => n.id === edge.source);
        const targetNode = template.nodes.find(n => n.id === edge.target);
        
        if (!sourceNode || !targetNode) return null;
        
        const sW = (sourceNode.style?.width as number) || 100;
        const sH = (sourceNode.style?.height as number) || 60;
        const tW = (targetNode.style?.width as number) || 100;
        const tH = (targetNode.style?.height as number) || 60;

        const sX = sourceNode.position.x + sW / 2;
        const sY = sourceNode.position.y + sH / 2;
        const tX = targetNode.position.x + tW / 2;
        const tY = targetNode.position.y + tH / 2;

        return (
          <line 
            key={edge.id}
            x1={sX} 
            y1={sY} 
            x2={tX} 
            y2={tY} 
            stroke="currentColor" 
            strokeWidth="2"
            opacity="0.5"
          />
        );
      })}

      {/* Draw nodes as simple rectangles with theme colors */}
      {template.nodes.map((node) => {
        const colorName = node.data.color || "default";
        const palette = NODE_COLOR_PALETTE.find(p => p.name === colorName) || NODE_COLOR_PALETTE[0];
        
        const x = node.position.x;
        const y = node.position.y;
        const w = (node.style?.width as number) || 100;
        const h = (node.style?.height as number) || 60;
        
        return (
          <g key={node.id}>
            <rect 
              x={x} 
              y={y} 
              width={w} 
              height={h} 
              rx="8" 
              fill={palette.bg}
              stroke={palette.border}
              strokeWidth="2"
            />
          </g>
        );
      })}
    </svg>
  );
}

export function StarterTemplatesModal({ isOpen, onClose, onImport }: StarterTemplatesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] flex flex-col bg-card/80 backdrop-blur-2xl border-border text-foreground p-0 shadow-2xl rounded-2xl overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border shrink-0 bg-background/40">
          <DialogTitle className="text-xl font-semibold tracking-tight">Starter Templates</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose a template to quickly start your diagram. This will replace your current canvas.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CANVAS_TEMPLATES.map((template) => (
              <div 
                key={template.id}
                className="flex flex-col bg-background/60 border border-border rounded-xl overflow-hidden hover:border-primary/40 hover:bg-white/[0.02] hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all duration-300 group"
              >
                <div className="h-40 bg-black/40 border-b border-border p-4 flex items-center justify-center relative overflow-hidden">
                  <TemplatePreview template={template} />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-semibold text-foreground mb-1.5 tracking-tight">{template.name}</h3>
                  <p className="text-[13px] text-muted-foreground mb-5 flex-1 leading-relaxed">{template.description}</p>
                  <Button 
                    className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 hover:border-primary font-medium transition-all duration-300 rounded-xl shadow-sm" 
                    onClick={() => onImport(template)}
                  >
                    Import Template
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
