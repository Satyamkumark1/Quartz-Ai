"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Trash2, Mail, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

interface Collaborator {
  id: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
  createdAt: string;
}

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  isOwner: boolean;
}

export function ShareDialog({ isOpen, onClose, projectId, isOwner }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const projectUrl = typeof window !== "undefined" ? `${window.location.origin}/editor/${projectId}` : "";

  useEffect(() => {
    if (isOpen) {
      fetchCollaborators();
    } else {
      setEmail("");
      setError(null);
    }
  }, [isOpen, projectId]);

  const fetchCollaborators = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`);
      if (!res.ok) throw new Error("Failed to load collaborators");
      const data = await res.json();
      setCollaborators(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(projectUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !isOwner) return;

    setIsInviting(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to invite collaborator");
      }

      setEmail("");
      await fetchCollaborators();
    } catch (err: any) {
      setError(err.message || "Failed to invite collaborator");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemove = async (collaboratorId: string) => {
    if (!isOwner) return;
    setRemovingId(collaboratorId);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators/${collaboratorId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to remove collaborator");
      }

      setCollaborators((prev) => prev.filter((c) => c.id !== collaboratorId));
    } catch (err: any) {
      setError(err.message || "Failed to remove collaborator");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#0f0f11] border-white/10 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="text-xl">Share Project</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Anyone with the link can view. Invite others to collaborate.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-medium text-zinc-300">Project Link</h4>
            <div className="flex items-center gap-2">
              <Input 
                readOnly 
                value={projectUrl} 
                className="bg-black/50 border-white/10 text-zinc-300 font-mono text-xs"
              />
              <Button 
                onClick={handleCopyLink} 
                variant="secondary" 
                size="icon"
                className="shrink-0 bg-white/5 hover:bg-white/10 text-zinc-300"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {isOwner && (
            <form onSubmit={handleInvite} className="flex flex-col gap-2">
              <h4 className="text-sm font-medium text-zinc-300">Invite Collaborator</h4>
              <div className="flex items-center gap-2">
                <Input
                  type="email"
                  placeholder="Email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isInviting}
                  className="bg-black/50 border-white/10 text-zinc-100 placeholder:text-zinc-600"
                />
                <Button 
                  type="submit" 
                  disabled={!email || isInviting}
                  className="shrink-0 bg-cyan-500 hover:bg-cyan-600 text-black font-medium"
                >
                  {isInviting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Invite"}
                </Button>
              </div>
              {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
            </form>
          )}

          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-medium text-zinc-300">Collaborators</h4>
            
            <ScrollArea className="h-[200px] w-full rounded-md border border-white/5 bg-black/20 p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
                </div>
              ) : collaborators.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                  <User className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">No collaborators yet</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {collaborators.map((c) => (
                    <div key={c.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        {c.imageUrl ? (
                          <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 border border-white/10">
                            <Image src={c.imageUrl} alt={c.name || c.email} width={32} height={32} />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 border border-white/10">
                            <User className="h-4 w-4 text-zinc-400" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-zinc-200">
                            {c.name || c.email.split("@")[0]}
                          </span>
                          <span className="text-xs text-zinc-500 truncate max-w-[150px]">
                            {c.email}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500 bg-white/5 px-2 py-1 rounded">
                          Collaborator
                        </span>
                        {isOwner && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemove(c.id)}
                            disabled={removingId === c.id}
                            className="h-7 w-7 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {removingId === c.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
