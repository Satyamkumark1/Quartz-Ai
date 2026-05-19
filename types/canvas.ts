import { Node, Edge } from '@xyflow/react';

export const NODE_COLOR_PALETTE = [
  { name: 'default', bg: '#121214', text: '#f4f4f5', border: 'rgba(255,255,255,0.1)' },
  { name: 'blue', bg: '#081736', text: '#bfdbfe', border: 'rgba(59,130,246,0.3)' },
  { name: 'cyan', bg: '#081e22', text: '#a5f3fc', border: 'rgba(34,211,238,0.3)' },
  { name: 'green', bg: '#021f15', text: '#a7f3d0', border: 'rgba(16,185,129,0.3)' },
  { name: 'purple', bg: '#1a0b2e', text: '#ddd6fe', border: 'rgba(168,85,247,0.3)' },
  { name: 'orange', bg: '#2b1206', text: '#fde68a', border: 'rgba(249,115,22,0.3)' },
  { name: 'rose', bg: '#2f0814', text: '#fecdd3', border: 'rgba(244,63,94,0.3)' },
];

export type CanvasNodeData = {
  label: string;
  color?: string;
  shape?: 'rectangle' | 'circle' | 'diamond' | 'cylinder' | 'pill' | 'hexagon' | 'text';
};

export type CanvasNode = Node<CanvasNodeData, 'canvasNode'>;
export type CanvasEdge = Edge;
