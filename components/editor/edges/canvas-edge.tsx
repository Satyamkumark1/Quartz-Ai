"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath,
  getStraightPath,
  getBezierPath,
  useReactFlow,
} from '@xyflow/react';
import { useState, useRef, useEffect } from 'react';

export function CanvasEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  selected,
  data,
}: EdgeProps) {
  const edgeType = (data?.type as string) || 'smoothstep';
  const edgeStyle = (data?.style as string) || 'solid';

  const { setEdges } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState((data?.label as string) || '');
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const label = (data?.label as string) || '';

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const onEdgeDoubleClick = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    setEditLabel(label);
    setIsEditing(true);
  };

  const submitLabel = () => {
    if (!isEditing) return;
    setIsEditing(false);
    setEdges((eds) =>
      eds.map((e) =>
        e.id === id
          ? { ...e, data: { ...e.data, label: editLabel } }
          : e
      )
    );
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitLabel();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      submitLabel();
    }
  };

  const hasLabel = label.length > 0;
  const showHint = selected && !hasLabel && !isEditing;

  const strokeColor = selected ? '#06b6d4' : isHovered ? '#a1a1aa' : '#52525b';
  const markerUrl = selected ? 'url(#arrow-selected)' : isHovered ? 'url(#arrow-hovered)' : 'url(#arrow-default)';

  let edgePath = '';
  let labelX = 0;
  let labelY = 0;

  if (edgeType === 'straight') {
    const [path, lx, ly] = getStraightPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
    });
    edgePath = path;
    labelX = lx;
    labelY = ly;
  } else if (edgeType === 'bezier') {
    const [path, lx, ly] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });
    edgePath = path;
    labelX = lx;
    labelY = ly;
  } else {
    const [path, lx, ly] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      borderRadius: 16,
    });
    edgePath = path;
    labelX = lx;
    labelY = ly;
  }

  const dashArray = edgeStyle === 'dashed' ? '6,6' : edgeStyle === 'dotted' ? '2,4' : undefined;

  return (
    <>
      <path
        id={`${id}-interaction`}
        className="react-flow__edge-interaction"
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={onEdgeDoubleClick}
      />
      <BaseEdge
        path={edgePath}
        markerEnd={markerUrl}
        style={{
          ...style,
          strokeWidth: 2,
          stroke: strokeColor,
          strokeDasharray: dashArray,
          transition: 'stroke 0.2s',
        }}
        id={id}
      />
      
      {(hasLabel || isEditing || showHint || selected) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan flex flex-col items-center gap-1.5 z-[9999]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="flex items-center gap-1.5">
              {isEditing ? (
                <input
                  ref={inputRef}
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  onBlur={submitLabel}
                  onKeyDown={onKeyDown}
                  className="px-2 py-1 bg-zinc-800 border border-zinc-600 rounded-full text-xs text-white outline-none focus:border-cyan-500 shadow-sm"
                  style={{ width: `${Math.max(editLabel.length * 8 + 24, 60)}px`, textAlign: 'center' }}
                  placeholder="Label"
                />
              ) : (
                <div
                  className={`px-2 py-1 rounded-full text-xs cursor-pointer select-none transition-colors ${
                    showHint 
                      ? 'bg-zinc-800/50 text-zinc-500 border border-zinc-700/50 hover:bg-zinc-800' 
                      : 'bg-zinc-800 border border-zinc-700 text-zinc-300 shadow-sm hover:border-zinc-500 hover:text-white'
                  }`}
                  onDoubleClick={onEdgeDoubleClick}
                >
                  {hasLabel ? label : '+ Label'}
                </div>
              )}
            </div>

            {selected && (
              <div className="flex items-center gap-1.5 p-1 bg-zinc-800/95 backdrop-blur border border-zinc-700 rounded-lg shadow-lg text-[9px]">
                <select
                  value={edgeType}
                  onChange={(e) => {
                    const type = e.target.value;
                    setEdges((eds) => eds.map((edgeItem) => edgeItem.id === id ? { ...edgeItem, data: { ...edgeItem.data, type } } : edgeItem));
                  }}
                  className="bg-zinc-900 border border-zinc-700 text-zinc-300 rounded px-1 py-0.5 focus:outline-none focus:border-cyan-500 text-[10px]"
                >
                  <option value="smoothstep">Step</option>
                  <option value="straight">Straight</option>
                  <option value="bezier">Curved</option>
                </select>

                <select
                  value={edgeStyle}
                  onChange={(e) => {
                    const styleVal = e.target.value;
                    setEdges((eds) => eds.map((edgeItem) => edgeItem.id === id ? { ...edgeItem, data: { ...edgeItem.data, style: styleVal } } : edgeItem));
                  }}
                  className="bg-zinc-900 border border-zinc-700 text-zinc-300 rounded px-1 py-0.5 focus:outline-none focus:border-cyan-500 text-[10px]"
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                </select>
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

