import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { put, get } from "@vercel/blob";

// PUT: Save canvas JSON to Vercel Blob and update project
export async function PUT(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const canvas = await req.json();
  const blob = await put(`canvas-${projectId}.json`, JSON.stringify(canvas), { access: "public" });
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
  const res = await fetch(project.canvasJsonPath);
  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch canvas" }, { status: 500 });
  }
  const canvas = await res.json();
  return NextResponse.json(canvas);
}
