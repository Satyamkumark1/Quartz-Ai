import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useProjectDialogs } from "@/components/editor/project-context";

export function generateRoomId(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${slug}-${suffix}`;
}

export function useProjectActions() {
  const router = useRouter();
  const params = useParams();
  const currentRoomId = params?.roomId as string | undefined;
  
  const {
    setIsCreateOpen,
    setIsRenameOpen,
    setIsDeleteOpen,
  } = useProjectDialogs();
  
  const [isPending, setIsPending] = useState(false);

  const createProject = async (name: string, roomId: string) => {
    setIsPending(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: roomId, name }),
      });
      if (!res.ok) throw new Error("Failed to create project");
      const project = await res.json();
      setIsCreateOpen(false);
      router.push(`/editor/${project.id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  const renameProject = async (id: string, name: string) => {
    setIsPending(true);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to rename project");
      setIsRenameOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  const deleteProject = async (id: string) => {
    setIsPending(true);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete project");
      setIsDeleteOpen(false);
      if (currentRoomId === id) {
        router.push("/editor");
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  return {
    createProject,
    renameProject,
    deleteProject,
    isPending,
  };
}
