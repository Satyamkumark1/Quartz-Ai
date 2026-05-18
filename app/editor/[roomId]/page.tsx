import { redirect } from "next/navigation";
import { checkProjectAccess, getUserProjects } from "@/lib/project-access";
import { AccessDenied } from "@/components/editor/access-denied";
import { EditorLayout } from "@/components/editor/editor-layout";
import { Compass, Sparkles, Bot } from "lucide-react";

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
        <div className="flex-1 flex flex-col items-center justify-center bg-[#0f0f11] rounded-2xl border border-white/5 relative overflow-hidden">
          {/* Faux Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
          
          <div className="text-center space-y-4 max-w-md z-10">
            <div className="mx-auto h-12 w-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center mb-6">
              <Compass className="h-6 w-6 text-cyan-400" />
            </div>
            <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
              WORKSPACE SHELL
            </p>
            <h2 className="text-2xl font-medium text-zinc-100">
              Canvas and collaboration tooling land here next.
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              This room is ready for the shared architecture canvas, durable AI workflows, and
              real-time presence. For now, the shell is wired with project context and
              navigation only.
            </p>
          </div>
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
