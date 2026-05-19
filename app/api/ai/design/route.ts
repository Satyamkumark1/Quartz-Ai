import { NextResponse } from "next/server";
import { auth as clerkAuth } from "@clerk/nextjs/server";
import { auth as triggerAuth, tasks } from "@trigger.dev/sdk";
import { prisma } from "@/lib/prisma";
import type { designAgent } from "@/trigger/design-agent";

type DesignRequestBody = {
  prompt?: unknown;
  roomId?: unknown;
  projectId?: unknown;
};

function parseDesignRequest(body: DesignRequestBody) {
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const roomId = typeof body.roomId === "string" ? body.roomId.trim() : "";
  const projectId =
    typeof body.projectId === "string" ? body.projectId.trim() : roomId;

  if (!prompt) {
    return { ok: false as const, message: "Prompt is required" };
  }

  if (!roomId) {
    return { ok: false as const, message: "Room ID is required" };
  }

  if (!projectId) {
    return { ok: false as const, message: "Project ID is required" };
  }

  if (projectId !== roomId) {
    return {
      ok: false as const,
      message: "Project ID must match the room ID",
    };
  }

  return {
    ok: true as const,
    data: {
      prompt,
      roomId,
      projectId,
    },
  };
}

export async function POST(request: Request) {
  try {
    const { userId } = await clerkAuth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as DesignRequestBody;
    const parsed = parseDesignRequest(body);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.message }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: parsed.data.projectId },
      select: { ownerId: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const handle = await tasks.trigger<typeof designAgent>(
      "design-agent",
      {
        prompt: parsed.data.prompt,
        roomId: parsed.data.roomId,
      },
      {
        tags: [`user:${userId}`, `project:${parsed.data.projectId}`],
      }
    );

    await prisma.taskRun.create({
      data: {
        runId: handle.id,
        projectId: parsed.data.projectId,
        userId,
      },
    });

    const publicToken = await triggerAuth.createPublicToken({
      scopes: {
        read: {
          runs: handle.id,
        },
      },
      expirationTime: "1h",
    });

    return NextResponse.json({ runId: handle.id, publicToken });
  } catch (error) {
    console.error("[AI_DESIGN_POST]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
