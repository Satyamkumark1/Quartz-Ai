import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ projectId: string; collaboratorId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { projectId, collaboratorId } = await params;

    // Check ownership
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }

    if (project.ownerId !== userId) {
      return new NextResponse("Forbidden: Only owners can remove collaborators", { status: 403 });
    }

    const deletedCollaborator = await prisma.projectCollaborator.delete({
      where: {
        id: collaboratorId,
        projectId, // ensure the collaborator actually belongs to this project
      },
    });

    return NextResponse.json(deletedCollaborator);
  } catch (error) {
    console.error("[COLLABORATORS_DELETE]", error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return new NextResponse("Collaborator not found", { status: 404 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}
