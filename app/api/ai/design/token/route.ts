import { NextResponse } from "next/server";
import { auth as clerkAuth } from "@clerk/nextjs/server";
import { auth as triggerAuth } from "@trigger.dev/sdk";
import { prisma } from "@/lib/prisma";

type TokenRequestBody = {
  runId?: unknown;
};

export async function POST(request: Request) {
  try {
    const { userId } = await clerkAuth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as TokenRequestBody;
    const runId = typeof body.runId === "string" ? body.runId.trim() : "";

    if (!runId) {
      return NextResponse.json({ error: "Run ID is required" }, { status: 400 });
    }

    const taskRun = await prisma.taskRun.findUnique({
      where: { runId },
      select: { userId: true },
    });

    if (!taskRun) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    if (taskRun.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const publicToken = await triggerAuth.createPublicToken({
      scopes: {
        read: {
          runs: runId,
        },
      },
      expirationTime: "1h",
    });

    return NextResponse.json({ publicToken });
  } catch (error) {
    console.error("[AI_DESIGN_TOKEN_POST]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
