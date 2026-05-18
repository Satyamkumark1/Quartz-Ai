import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getCurrentIdentity() {
  const user = await currentUser();
  if (!user) return null;
  
  const email = user.emailAddresses[0]?.emailAddress;
  return {
    userId: user.id,
    email,
  };
}

export async function checkProjectAccess(projectId: string) {
  const identity = await getCurrentIdentity();
  if (!identity) {
    return { hasAccess: false, reason: "unauthenticated" as const };
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      collaborators: true,
    },
  });

  if (!project) {
    return { hasAccess: false, reason: "not_found" as const };
  }

  if (project.ownerId === identity.userId) {
    return { hasAccess: true, project, role: "owner" as const };
  }

  if (identity.email) {
    const isCollaborator = project.collaborators.some(
      (c) => c.email === identity.email
    );
    if (isCollaborator) {
      return { hasAccess: true, project, role: "collaborator" as const };
    }
  }

  return { hasAccess: false, reason: "unauthorized" as const };
}

export async function getUserProjects() {
  const identity = await getCurrentIdentity();
  if (!identity) return [];

  const ownedProjectsData = await prisma.project.findMany({
    where: { ownerId: identity.userId },
    orderBy: { createdAt: "desc" },
  });

  const sharedProjectsData = identity.email
    ? await prisma.project.findMany({
        where: {
          collaborators: {
            some: {
              email: identity.email,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return [
    ...ownedProjectsData.map((p) => ({
      id: p.id,
      name: p.name,
      isOwner: true,
    })),
    ...sharedProjectsData.map((p) => ({
      id: p.id,
      name: p.name,
      isOwner: false,
    })),
  ];
}
