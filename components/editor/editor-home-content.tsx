"use client";

import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjectDialogs } from "@/components/editor/project-context";

export function EditorHomeContent() {
  const { openCreateDialog } = useProjectDialogs();

  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none z-0" />
      
      <div className="flex flex-col items-center justify-center max-w-lg mx-auto text-center px-6 relative z-10 glass-panel rounded-3xl p-12 shadow-2xl">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_25px_rgba(34,211,238,0.2)] mb-6 relative group">
          <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-ping opacity-20" />
          <Sparkles className="h-8 w-8 text-primary relative z-10 group-hover:scale-110 transition-transform duration-300" />
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight mb-3 text-foreground">
          Welcome to Quartz-Ai
        </h1>
        <p className="text-[15px] text-muted-foreground mb-8 leading-relaxed max-w-[360px]">
          Design, collaborate, and generate technical specs at the speed of thought. Start a new architecture workspace to begin.
        </p>
        
        <Button 
          onClick={openCreateDialog} 
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl h-11 px-8 shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] transition-all duration-300"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>
    </div>
  );
}
