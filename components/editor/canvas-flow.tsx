"use client";

import { useCallback } from "react";
import { ReactFlow, Background, BackgroundVariant, MiniMap, ConnectionMode, useReactFlow, ReactFlowProvider } from "@xyflow/react";
import { useLiveblocksFlow, Cursors } from "@liveblocks/react-flow";
import { CanvasNode } from "./nodes/canvas-node";
import "@xyflow/react/dist/style.css";
import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-flow/styles.css";

const nodeTypes = {
  canvasNode: CanvasNode,
};

function Flow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow({
      suspense: true,
      nodes: {
        initial: [],
      },
      edges: {
        initial: [],
      },
    });

  const { screenToFlowPosition, setNodes } = useReactFlow();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const payloadStr = event.dataTransfer.getData("application/reactflow");
      if (!payloadStr) return;

      try {
        const payload = JSON.parse(payloadStr);
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        const timestamp = Date.now();
        const counter = Math.floor(Math.random() * 1000);
        const newNodeId = `${payload.shape}-${timestamp}-${counter}`;

        const newNode = {
          id: newNodeId,
          type: "canvasNode",
          position: {
            x: position.x - payload.width / 2,
            y: position.y - payload.height / 2,
          },
          data: {
            label: "",
            shape: payload.shape,
          },
          style: {
            width: payload.width,
            height: payload.height,
          }
        };

        setNodes((nds) => nds.concat(newNode));
      } catch (e) {
        console.error("Drop error", e);
      }
    },
    [screenToFlowPosition, setNodes]
  );

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        onDragOver={onDragOver}
        onDrop={onDrop}
        connectionMode={ConnectionMode.Loose}
        fitView
        panOnScroll={true}
        zoomOnScroll={false}
        zoomOnPinch={true}
        minZoom={0.1}
        maxZoom={2}
      >
        <Background variant={BackgroundVariant.Dots} color="#ffffff30" />
        <MiniMap 
          nodeColor="#ffffff20"
          maskColor="#00000080"
          style={{ backgroundColor: '#0f0f11', border: '1px solid #ffffff10', borderRadius: '8px' }}
        />
        <Cursors />
      </ReactFlow>
    </div>
  );
}

export function CanvasFlow() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
