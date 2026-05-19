"use client";

import { useState, useEffect, useMemo } from "react";
import { useProjectDialogs, type Project } from "./project-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}


function RenameDialogContent({
  project,
  onOpenChange,
}: {
  project: Project;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [renameName, setRenameName] = useState(project.name);
  const { renameProject, isPending } = useProjectActions();

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await renameProject(project.id, renameName);
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Rename Project</DialogTitle>
        <DialogDescription>
          Currently renaming <strong>{project.name}</strong>.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleRenameSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="rename">New Name</Label>
          <Input
            id="rename"
            autoFocus
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            placeholder="Project Name"
            required
            disabled={isPending}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

import { useProjectActions, generateRoomId } from "@/hooks/use-project-actions";

export function ProjectDialogs() {
  const {
    isCreateOpen,
    setIsCreateOpen,
    isRenameOpen,
    setIsRenameOpen,
    isDeleteOpen,
    setIsDeleteOpen,
    selectedProject,
  } = useProjectDialogs();

  const { createProject, deleteProject, isPending } = useProjectActions();

  // Create Project State
  const [createName, setCreateName] = useState("");
  
  // Calculate slug and ID only when dialog is open and name changes
  const createRoomId = useMemo(() => {
    if (!isCreateOpen) return "";
    return generateRoomId(createName || "Untitled Project");
  }, [createName, isCreateOpen]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createProject(createName, createRoomId);
    setCreateName("");
  };

  const handleDeleteSubmit = async () => {
    if (selectedProject) {
      await deleteProject(selectedProject.id);
    }
  };

  return (
    <>
      {/* Create Project Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Project</DialogTitle>
            <DialogDescription>
              Start a new architecture workspace.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                autoFocus
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="e.g. Core Infrastructure"
                required
                disabled={isPending}
              />
            </div>
            {createName && (
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <span>Room ID:</span>
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                  {createRoomId}
                </code>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rename Project Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        {selectedProject && (
          <RenameDialogContent
            key={`${selectedProject.id}-${isRenameOpen}`}
            project={selectedProject}
            isOpen={isRenameOpen}
            onOpenChange={setIsRenameOpen}
          />
        )}
      </Dialog>

      {/* Delete Project Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedProject?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSubmit} disabled={isPending}>
              {isPending ? "Deleting..." : "Delete Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
