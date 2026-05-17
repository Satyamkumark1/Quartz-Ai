import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  return (
    <div
      className={`fixed top-0 left-0 h-screen w-80 bg-background border-r border-border shadow-lg transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-border h-14">
        <h2 className="font-semibold text-lg">Projects</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
          <span className="sr-only">Close Sidebar</span>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <Tabs defaultValue="my-projects" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="my-projects">My Projects</TabsTrigger>
            <TabsTrigger value="shared">Shared</TabsTrigger>
          </TabsList>
          <TabsContent value="my-projects" className="text-center text-sm text-muted-foreground mt-8">
            <p>No projects found.</p>
            <p className="mt-1">Create a new project to get started.</p>
          </TabsContent>
          <TabsContent value="shared" className="text-center text-sm text-muted-foreground mt-8">
            <p>No shared projects.</p>
          </TabsContent>
        </Tabs>
      </div>

      <div className="p-4 border-t border-border mt-auto">
        <Button className="w-full flex items-center justify-center gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>
    </div>
  );
}
