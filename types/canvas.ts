import { Node, Edge } from '@xyflow/react';

export type CanvasNodeData = {
  label: string;
  color?: string;
  shape?: 'rectangle' | 'circle' | 'diamond' | 'cylinder' | 'pill' | 'hexagon';
};

export type CanvasNode = Node<CanvasNodeData, 'canvasNode'>;
export type CanvasEdge = Edge;
