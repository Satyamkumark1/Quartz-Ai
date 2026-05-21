"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useOthers } from "@liveblocks/react";

export function PresenceAvatars() {
  const { user } = useUser();
  const others = useOthers();

  if (!user) return null;

  // Filter out any connection that belongs to the current user
  const collaborators = others.filter((other) => other.id !== user.id);

  return (
    <div className="flex items-center gap-3 p-1.5 bg-card/85 border border-border rounded-xl shadow-2xl backdrop-blur-xl pointer-events-auto">
      {collaborators.length > 0 && (
        <div className="flex -space-x-2 overflow-hidden">
          {collaborators.slice(0, 5).map((collaborator) => {
            const name = collaborator.info?.name || "Collaborator";
            const avatar = collaborator.info?.avatar;
            const color = collaborator.info?.color || "#52525b";

            const initials = name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={collaborator.connectionId}
                className="relative inline-block h-8 w-8 rounded-full ring-2 ring-[#0a0a0a] flex items-center justify-center text-xs font-semibold text-zinc-200 select-none bg-zinc-800"
                title={name}
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt={name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span>{initials || "?"}</span>
                )}
                {/* Visual ring mapping to their active color */}
                <div
                  className="absolute inset-0 rounded-full border-2 pointer-events-none"
                  style={{ borderColor: color }}
                />
              </div>
            );
          })}
          {collaborators.length > 5 && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-400 ring-2 ring-[#0a0a0a] border border-border select-none">
              +{collaborators.length - 5}
            </div>
          )}
        </div>
      )}

      {collaborators.length > 0 && (
        <div className="w-px h-5 bg-border/80" />
      )}

      <div className="h-8 w-8 flex items-center justify-center shrink-0">
        <UserButton />
      </div>
    </div>
  );
}
