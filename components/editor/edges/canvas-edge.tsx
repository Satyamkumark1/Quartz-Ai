"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath,
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
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

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
      setIsEditing(false);
      setEditLabel(label);
    }
  };

  const hasLabel = label.length > 0;
  const showHint = selected && !hasLabel && !isEditing;

  const strokeColor = selected ? '#06b6d4' : isHovered ? '#a1a1aa' : '#52525b';
  const markerUrl = selected ? 'url(#arrow-selected)' : isHovered ? 'url(#arrow-hovered)' : 'url(#arrow-default)';

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
          transition: 'stroke 0.2s',
        }}
        id={id}
      />
      
      {(hasLabel || isEditing || showHint) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
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
        </EdgeLabelRenderer>
      )}
    </>
  );
}
