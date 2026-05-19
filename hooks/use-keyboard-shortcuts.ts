import { useEffect } from "react";
import { ReactFlowInstance } from "@xyflow/react";

interface UseKeyboardShortcutsProps {
  reactFlowInstance: ReactFlowInstance | null;
  undo: () => void;
  redo: () => void;
}

export function useKeyboardShortcuts({
  reactFlowInstance,
  undo,
  redo,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    if (!reactFlowInstance) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const isCmdOrCtrl = event.metaKey || event.ctrlKey;
      const isShift = event.shiftKey;

      if (isCmdOrCtrl && !isShift && event.key.toLowerCase() === "z") {
        event.preventDefault();
        undo();
        return;
      }

      if (
        (isCmdOrCtrl && isShift && event.key.toLowerCase() === "z") ||
        (isCmdOrCtrl && !isShift && event.key.toLowerCase() === "y")
      ) {
        event.preventDefault();
        redo();
        return;
      }

      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        reactFlowInstance.zoomIn({ duration: 200 });
        return;
      }

      if (event.key === "-") {
        event.preventDefault();
        reactFlowInstance.zoomOut({ duration: 200 });
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [reactFlowInstance, undo, redo]);
}
