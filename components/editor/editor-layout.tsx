"use client";

import { useState } from "react";
import { EditorNavbar } from "./editor-navbar";
import { ProjectSidebar } from "./project-sidebar";
import { ProjectDialogsProvider, Project } from "./project-context";
import { ProjectDialogs } from "./project-dialogs";

interface EditorLayoutProps {
  children: React.ReactNode;
  projects: Project[];
  projectName?: string;
  currentRoomId?: string;
  isOwner?: boolean;
}

export function EditorLayout({ children, projects, projectName, currentRoomId, isOwner }: EditorLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ProjectDialogsProvider>
      <div className="flex flex-col h-screen w-full bg-[#0a0a0a] overflow-hidden text-zinc-100 relative">
        <EditorNavbar 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={() => setIsSidebarOpen((prev) => !prev)} 
          projectName={projectName}
          projectId={currentRoomId}
          isOwner={isOwner}
        />
        <div className="flex flex-1 overflow-hidden pt-14 p-3 gap-3">
          <ProjectSidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
            projects={projects}
            currentRoomId={currentRoomId}
          />
          <main className="flex-1 w-full overflow-hidden flex">
            {children}
          </main>
        </div>
      </div>
      <ProjectDialogs />
    </ProjectDialogsProvider>
  );
}
