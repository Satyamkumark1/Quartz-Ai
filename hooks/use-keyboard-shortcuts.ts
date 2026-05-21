import { useEffect } from "react";
import { ReactFlowInstance } from "@xyflow/react";

interface UseKeyboardShortcutsProps {
  reactFlowInstance: ReactFlowInstance<any, any> | null;
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

      if (event.key === "-" ) {
        event.preventDefault();
        reactFlowInstance.zoomOut({ duration: 200 });
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        const selectedNodes = reactFlowInstance.getNodes().filter((n) => n.selected);
        const selectedEdges = reactFlowInstance.getEdges().filter((e) => e.selected);

        if (selectedNodes.length > 0 || selectedEdges.length > 0) {
          event.preventDefault();
          reactFlowInstance.deleteElements({
            nodes: selectedNodes,
            edges: selectedEdges,
          });
        }
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [reactFlowInstance, undo, redo]);
}
