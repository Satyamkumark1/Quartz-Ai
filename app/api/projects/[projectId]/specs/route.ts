import { NextResponse } from "next/server";
import { checkProjectAccess } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

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

    const specs = await prisma.projectSpec.findMany({
      where: {
        projectId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(specs);
  } catch (error) {
    console.error("[SPECS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
