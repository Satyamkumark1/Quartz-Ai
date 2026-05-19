import { Share2, FileText, History } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 relative bg-background">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-0 right-0 h-screen overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      {/* Left Panel (Hidden on small screens) */}
      <div className="hidden md:flex flex-col justify-center px-12 xl:px-24 bg-card/40 backdrop-blur-3xl border-r border-border/50 text-foreground relative z-10">
        <div className="flex items-center gap-3 absolute top-12 left-12 xl:left-24">
          <div className="h-8 w-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.25)]"></div>
          <span className="font-semibold text-xl tracking-tight">Quartz-Ai</span>
        </div>
        
        <h1 className="text-[2.5rem] font-bold leading-tight mb-6 max-w-md mt-16 text-foreground">
          Design systems at the speed of thought.
        </h1>
        <p className="text-muted-foreground mb-12 text-lg max-w-lg leading-relaxed">
          Describe your architecture in plain English. Quartz-Ai maps it to a shared canvas your whole team can refine in real time.
        </p>

        <div className="space-y-8">
          <div className="flex gap-5 group">
            <div className="mt-0.5 h-11 w-11 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 group-hover:border-primary/40 transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.05)]">
              <History className="h-5 w-5 text-primary opacity-90" />
            </div>
            <div>
              <h3 className="font-medium text-base mb-1 text-foreground">AI Architecture Generation</h3>
              <p className="text-[15px] text-muted-foreground leading-relaxed">
                Describe your system, AI maps it to nodes and edges on a live canvas.
              </p>
            </div>
          </div>
          
          <div className="flex gap-5 group">
            <div className="mt-0.5 h-11 w-11 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 group-hover:border-primary/40 transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.05)]">
              <Share2 className="h-5 w-5 text-primary opacity-90" />
            </div>
            <div>
              <h3 className="font-medium text-base mb-1 text-foreground">Real-time Collaboration</h3>
              <p className="text-[15px] text-muted-foreground leading-relaxed">
                Live cursors, presence indicators, and shared node editing across your team.
              </p>
            </div>
          </div>
          
          <div className="flex gap-5 group">
            <div className="mt-0.5 h-11 w-11 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 group-hover:border-primary/40 transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.05)]">
              <FileText className="h-5 w-5 text-primary opacity-90" />
            </div>
            <div>
              <h3 className="font-medium text-base mb-1 text-foreground">Instant Spec Generation</h3>
              <p className="text-[15px] text-muted-foreground leading-relaxed">
                Export a complete Markdown technical spec directly from the canvas graph.
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-12 left-12 xl:left-24 text-sm text-muted-foreground/60">
          © 2026 Quartz-Ai. All rights reserved.
        </div>
      </div>

      {/* Right Panel (Form) */}
      <div className="flex items-center justify-center p-6 bg-transparent relative z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none -z-10" />
        {children}
      </div>
    </div>
  );
}
