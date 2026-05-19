"use client";

import { useState } from "react";
import { EditorNavbar } from "./editor-navbar";
import { ProjectSidebar } from "./project-sidebar";
import { ProjectDialogsProvider, Project } from "./project-context";
import { ProjectDialogs } from "./project-dialogs";
import { AiSidebar } from "./ai-sidebar";
import { LiveblocksProvider, RoomProvider } from "@liveblocks/react";

interface EditorLayoutProps {
  children: React.ReactNode;
  projects: Project[];
  projectName?: string;
  currentRoomId?: string;
  isOwner?: boolean;
}

export function EditorLayout({ children, projects, projectName, currentRoomId, isOwner }: EditorLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);

  const toggleAiSidebar = () => setIsAiSidebarOpen((prev) => !prev);
  const closeAiSidebar = () => setIsAiSidebarOpen(false);

  const workspace = (
    <>
      <main className="flex-1 w-full overflow-hidden flex">
        {children}
      </main>
      <AiSidebar
        isOpen={isAiSidebarOpen}
        onClose={closeAiSidebar}
        hasRoom={Boolean(currentRoomId)}
        roomId={currentRoomId}
      />
    </>
  );

  return (
    <ProjectDialogsProvider>
      <div className="flex flex-col h-screen w-full bg-[#0a0a0a] overflow-hidden text-zinc-100 relative">
        <EditorNavbar 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={() => setIsSidebarOpen((prev) => !prev)} 
          projectName={projectName}
          projectId={currentRoomId}
          isOwner={isOwner}
          toggleAiSidebar={toggleAiSidebar}
        />
        <div className="flex flex-1 overflow-hidden pt-14 p-3 gap-3">
          <ProjectSidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
            projects={projects}
            currentRoomId={currentRoomId}
          />
          {currentRoomId ? (
            <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
              <RoomProvider
                id={currentRoomId}
                initialPresence={{
                  cursor: null,
                  isThinking: false,
                  thinking: false,
                  status: null,
                }}
              >
                {workspace}
              </RoomProvider>
            </LiveblocksProvider>
          ) : (
            workspace
          )}
        </div>
      </div>
      <ProjectDialogs />
    </ProjectDialogsProvider>
  );
}
