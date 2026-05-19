import { mutateFlow } from "@liveblocks/react-flow/node";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { task } from "@trigger.dev/sdk";
import { generateText } from "ai";
import type { Edge, Node } from "@xyflow/react";
import { liveblocks } from "@/lib/liveblocks";
import {
  AI_STATUS_FEED_ID,
  type AiStatusFeedMessage,
  type AiStatusState,
} from "@/types/tasks";
import { NODE_COLOR_PALETTE, type CanvasNodeData } from "@/types/canvas";

export type DesignAgentPayload = {
  prompt: string;
  roomId: string;
};

type CanvasNode = Node<CanvasNodeData, "canvasNode">;
type CanvasEdge = Edge;
type NodeShape = NonNullable<CanvasNodeData["shape"]>;
type NodeColor = (typeof NODE_COLOR_PALETTE)[number]["name"];

type DesignPlan = {
  summary?: string;
  actions: DesignAction[];
};

type DesignAction =
  | {
      type: "add_node";
      id?: string;
      label: string;
      shape?: NodeShape;
      color?: NodeColor;
      position?: Point;
      size?: Size;
    }
  | { type: "move_node"; id: string; position: Point }
  | { type: "resize_node"; id: string; size: Size }
  | {
      type: "update_node_data";
      id: string;
      label?: string;
      shape?: NodeShape;
      color?: NodeColor;
    }
  | { type: "delete_node"; id: string }
  | {
      type: "add_edge";
      id?: string;
      source: string;
      target: string;
      label?: string;
    }
  | { type: "delete_edge"; id: string };

type Point = {
  x: number;
  y: number;
};

type Size = {
  width: number;
  height: number;
};

const AI_USER_ID = "ghost-ai-agent";
const ALLOWED_SHAPES: NodeShape[] = [
  "rectangle",
  "circle",
  "diamond",
  "cylinder",
  "pill",
  "hexagon",
];
const ALLOWED_COLORS = NODE_COLOR_PALETTE.map((color) => color.name);
const DEFAULT_SIZE_BY_SHAPE: Record<NodeShape, Size> = {
  rectangle: { width: 160, height: 80 },
  circle: { width: 96, height: 96 },
  diamond: { width: 120, height: 120 },
  cylinder: { width: 150, height: 95 },
  pill: { width: 170, height: 72 },
  hexagon: { width: 150, height: 90 },
};
const DEFAULT_MAX_OUTPUT_TOKENS = 2048;

export const designAgent = task({
  id: "design-agent",
  run: async (payload: DesignAgentPayload) => {
    await ensureRoom(payload.roomId);
    await safeSetAiPresence(payload.roomId, true, "Starting design generation");
    await publishStatus(payload.roomId, "Ghost AI started designing.", "started");

    try {
      await publishStatus(payload.roomId, "Reading the current canvas.", "processing");
      const snapshot = await getFlowSnapshot(payload.roomId);

      await publishStatus(payload.roomId, "Planning architecture changes.", "processing");
      const plan = await createDesignPlan(payload.prompt, snapshot);

      await publishStatus(payload.roomId, "Applying changes to the shared canvas.", "processing");
      const applied = await applyDesignPlan(payload.roomId, plan);

      const completeMessage =
        plan.summary ??
        `Design update complete. Applied ${applied} canvas action${applied === 1 ? "" : "s"}.`;
      await publishStatus(payload.roomId, completeMessage, "complete");

      return {
        success: true,
        roomId: payload.roomId,
        actionsApplied: applied,
        summary: completeMessage,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? `Design generation failed: ${error.message}`
          : "Design generation failed.";
      console.error("[DESIGN_AGENT_ERROR]", error);
      await publishStatus(payload.roomId, message, "error");
      throw error;
    } finally {
      await safeSetAiPresence(payload.roomId, false, null);
    }
  },
});

async function getFlowSnapshot(roomId: string) {
  let snapshot: { nodes: readonly CanvasNode[]; edges: readonly CanvasEdge[] } = {
    nodes: [],
    edges: [],
  };

  await mutateFlow<CanvasNode, CanvasEdge>(
    {
      client: liveblocks,
      roomId,
    },
    (flow) => {
      snapshot = flow.toJSON();
    }
  );

  return snapshot;
}

async function createDesignPlan(
  prompt: string,
  snapshot: { nodes: readonly CanvasNode[]; edges: readonly CanvasEdge[] }
) {
  const model = openrouter(
    process.env.OPENROUTER_MODEL ?? "google/gemini-2.5-flash"
  );

  const { text } = await generateText({
    model,
    maxOutputTokens: getMaxOutputTokens(),
    temperature: 0.2,
    maxRetries: 1,
    system: [
      "You are Ghost AI, a system architecture diagram agent.",
      "Return only valid JSON. Do not wrap it in Markdown.",
      "The JSON must be an object with optional string summary and actions array.",
      "Each action must use one of these type values: add_node, move_node, resize_node, update_node_data, delete_node, add_edge, delete_edge.",
      "add_node fields: type, optional id, label, optional shape, optional color, optional position {x,y}, optional size {width,height}.",
      "move_node fields: type, id, position {x,y}. resize_node fields: type, id, size {width,height}.",
      "update_node_data fields: type, id, optional label, optional shape, optional color.",
      "delete_node fields: type, id. add_edge fields: type, optional id, source, target, optional label. delete_edge fields: type, id.",
      "Prefer clear, production-style system design components and relationships.",
      "Use only these node shapes: rectangle, circle, diamond, cylinder, pill, hexagon.",
      `Use only these node colors: ${ALLOWED_COLORS.join(", ")}.`,
      "Use readable spacing: columns or rows with at least 220px horizontal and 150px vertical separation.",
      "Never delete existing nodes or edges unless the user explicitly asks to remove or replace them.",
      "Use add_node and add_edge for new architectures. Use move_node, resize_node, update_node_data, delete_node, and delete_edge only when the request calls for edits to existing items.",
      "For edges, source and target must refer to existing node IDs or IDs from add_node actions in the same plan.",
    ].join("\n"),
    prompt: JSON.stringify({
      userPrompt: prompt,
      currentCanvas: {
        nodes: snapshot.nodes.map((node) => ({
          id: node.id,
          label: node.data.label,
          shape: node.data.shape ?? "rectangle",
          color: node.data.color ?? "default",
          position: node.position,
          width: node.width ?? node.style?.width,
          height: node.height ?? node.style?.height,
        })),
        edges: snapshot.edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.data?.label,
        })),
      },
    }),
  });

  return normalizePlan(parseDesignPlanJson(text));
}

function getMaxOutputTokens() {
  const configured = Number(process.env.DESIGN_AGENT_MAX_OUTPUT_TOKENS);

  if (Number.isInteger(configured) && configured > 0) {
    return Math.min(configured, 16000);
  }

  return DEFAULT_MAX_OUTPUT_TOKENS;
}

function parseDesignPlanJson(text: string): DesignPlan {
  const parsed = JSON.parse(extractJsonObject(text)) as unknown;
  if (!isRecord(parsed)) {
    throw new Error("Design plan response was not a JSON object.");
  }

  const rawActions = parsed.actions;
  if (!Array.isArray(rawActions)) {
    throw new Error("Design plan response did not include an actions array.");
  }

  return {
    summary: typeof parsed.summary === "string" ? parsed.summary : undefined,
    actions: rawActions
      .slice(0, 40)
      .map(readDesignAction)
      .filter((action): action is DesignAction => action !== null),
  };
}

function extractJsonObject(text: string) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() ?? trimmed;

  if (candidate.startsWith("{") && candidate.endsWith("}")) {
    return candidate;
  }

  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return candidate.slice(start, end + 1);
  }

  throw new Error("Design plan response did not contain JSON.");
}

function readDesignAction(value: unknown): DesignAction | null {
  if (!isRecord(value) || typeof value.type !== "string") return null;

  switch (value.type) {
    case "add_node": {
      if (typeof value.label !== "string") return null;
      const position = readPoint(value.position);
      const size = readSize(value.size);

      return {
        type: "add_node",
        ...(typeof value.id === "string" ? { id: value.id } : {}),
        label: value.label,
        ...(isNodeShape(value.shape) ? { shape: value.shape } : {}),
        ...(isNodeColor(value.color) ? { color: value.color } : {}),
        ...(position ? { position } : {}),
        ...(size ? { size } : {}),
      };
    }
    case "move_node": {
      const position = readPoint(value.position);
      if (typeof value.id !== "string" || !position) return null;
      return { type: "move_node", id: value.id, position };
    }
    case "resize_node": {
      const size = readSize(value.size);
      if (typeof value.id !== "string" || !size) return null;
      return { type: "resize_node", id: value.id, size };
    }
    case "update_node_data": {
      if (typeof value.id !== "string") return null;
      return {
        type: "update_node_data",
        id: value.id,
        ...(typeof value.label === "string" ? { label: value.label } : {}),
        ...(isNodeShape(value.shape) ? { shape: value.shape } : {}),
        ...(isNodeColor(value.color) ? { color: value.color } : {}),
      };
    }
    case "delete_node":
      return typeof value.id === "string"
        ? { type: "delete_node", id: value.id }
        : null;
    case "add_edge":
      return typeof value.source === "string" && typeof value.target === "string"
        ? {
            type: "add_edge",
            ...(typeof value.id === "string" ? { id: value.id } : {}),
            source: value.source,
            target: value.target,
            ...(typeof value.label === "string" ? { label: value.label } : {}),
          }
        : null;
    case "delete_edge":
      return typeof value.id === "string"
        ? { type: "delete_edge", id: value.id }
        : null;
    default:
      return null;
  }
}

function readPoint(value: unknown): Point | null {
  if (!isRecord(value) || typeof value.x !== "number" || typeof value.y !== "number") {
    return null;
  }

  return { x: value.x, y: value.y };
}

function readSize(value: unknown): Size | null {
  if (
    !isRecord(value) ||
    typeof value.width !== "number" ||
    typeof value.height !== "number"
  ) {
    return null;
  }

  return { width: value.width, height: value.height };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

async function applyDesignPlan(roomId: string, plan: DesignPlan) {
  let applied = 0;

  await mutateFlow<CanvasNode, CanvasEdge>(
    {
      client: liveblocks,
      roomId,
    },
    (flow) => {
      const idMap = new Map<string, string>();

      for (const action of plan.actions) {
        switch (action.type) {
          case "add_node": {
            const shape = action.shape ?? "rectangle";
            const size = clampSize(action.size ?? DEFAULT_SIZE_BY_SHAPE[shape]);
            const id = uniqueNodeId(
              action.id ? safeId(action.id) : safeId(action.label),
              flow.nodes
            );

            if (action.id) {
              idMap.set(action.id, id);
            }

            flow.addNode({
              id,
              type: "canvasNode",
              position: action.position ?? nextPosition(flow.nodes),
              data: {
                label: action.label,
                shape,
                color: action.color ?? "default",
              },
              style: size,
            });
            applied++;
            break;
          }
          case "move_node": {
            const id = resolveId(action.id, idMap);
            if (!flow.getNode(id)) break;
            flow.updateNode(id, { position: action.position });
            applied++;
            break;
          }
          case "resize_node": {
            const id = resolveId(action.id, idMap);
            if (!flow.getNode(id)) break;
            flow.updateNode(id, { style: clampSize(action.size) });
            applied++;
            break;
          }
          case "update_node_data": {
            const id = resolveId(action.id, idMap);
            if (!flow.getNode(id)) break;
            flow.updateNodeData(id, {
              ...(action.label ? { label: action.label } : {}),
              ...(action.shape ? { shape: action.shape } : {}),
              ...(action.color ? { color: action.color } : {}),
            });
            applied++;
            break;
          }
          case "delete_node": {
            const id = resolveId(action.id, idMap);
            if (!flow.getNode(id)) break;
            flow.removeNode(id);
            flow.removeEdges(
              flow.edges
                .filter((edge) => edge.source === id || edge.target === id)
                .map((edge) => edge.id)
            );
            applied++;
            break;
          }
          case "add_edge": {
            const source = resolveId(action.source, idMap);
            const target = resolveId(action.target, idMap);
            if (!flow.getNode(source) || !flow.getNode(target) || source === target) {
              break;
            }

            const id = uniqueEdgeId(
              action.id ? safeId(action.id) : `${source}-to-${target}`,
              flow.edges
            );

            flow.addEdge({
              id,
              source,
              target,
              type: "canvasEdge",
              data: action.label ? { label: action.label } : {},
            });
            applied++;
            break;
          }
          case "delete_edge": {
            const id = resolveId(action.id, idMap);
            if (!flow.getEdge(id)) break;
            flow.removeEdge(id);
            applied++;
            break;
          }
        }
      }
    }
  );

  return applied;
}

async function publishStatus(roomId: string, text: string, state: AiStatusState) {
  await ensureStatusFeed(roomId);

  const message: AiStatusFeedMessage = {
    type: "ai-status",
    text,
    state,
    createdAt: new Date().toISOString(),
  };

  await liveblocks.createFeedMessage({
    roomId,
    feedId: AI_STATUS_FEED_ID,
    data: message,
  });

  await liveblocks.broadcastEvent(roomId, {
    type: "ai-status",
    feedId: AI_STATUS_FEED_ID,
    text,
    state,
    createdAt: message.createdAt,
  });
}

async function ensureStatusFeed(roomId: string) {
  try {
    await liveblocks.getFeed({ roomId, feedId: AI_STATUS_FEED_ID });
  } catch {
    try {
      await liveblocks.createFeed({
        roomId,
        feedId: AI_STATUS_FEED_ID,
        metadata: {
          type: "ai-status",
        },
      });
    } catch {
      await liveblocks.getFeed({ roomId, feedId: AI_STATUS_FEED_ID });
    }
  }
}

async function ensureRoom(roomId: string) {
  try {
    await liveblocks.getRoom(roomId);
  } catch {
    try {
      await liveblocks.createRoom(roomId, {
        defaultAccesses: [],
      });
    } catch (error) {
      console.warn("[DESIGN_AGENT_ROOM_ENSURE_SKIPPED]", formatError(error));
    }
  }
}

async function safeSetAiPresence(
  roomId: string,
  thinking: boolean,
  status: string | null
) {
  try {
    await setAiPresence(roomId, thinking, status);
  } catch (error) {
    console.warn("[DESIGN_AGENT_PRESENCE_SKIPPED]", formatError(error));
  }
}

async function setAiPresence(
  roomId: string,
  thinking: boolean,
  status: string | null
) {
  await liveblocks.setPresence(roomId, {
    userId: AI_USER_ID,
    data: {
      cursor: thinking ? { x: 80, y: 80 } : null,
      isThinking: thinking,
      thinking,
      status,
    },
    userInfo: {
      name: "Ghost AI",
      color: "#62C073",
    },
    ttl: thinking ? 120 : 2,
  });
}

function formatError(error: unknown) {
  if (error instanceof Error) {
    const details = "details" in error ? ` ${String(error.details)}` : "";
    const status = "status" in error ? ` status=${String(error.status)}` : "";
    return `${error.message}${status}${details}`.trim();
  }

  return String(error);
}

function normalizePlan(plan: DesignPlan): DesignPlan {
  return {
    summary: plan.summary,
    actions: plan.actions
      .map((action) => normalizeAction(action))
      .filter((action): action is DesignAction => action !== null),
  };
}

function normalizeAction(action: DesignAction): DesignAction | null {
  switch (action.type) {
    case "add_node": {
      const label = action.label.trim();
      if (!label) return null;

      const shape = isNodeShape(action.shape) ? action.shape : "rectangle";
      const color = isNodeColor(action.color) ? action.color : "default";

      return {
        type: "add_node",
        ...(action.id ? { id: action.id } : {}),
        label,
        shape,
        color,
        ...(action.position ? { position: clampPoint(action.position) } : {}),
        ...(action.size ? { size: clampSize(action.size) } : {}),
      };
    }
    case "move_node":
      return action.id ? { ...action, position: clampPoint(action.position) } : null;
    case "resize_node":
      return action.id ? { ...action, size: clampSize(action.size) } : null;
    case "update_node_data":
      if (!action.id) return null;
      return {
        type: "update_node_data",
        id: action.id,
        ...(action.label ? { label: action.label.trim() } : {}),
        ...(isNodeShape(action.shape) ? { shape: action.shape } : {}),
        ...(isNodeColor(action.color) ? { color: action.color } : {}),
      };
    case "delete_node":
      return action.id ? action : null;
    case "add_edge":
      return action.source && action.target ? action : null;
    case "delete_edge":
      return action.id ? action : null;
  }
}

function isNodeShape(shape: unknown): shape is NodeShape {
  return typeof shape === "string" && ALLOWED_SHAPES.includes(shape as NodeShape);
}

function isNodeColor(color: unknown): color is NodeColor {
  return typeof color === "string" && ALLOWED_COLORS.includes(color);
}

function clampPoint(point: Point): Point {
  return {
    x: clampNumber(point.x, -4000, 4000),
    y: clampNumber(point.y, -4000, 4000),
  };
}

function clampSize(size: Size): Size {
  return {
    width: clampNumber(size.width, 72, 320),
    height: clampNumber(size.height, 48, 220),
  };
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}

function nextPosition(nodes: readonly CanvasNode[]): Point {
  const index = nodes.length;
  return {
    x: (index % 4) * 260,
    y: Math.floor(index / 4) * 170,
  };
}

function resolveId(id: string, idMap: Map<string, string>) {
  return idMap.get(id) ?? safeId(id);
}

function safeId(value: string) {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `ai-${normalized || "node"}`;
}

function uniqueNodeId(baseId: string, nodes: readonly CanvasNode[]) {
  const existing = new Set(nodes.map((node) => node.id));
  return uniqueId(baseId, existing);
}

function uniqueEdgeId(baseId: string, edges: readonly CanvasEdge[]) {
  const existing = new Set(edges.map((edge) => edge.id));
  return uniqueId(baseId, existing);
}

function uniqueId(baseId: string, existing: Set<string>) {
  if (!existing.has(baseId)) return baseId;

  let index = 2;
  while (existing.has(`${baseId}-${index}`)) {
    index++;
  }

  return `${baseId}-${index}`;
}
