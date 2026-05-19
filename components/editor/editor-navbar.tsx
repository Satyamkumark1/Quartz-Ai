import { useState } from "react";
import { PanelLeft, Share, Sparkles, Link2, Square, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { ShareDialog } from "./share-dialog";

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  projectName?: string;
  projectId?: string;
  isOwner?: boolean;
  toggleAiSidebar: () => void;
}

export function EditorNavbar({ isSidebarOpen, toggleSidebar, projectName, projectId, isOwner, toggleAiSidebar }: EditorNavbarProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 bg-background/60 backdrop-blur-xl border-b border-border z-40 supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl transition-colors">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
        
        {projectName && (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-card border border-border flex items-center justify-center shadow-sm">
              <Square className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-foreground">{projectName}</span>
              <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Workspace</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {projectName && (
          <>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl transition-colors h-8 w-8 hidden sm:flex">
              <Link2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden sm:flex gap-2 h-8 border-border bg-card hover:bg-white/5 hover:border-cyan-400/30 transition-all rounded-xl text-xs font-medium"
              onClick={() => setIsShareOpen(true)}
            >
              <Share className="h-3.5 w-3.5 text-muted-foreground" />
              Share
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden sm:flex gap-2 h-8 border-border bg-card hover:bg-white/5 hover:border-cyan-400/30 transition-all rounded-xl text-xs font-medium"
              onClick={() => window.dispatchEvent(new CustomEvent('open-templates-modal'))}
            >
              <LayoutTemplate className="h-3.5 w-3.5 text-muted-foreground" />
              Templates
            </Button>
            <Button 
              size="sm" 
              className="hidden sm:flex gap-2 h-8 bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 hover:bg-cyan-400/20 hover:border-cyan-400/40 hover:shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all rounded-xl text-xs font-semibold" 
              onClick={toggleAiSidebar}
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI Architect
            </Button>
          </>
        )}
        <div className="ml-2 pl-2 border-l border-border flex items-center h-8">
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