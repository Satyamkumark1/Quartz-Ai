import { NextResponse } from "next/server";
import { checkProjectAccess } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string; specId: string }> }
) {
  try {
    const { projectId, specId } = await params;

    const access = await checkProjectAccess(projectId);

    if (!access.hasAccess) {
      if (access.reason === "unauthenticated") {
        return new NextResponse("Unauthorized", { status: 401 });
      }
      if (access.reason === "not_found") {
        return new NextResponse("Project not found", { status: 404 });
      }
      return new NextResponse("Forbidden", { status: 403 });
    }

    const spec = await prisma.projectSpec.findUnique({
      where: {
        id: specId,
      },
    });

    if (!spec || spec.projectId !== projectId) {
      return new NextResponse("Spec not found", { status: 404 });
    }

    const res = await fetch(spec.filePath);
    if (!res.ok) {
      return new NextResponse("Failed to fetch spec content", { status: 500 });
    }

    const content = await res.text();

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/markdown",
        "Content-Disposition": `attachment; filename="spec-${specId}.md"`,
      },
    });
  } catch (error) {
    console.error("[SPEC_DOWNLOAD]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
