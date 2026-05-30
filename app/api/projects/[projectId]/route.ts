import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { name, description } = body;

    if (!name && description === undefined) {
      return new NextResponse("Nothing to update", { status: 400 });
    }

    const { projectId } = await params;

    // Check ownership
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      cacheStrategy: {
        ttl: 30,
        swr: 10,
      },
    });

    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }

    if (project.ownerId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        name: name !== undefined ? name : project.name,
        description: description !== undefined ? description : project.description,
      },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("[PROJECT_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { projectId } = await params;

    // Check ownership
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      cacheStrategy: {
        ttl: 30,
        swr: 10,
      },
    });

    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }

    if (project.ownerId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const deletedProject = await prisma.project.delete({
      where: {
        id: projectId,
      },
    });

    return NextResponse.json(deletedProject);
  } catch (error) {
    console.error("[PROJECT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
