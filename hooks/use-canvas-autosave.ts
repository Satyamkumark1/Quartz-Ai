import { useCallback, useEffect, useRef, useState } from "react";

export function useCanvasAutosave({ projectId, nodes, edges }: { projectId: string; nodes: unknown[]; edges: unknown[] }) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const lastSaved = useRef<string>("");

  const save = useCallback(async () => {
    setStatus("saving");
    try {
      const body = JSON.stringify({ nodes, edges });
      if (body === lastSaved.current) {
        setStatus("saved");
        return;
      }
      await fetch(`/api/projects/${projectId}/canvas`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body,
      });
      lastSaved.current = body;
      setStatus("saved");
    } catch (e) {
      setStatus("error");
    }
  }, [projectId, nodes, edges]);

  useEffect(() => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(save, 1000); // debounce 1s
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, [nodes, edges, save]);

  return status;
}
