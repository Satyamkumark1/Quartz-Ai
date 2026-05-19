import { Node, Edge } from '@xyflow/react';

export const NODE_COLOR_PALETTE = [
  { name: 'default', bg: '#18181b', text: '#f4f4f5', border: '#3f3f46' }, // zinc
  { name: 'blue', bg: '#1e3a8a', text: '#bfdbfe', border: '#1d4ed8' }, // blue
  { name: 'green', bg: '#064e3b', text: '#a7f3d0', border: '#047857' }, // emerald
  { name: 'purple', bg: '#4c1d95', text: '#ddd6fe', border: '#6d28d9' }, // violet
  { name: 'orange', bg: '#78350f', text: '#fde68a', border: '#b45309' }, // amber
  { name: 'rose', bg: '#881337', text: '#fecdd3', border: '#be123c' }, // rose
];

export type CanvasNodeData = {
  label: string;
  color?: string;
  shape?: 'rectangle' | 'circle' | 'diamond' | 'cylinder' | 'pill' | 'hexagon';
};

export type CanvasNode = Node<CanvasNodeData, 'canvasNode'>;
export type CanvasEdge = Edge;
