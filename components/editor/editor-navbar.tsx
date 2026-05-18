import { useState } from "react";
import { PanelLeft, Share, Sparkles, Link2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { ShareDialog } from "./share-dialog";

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  projectName?: string;
  projectId?: string;
  isOwner?: boolean;
}

export function EditorNavbar({ isSidebarOpen, toggleSidebar, projectName, projectId, isOwner }: EditorNavbarProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 bg-background border-b border-border z-40">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-muted-foreground">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
        
        {projectName && (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
              <Square className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-tight">{projectName}</span>
              <span className="text-xs text-muted-foreground leading-tight">Workspace</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {projectName && (
          <>
            <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8">
              <Link2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden sm:flex gap-2 h-8 border-border bg-background"
              onClick={() => setIsShareOpen(true)}
            >
              <Share className="h-4 w-4" />
              Share
            </Button>
            <Button size="sm" className="hidden sm:flex gap-2 h-8 bg-cyan-400 hover:bg-cyan-500 text-black font-medium">
              <Sparkles className="h-4 w-4" />
              AI
            </Button>
          </>
        )}
        <div className="ml-2">
          <UserButton />
        </div>
      </div>
      
      {projectId && (
        <ShareDialog 
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          projectId={projectId}
          isOwner={!!isOwner}
        />
      )}
    </header>
  );
}
