import { task } from "@trigger.dev/sdk";
import { z } from "zod";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { liveblocks } from "@/lib/liveblocks";
import {
  AI_STATUS_FEED_ID,
  type AiStatusFeedMessage,
  type AiStatusState,
} from "@/types/tasks";

const GenerateSpecSchema = z.object({
  projectId: z.string(),
  roomId: z.string(),
  chatHistory: z.array(z.any()),
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
});

interface ChatMessage {
  role: string;
  content: string;
}

interface CanvasNode {
  id: string;
  data?: {
    label?: string;
    shape?: string;
    color?: string;
  };
}

interface CanvasEdge {
  source: string;
  target: string;
  data?: {
    label?: string;
  };
}

export const generateSpec = task({
  id: "generate-spec",
  run: async (payload: unknown) => {
    const validated = GenerateSpecSchema.parse(payload);
    const { projectId, roomId, chatHistory, nodes, edges } = validated;

    const dbHost = process.env.DATABASE_URL?.split("@")[1]?.split(":")[0] || "unknown";
    console.log(`[DEBUG] Trigger.dev worker connecting to database host: ${dbHost}`);
    
    await publishStatus(roomId, "Quartz-Ai started generating the technical spec.", "started");

    try {
      await publishStatus(roomId, "Analyzing canvas and chat history.", "processing");

      const model = openrouter(process.env.SPEC_GEN_MODEL ?? "google/gemini-2.0-flash-001");

      const { text } = await generateText({
        model,
        temperature: 0.1,
        system: [
          "You are Quartz-Ai, a technical architect and system designer.",
          "Your goal is to generate a comprehensive technical specification based on a system diagram (nodes and edges) and a conversation history.",
          "The output must be a well-structured Markdown document.",
          "Include sections for: Overview, Architecture Components, Data Flow, and Technical Requirements.",
          "Be precise, professional, and thorough.",
          "Focus on the relationships between components and the intent expressed in the chat history.",
        ].join("\n"),
        prompt: JSON.stringify({
          chatHistory: (chatHistory as ChatMessage[]).map((m) => ({ role: m.role, content: m.content })),
          canvas: {
            nodes: (nodes as CanvasNode[]).map((n) => ({
              id: n.id,
              label: n.data?.label,
              shape: n.data?.shape,
              color: n.data?.color,
            })),
            edges: (edges as CanvasEdge[]).map((e) => ({
              source: e.source,
              target: e.target,
              label: e.data?.label,
            })),
          },
        }),
      });

      // Save to Vercel Blob
      const blob = await put(`spec-${projectId}-${Date.now()}.md`, text, {
        access: "private",
      });

      // Save to Prisma
      const spec = await prisma.projectSpec.create({
        data: {
          projectId,
          filePath: blob.url,
        },
      });

      await publishStatus(roomId, "Technical spec generated and saved.", "complete");

      return {
        success: true,
        spec: text,
        specId: spec.id,
        url: blob.url,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? `Spec generation failed: ${error.message}`
          : "Spec generation failed.";
      console.error("[GENERATE_SPEC_ERROR]", error);
      await publishStatus(roomId, message, "error");
      throw error;
    }
  },
});

async function publishStatus(roomId: string, text: string, state: AiStatusState) {
  const message: AiStatusFeedMessage = {
    type: "ai-status",
    text,
    state,
    createdAt: new Date().toISOString(),
  };

  try {
    // Ensure feed exists
    try {
      await liveblocks.getFeed({ roomId, feedId: AI_STATUS_FEED_ID });
    } catch {
      try {
        await liveblocks.createFeed({
          roomId,
          feedId: AI_STATUS_FEED_ID,
          metadata: { type: "ai-status" },
        });
      } catch {
        // Ignore if already exists or other error
      }
    }

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
  } catch (error) {
    console.warn("[GENERATE_SPEC_STATUS_FAILED]", error);
  }
}
