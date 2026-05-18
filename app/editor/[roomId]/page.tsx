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
          <CanvasWrapper roomId={roomId} />
        </div>
        
        {/* Right Sidebar Placeholder */}
        <div className="hidden lg:flex w-[320px] flex-col rounded-2xl border border-white/5 bg-[#0f0f11]">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <div>
              <h3 className="text-sm font-medium text-zinc-100">AI Copilot</h3>
              <p className="text-xs text-zinc-500">Placeholder panel</p>
            </div>
            <Sparkles className="h-4 w-4 text-purple-400" />
          </div>
          
          <div className="p-4 space-y-4 flex-1">
            <div className="rounded-xl border border-white/5 bg-white/5 p-4 flex gap-3">
              <div className="h-8 w-8 rounded bg-purple-500/20 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-zinc-100">Chat surface pending</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  The toggle is wired. Messaging and generation are intentionally out of scope here.
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <div className="rounded-xl border border-white/5 bg-black/20 p-4">
              <p className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase mb-2">
                FUTURE HOOKS
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Prompt composer, run status, and architecture guidance will attach to this sidebar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </EditorLayout>
  );
}
