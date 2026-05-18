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
      className={`flex items-center justify-between p-2 rounded-md hover:bg-white/5 group ${
        currentRoomId === project.id ? "bg-white/5" : ""
      }`}
    >
      <Link href={`/editor/${project.id}`} className="flex items-center gap-3 overflow-hidden flex-1 cursor-pointer">
        {currentRoomId === project.id ? (
          <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0 ml-1.5 mr-1" />
        ) : (
          <div className="h-1.5 w-1.5 rounded-full bg-transparent shrink-0 ml-1.5 mr-1" />
        )}
        <span className={`text-sm truncate ${currentRoomId === project.id ? "text-zinc-100" : "text-zinc-400 group-hover:text-zinc-300"}`}>{project.name}</span>
      </Link>
      {project.isOwner && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center rounded-md hover:bg-white/10 text-zinc-400 hover:text-zinc-100 focus-visible:outline-none"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openRenameDialog(project)}>
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => openDeleteDialog(project)}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-72 bg-[#0f0f11] border-r border-border shadow-lg transform transition-transform duration-300 ease-in-out z-50 flex flex-col
          lg:static lg:translate-x-0 lg:w-[260px] lg:h-full lg:rounded-2xl lg:border lg:border-white/5 lg:shadow-none
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between p-4 h-14">
          <h2 className="font-semibold text-sm text-zinc-100">Projects</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden text-zinc-400">
            <X className="h-5 w-5" />
            <span className="sr-only">Close Sidebar</span>
          </Button>
        </div>

        <div className="flex-1 overflow-hidden px-2">
          <Tabs defaultValue="my-projects" className="w-full h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mb-2 bg-white/5 border border-white/5 rounded-full p-1 h-auto">
              <TabsTrigger value="my-projects" className="rounded-full text-xs py-1.5 data-[state=active]:bg-black data-[state=active]:text-white">My Projects</TabsTrigger>
              <TabsTrigger value="shared" className="rounded-full text-xs py-1.5 data-[state=active]:bg-black data-[state=active]:text-white">Shared</TabsTrigger>
            </TabsList>
            
            <TabsContent value="my-projects" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col">
              <ScrollArea className="h-full">
                {myProjects.length === 0 ? (
                  <div className="text-center text-sm text-zinc-500 mt-8">
                    <p>No projects found.</p>
                    <p className="mt-1">Create a new project to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-0.5 mt-2">
                    {myProjects.map(renderProjectItem)}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="shared" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col">
              <ScrollArea className="h-full">
                {sharedProjects.length === 0 ? (
                  <div className="text-center text-sm text-zinc-500 mt-8">
                    <p>No shared projects.</p>
                  </div>
                ) : (
                  <div className="space-y-0.5 mt-2">
                    {sharedProjects.map(renderProjectItem)}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        <div className="p-3 mt-auto">
          <Button onClick={openCreateDialog} className="w-full flex items-center justify-center gap-2 bg-cyan-400 hover:bg-cyan-500 text-black font-medium rounded-full h-10">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>
    </>
  );
}
