import { redirect } from "next/navigation";
import { checkProjectAccess, getUserProjects } from "@/lib/project-access";
import { AccessDenied } from "@/components/editor/access-denied";
import { EditorLayout } from "@/components/editor/editor-layout";
import { Compass, Sparkles, Bot } from "lucide-react";
import { CanvasWrapper } from "@/components/editor/canvas-wrapper";

interface EditorRoomPageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function EditorRoomPage({ params }: EditorRoomPageProps) {
  const { roomId } = await params;

  // Check access for the current project
  const access = await checkProjectAccess(roomId);

  if (!access.hasAccess) {
    if (access.reason === "unauthenticated") {
      redirect("/sign-in");
    }
    return <AccessDenied />;
  }

  // Need projects for the sidebar
  const projects = await getUserProjects();

  return (
    <EditorLayout 
      projects={projects} 
      projectName={access.project?.name}
      currentRoomId={roomId}
      isOwner={access.role === "owner"}
    >
      <div className="flex h-full w-full gap-3">
        {/* Canvas Area */}
        <div className="flex-1 bg-[#0f0f11] rounded-2xl border border-white/5 relative overflow-hidden">
          <CanvasWrapper />
        </div>
      </div>
    </EditorLayout>
  );
}
