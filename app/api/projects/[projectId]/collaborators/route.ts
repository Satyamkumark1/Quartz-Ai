import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { projectId } = await params;

    // Fetch collaborators from database
    const collaborators = await prisma.projectCollaborator.findMany({
      where: {
        projectId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (collaborators.length === 0) {
      return NextResponse.json([]);
    }

    // Extract emails to enrich with Clerk data
    const emails = collaborators.map((c) => c.email);

    // Fetch user details from Clerk
    const client = await clerkClient();
    const clerkUsers = await client.users.getUserList({
      emailAddress: emails,
    });

    // Map DB records to enriched objects
    const enrichedCollaborators = collaborators.map((collaborator) => {
      // Find matching clerk user by email
      const matchingUser = clerkUsers.data.find((u) =>
        u.emailAddresses.some((e) => e.emailAddress === collaborator.email)
      );

      return {
        id: collaborator.id,
        projectId: collaborator.projectId,
        email: collaborator.email,
        createdAt: collaborator.createdAt,
        name: matchingUser 
          ? `${matchingUser.firstName || ""} ${matchingUser.lastName || ""}`.trim() || matchingUser.firstName
          : null,
        imageUrl: matchingUser?.imageUrl || null,
      };
    });

    return NextResponse.json(enrichedCollaborators);
  } catch (error) {
    console.error("[COLLABORATORS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { email } = body;

    if (!email || typeof email !== "string") {
      return new NextResponse("Valid email is required", { status: 400 });
    }

    const { projectId } = await params;

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
      return new NextResponse("Forbidden: Only owners can invite collaborators", { status: 403 });
    }

    // Check if user is trying to invite themselves
    const currentUser = await clerkClient().then(c => c.users.getUser(userId));
    const isSelf = currentUser.emailAddresses.some(e => e.emailAddress.toLowerCase() === email.toLowerCase());
    
    if (isSelf) {
      return new NextResponse("Cannot invite the project owner", { status: 400 });
    }

    // Create collaborator
    const collaborator = await prisma.projectCollaborator.create({
      data: {
        projectId,
        email: email.toLowerCase(),
      },
    });

    return NextResponse.json(collaborator);
  } catch (error: any) {
    console.error("[COLLABORATORS_POST]", error);
    if (error.code === "P2002") {
      return new NextResponse("User is already a collaborator", { status: 400 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}
