import { Share2, FileText, History } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Panel (Hidden on small screens) */}
      <div className="hidden md:flex flex-col justify-center px-12 xl:px-24 bg-[#111115] border-r border-border/50 text-foreground relative">
        <div className="flex items-center gap-3 absolute top-12 left-12 xl:left-24">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]"></div>
          <span className="font-semibold text-xl tracking-tight">Ghost AI</span>
        </div>
        
        <h1 className="text-[2.5rem] font-bold leading-tight mb-6 max-w-md mt-16">
          Design systems at the speed of thought.
        </h1>
        <p className="text-muted-foreground mb-12 text-lg max-w-lg leading-relaxed">
          Describe your architecture in plain English. Ghost AI maps it to a shared canvas your whole team can refine in real time.
        </p>

        <div className="space-y-8">
          <div className="flex gap-5">
            <div className="mt-0.5 h-10 w-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <History className="h-5 w-5 text-primary opacity-80" />
            </div>
            <div>
              <h3 className="font-medium text-base mb-1">AI Architecture Generation</h3>
              <p className="text-[15px] text-muted-foreground leading-relaxed">
                Describe your system, AI maps it to nodes and edges on a live canvas.
              </p>
            </div>
          </div>
          
          <div className="flex gap-5">
            <div className="mt-0.5 h-10 w-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Share2 className="h-5 w-5 text-primary opacity-80" />
            </div>
            <div>
              <h3 className="font-medium text-base mb-1">Real-time Collaboration</h3>
              <p className="text-[15px] text-muted-foreground leading-relaxed">
                Live cursors, presence indicators, and shared node editing across your team.
              </p>
            </div>
          </div>
          
          <div className="flex gap-5">
            <div className="mt-0.5 h-10 w-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <FileText className="h-5 w-5 text-primary opacity-80" />
            </div>
            <div>
              <h3 className="font-medium text-base mb-1">Instant Spec Generation</h3>
              <p className="text-[15px] text-muted-foreground leading-relaxed">
                Export a complete Markdown technical spec directly from the canvas graph.
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-12 left-12 xl:left-24 text-sm text-muted-foreground/60">
          © 2026 Ghost AI. All rights reserved.
        </div>
      </div>

      {/* Right Panel (Form) */}
      <div className="flex items-center justify-center p-6 bg-black">
        {children}
      </div>
    </div>
  );
}
