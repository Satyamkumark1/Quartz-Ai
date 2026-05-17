import { PanelLeftOpen, PanelLeftClose } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export function EditorNavbar({ isSidebarOpen, toggleSidebar }: EditorNavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 bg-background border-b border-border z-40">
      <div className="flex items-center flex-1">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          {isSidebarOpen ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>
      <div className="flex items-center justify-center flex-1">
        {/* Center section stays empty for now */}
      </div>
      <div className="flex items-center justify-end flex-1">
        {/* Right section stays empty for now */}
      </div>
    </header>
  );
}
