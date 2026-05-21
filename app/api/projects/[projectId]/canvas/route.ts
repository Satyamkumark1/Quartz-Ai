import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { put, get } from "@vercel/blob";

// PUT: Save canvas JSON to Vercel Blob and update project
export async function PUT(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const canvas = await req.json();
  const blob = await put(`canvas-${projectId}.json`, JSON.stringify(canvas), { 
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  await prisma.project.update({
    where: { id: projectId },
    data: { canvasJsonPath: blob.url },
  });
  return NextResponse.json({ url: blob.url });
}

// GET: Load canvas JSON from Vercel Blob using project record
export async function GET(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project?.canvasJsonPath) {
    return NextResponse.json({ error: "No canvas saved" }, { status: 404 });
  }
  try {
    const result = await get(project.canvasJsonPath, {
      access: "private",
    });
    if (!result || result.statusCode !== 200) {
      return NextResponse.json({ error: "Failed to fetch canvas content" }, { status: 500 });
    }
    return new NextResponse(result.stream, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[CANVAS_LOAD_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch canvas" }, { status: 500 });
  }
}

