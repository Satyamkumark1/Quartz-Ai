"use client";

import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AccessDenied() {
  const router = useRouter();
  
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center text-center space-y-4 max-w-md">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Access Denied</h1>
          <p className="text-sm text-muted-foreground">
            You do not have permission to view this project or it does not exist.
          </p>
        </div>
        <Button className="mt-4" onClick={() => router.push("/editor")}>
          Return to Editor
        </Button>
      </div>
    </div>
  );
}
