import { CanvasNode, CanvasEdge } from "@/types/canvas";

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: "microservices",
    name: "Microservices Architecture",
    description: "A standard microservices setup with an API gateway and a shared database.",
    nodes: [
      { id: "api-gw", type: "canvasNode", position: { x: 250, y: 50 }, data: { label: "API Gateway", shape: "hexagon", color: "purple" }, style: { width: 140, height: 70 } },
      { id: "auth-svc", type: "canvasNode", position: { x: 50, y: 200 }, data: { label: "Auth Service", shape: "rectangle", color: "blue" }, style: { width: 120, height: 60 } },
      { id: "user-svc", type: "canvasNode", position: { x: 250, y: 200 }, data: { label: "User Service", shape: "rectangle", color: "blue" }, style: { width: 120, height: 60 } },
      { id: "prod-svc", type: "canvasNode", position: { x: 450, y: 200 }, data: { label: "Product Service", shape: "rectangle", color: "blue" }, style: { width: 120, height: 60 } },
      { id: "db", type: "canvasNode", position: { x: 250, y: 350 }, data: { label: "Main Database", shape: "cylinder", color: "green" }, style: { width: 120, height: 80 } },
    ],
    edges: [
      { id: "e-gw-auth", source: "api-gw", target: "auth-svc", sourceHandle: "bottom", targetHandle: "top", type: "canvasEdge" },
      { id: "e-gw-user", source: "api-gw", target: "user-svc", sourceHandle: "bottom", targetHandle: "top", type: "canvasEdge" },
      { id: "e-gw-prod", source: "api-gw", target: "prod-svc", sourceHandle: "bottom", targetHandle: "top", type: "canvasEdge" },
      { id: "e-user-db", source: "user-svc", target: "db", sourceHandle: "bottom", targetHandle: "top", type: "canvasEdge" },
      { id: "e-prod-db", source: "prod-svc", target: "db", sourceHandle: "bottom", targetHandle: "top", type: "canvasEdge" },
    ],
  },
  {
    id: "cicd",
    name: "CI/CD Pipeline",
    description: "A deployment pipeline flowing from code commit to production.",
    nodes: [
      { id: "repo", type: "canvasNode", position: { x: 50, y: 150 }, data: { label: "Git Repo", shape: "cylinder", color: "default" }, style: { width: 100, height: 80 } },
      { id: "build", type: "canvasNode", position: { x: 200, y: 160 }, data: { label: "Build Image", shape: "rectangle", color: "blue" }, style: { width: 120, height: 60 } },
      { id: "test", type: "canvasNode", position: { x: 370, y: 150 }, data: { label: "Run Tests", shape: "diamond", color: "orange" }, style: { width: 100, height: 80 } },
      { id: "deploy-stg", type: "canvasNode", position: { x: 520, y: 160 }, data: { label: "Deploy (Staging)", shape: "rectangle", color: "purple" }, style: { width: 140, height: 60 } },
      { id: "deploy-prod", type: "canvasNode", position: { x: 710, y: 160 }, data: { label: "Deploy (Prod)", shape: "rectangle", color: "green" }, style: { width: 140, height: 60 } },
    ],
    edges: [
      { id: "e-repo-build", source: "repo", target: "build", sourceHandle: "right", targetHandle: "left", type: "canvasEdge" },
      { id: "e-build-test", source: "build", target: "test", sourceHandle: "right", targetHandle: "left", type: "canvasEdge" },
      { id: "e-test-stg", source: "test", target: "deploy-stg", sourceHandle: "right", targetHandle: "left", type: "canvasEdge" },
      { id: "e-stg-prod", source: "deploy-stg", target: "deploy-prod", sourceHandle: "right", targetHandle: "left", type: "canvasEdge" },
    ],
  },
  {
    id: "event-driven",
    name: "Event-Driven System",
    description: "Asynchronous messaging pattern with a central event bus.",
    nodes: [
      { id: "producer", type: "canvasNode", position: { x: 50, y: 150 }, data: { label: "Event Producer", shape: "rectangle", color: "blue" }, style: { width: 130, height: 60 } },
      { id: "bus", type: "canvasNode", position: { x: 250, y: 150 }, data: { label: "Event Bus", shape: "pill", color: "default" }, style: { width: 140, height: 60 } },
      { id: "consumer-a", type: "canvasNode", position: { x: 450, y: 50 }, data: { label: "Consumer A", shape: "hexagon", color: "purple" }, style: { width: 120, height: 60 } },
      { id: "consumer-b", type: "canvasNode", position: { x: 450, y: 250 }, data: { label: "Consumer B", shape: "hexagon", color: "purple" }, style: { width: 120, height: 60 } },
      { id: "store", type: "canvasNode", position: { x: 650, y: 150 }, data: { label: "Data Warehouse", shape: "cylinder", color: "green" }, style: { width: 130, height: 80 } },
    ],
    edges: [
      { id: "e-prod-bus", source: "producer", target: "bus", sourceHandle: "right", targetHandle: "left", type: "canvasEdge", label: "Publish" },
      { id: "e-bus-ca", source: "bus", target: "consumer-a", sourceHandle: "top", targetHandle: "left", type: "canvasEdge", label: "Subscribe" },
      { id: "e-bus-cb", source: "bus", target: "consumer-b", sourceHandle: "bottom", targetHandle: "left", type: "canvasEdge", label: "Subscribe" },
      { id: "e-ca-store", source: "consumer-a", target: "store", sourceHandle: "right", targetHandle: "top", type: "canvasEdge", label: "Write" },
      { id: "e-cb-store", source: "consumer-b", target: "store", sourceHandle: "right", targetHandle: "bottom", type: "canvasEdge", label: "Write" },
    ],
  }
];
