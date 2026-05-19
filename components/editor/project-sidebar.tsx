import { X, Plus, MoreHorizontal, Folder } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProjectDialogs, Project } from "./project-context";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  currentRoomId?: string;
}

export function ProjectSidebar({ isOpen, onClose, projects, currentRoomId }: ProjectSidebarProps) {
  const { openCreateDialog, openRenameDialog, openDeleteDialog } = useProjectDialogs();

  const myProjects = projects.filter((p) => p.isOwner);
  const sharedProjects = projects.filter((p) => !p.isOwner);

  const renderProjectItem = (project: Project) => (
    <div
      key={project.id}
      className={`flex items-center justify-between p-2 rounded-xl hover:bg-white/5 group transition-colors ${
        currentRoomId === project.id ? "bg-cyan-400/10 border border-cyan-400/20" : "border border-transparent"
      }`}
    >
      <Link href={`/editor/${project.id}`} className="flex items-center gap-3 overflow-hidden flex-1 cursor-pointer">
        {currentRoomId === project.id ? (
          <div className="h-2 w-2 rounded-full bg-cyan-400 shrink-0 ml-1.5 mr-1 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
        ) : (
          <div className="h-1.5 w-1.5 rounded-full bg-zinc-700 shrink-0 ml-1.5 mr-1" />
        )}
        <span className={`text-sm truncate font-medium transition-colors ${currentRoomId === project.id ? "text-cyan-400" : "text-muted-foreground group-hover:text-foreground"}`}>{project.name}</span>
      </Link>
      {project.isOwner && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground focus-visible:outline-none"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-panel border-border rounded-xl">
            <DropdownMenuItem onClick={() => openRenameDialog(project)} className="rounded-lg cursor-pointer hover:bg-white/5 focus:bg-white/5">
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => openDeleteDialog(project)}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive rounded-lg cursor-pointer"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop Scrim */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-72 bg-card/80 backdrop-blur-xl border-r border-border shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col
          lg:static lg:translate-x-0 lg:w-[280px] lg:h-full lg:rounded-2xl lg:border lg:shadow-none
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between p-5 h-[72px] shrink-0">
          <h2 className="font-semibold text-sm tracking-wide text-foreground uppercase">Projects</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden text-muted-foreground hover:bg-white/5 rounded-xl">
            <X className="h-5 w-5" />
            <span className="sr-only">Close Sidebar</span>
          </Button>
        </div>

        <div className="flex-1 overflow-hidden px-3">
          <Tabs defaultValue="my-projects" className="w-full h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mb-3 bg-black/40 border border-border rounded-xl p-1 h-auto">
              <TabsTrigger value="my-projects" className="rounded-lg text-xs py-1.5 font-medium data-[state=active]:bg-card/80 data-[state=active]:text-foreground data-[state=active]:shadow-md transition-all">My Projects</TabsTrigger>
              <TabsTrigger value="shared" className="rounded-lg text-xs py-1.5 font-medium data-[state=active]:bg-card/80 data-[state=active]:text-foreground data-[state=active]:shadow-md transition-all">Shared</TabsTrigger>
            </TabsList>
            
            <TabsContent value="my-projects" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col">
              <ScrollArea className="h-full">
                {myProjects.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground mt-8">
                    <p>No projects found.</p>
                    <p className="mt-1">Create a new project to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-1 mt-1">
                    {myProjects.map(renderProjectItem)}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="shared" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col">
              <ScrollArea className="h-full">
                {sharedProjects.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground mt-8">
                    <p>No shared projects.</p>
                  </div>
                ) : (
                  <div className="space-y-1 mt-1">
                    {sharedProjects.map(renderProjectItem)}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        <div className="p-4 mt-auto shrink-0 border-t border-border/50">
          <Button onClick={openCreateDialog} className="w-full flex items-center justify-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold rounded-xl h-11 shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] transition-all duration-300">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>
    </>
  );
}
