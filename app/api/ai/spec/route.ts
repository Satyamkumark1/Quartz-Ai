import { NextResponse } from "next/server";
import { auth as clerkAuth } from "@clerk/nextjs/server";
import { tasks } from "@trigger.dev/sdk";
import { prisma } from "@/lib/prisma";
import type { generateSpec } from "@/trigger/generate-spec";

type SpecRequestBody = {
  roomId?: unknown;
  chatHistory?: unknown;
  nodes?: unknown;
  edges?: unknown;
};

export async function POST(request: Request) {
  try {
    const { userId } = await clerkAuth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as SpecRequestBody;
    const roomId = typeof body.roomId === "string" ? body.roomId.trim() : "";

    if (!roomId) {
      return NextResponse.json({ error: "Room ID is required" }, { status: 400 });
    }

    // Resolve project access from roomId
    const project = await prisma.project.findUnique({
      where: { id: roomId },
      select: { ownerId: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const handle = await tasks.trigger<typeof generateSpec>(
      "generate-spec",
      {
        projectId: roomId,
        roomId: roomId,
        chatHistory: body.chatHistory,
        nodes: body.nodes,
        edges: body.edges,
      },
      {
        tags: [`user:${userId}`, `project:${roomId}`],
      }
    );

    await prisma.taskRun.create({
      data: {
        runId: handle.id,
        projectId: roomId,
        userId,
      },
    });

    return NextResponse.json({ runId: handle.id });
  } catch (error) {
    console.error("[AI_SPEC_POST]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
