"use client";

import { useState, useRef, useEffect, KeyboardEvent, type ReactNode } from "react";
import { Bot, X, Send, FileText, Download, Sparkles, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import type { designAgent } from "@/trigger/design-agent";
import {
  useCreateFeedMessage,
  useCreateFeed,
  useEventListener,
  useFeedMessages,
  useOthers,
  useSelf,
  useStorage,
} from "@liveblocks/react";
import { useNodes, useEdges } from "@xyflow/react";
import {
  AI_STATUS_FEED_ID,
  AI_CHAT_FEED_ID,
  isAiStatusFeedMessage,
  isAiChatFeedMessage,
  type AiStatusFeedMessage,
  type AiChatFeedMessage,
} from "@/types/tasks";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sender?: {
    name: string;
    avatar: string;
  };
}

const STARTER_CHIPS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
];

const DEMO_SPEC = {
  title: "E-Commerce Backend",
  snippet:
    "RESTful API with product catalog, cart management, payment gateway integration, and order tracking. Uses PostgreSQL for persistence and Redis for caching.",
};

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  hasRoom?: boolean;
  roomId?: string;
}

type AiStatusState = {
  isActive: boolean;
  message: AiStatusFeedMessage | null;
};

interface AiSidebarRoomContext {
  status: AiStatusState;
  chat: {
    messages: Message[];
    sendMessage: (text: string) => void | Promise<void>;
  };
  runId?: string;
}

export function AiSidebar({ isOpen, onClose, hasRoom = false, roomId }: AiSidebarProps) {
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fallbackStatus: AiStatusState = { isActive: false, message: null };

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const capped = Math.min(ta.scrollHeight, 160);
    ta.style.height = `${Math.max(72, capped)}px`;
  }, [input]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  function handleSendMessage(text: string, roomContext: AiSidebarRoomContext) {
    const trimmed = text.trim();
    if (!trimmed || roomContext.status.isActive) return;

    if (hasRoom) {
      roomContext.chat.sendMessage(trimmed);
      setInput("");
    } else {
      const id = `${Date.now()}-${Math.random()}`;
      setLocalMessages((prev) => [
        ...prev,
        { id, role: "user", content: trimmed },
      ]);
      setInput("");
      // Stub assistant reply
      setTimeout(() => {
        setLocalMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-assistant`,
            role: "assistant",
            content: `Got it! I'll help you with: "${trimmed}". Architecture generation and AI responses are coming soon.`,
          },
        ]);
      }, 600);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>, roomContext: AiSidebarRoomContext) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input, roomContext);
    }
  }

  const [isSpecPending, setIsSpecPending] = useState(false);

  const nodes = useNodes();
  const edges = useEdges();

  const handleGenerateSpec = async () => {
    if (!hasRoom || !roomId || isSpecPending) return;

    setIsSpecPending(true);
    try {
      // Get room messages for context
      const roomContextMessages = localMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/ai/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          chatHistory: roomContextMessages,
          nodes,
          edges,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      // The status updates will come through the liveblocks feed
    } catch (err) {
      console.error("Failed to generate spec:", err);
    } finally {
      setIsSpecPending(false);
    }
  };

  const localRoomContext: AiSidebarRoomContext = {
    status: fallbackStatus,
    chat: {
      messages: localMessages,
      sendMessage: (text) => handleSendMessage(text, localRoomContext),
    },
  };

  return (
    <>
      {/* Floating sidebar panel */}
      <div
        className={[
          "fixed top-16 right-4 bottom-4 z-30",
          "w-[360px] flex flex-col",
          "glass-panel rounded-2xl shadow-2xl shadow-black/80",
          "transition-all duration-300 ease-in-out",
          isOpen
            ? "translate-x-0 opacity-100 pointer-events-auto"
            : "translate-x-[110%] opacity-0 pointer-events-none",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_10px_rgba(34,211,238,0.1)]">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-foreground tracking-tight leading-tight">AI Workspace</h3>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Collaborate with Ghost</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl transition-colors"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close AI sidebar</span>
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="architect" className="flex flex-col flex-1 min-h-0">
          <TabsList className="shrink-0 mx-5 mt-4 mb-1 bg-black/40 border border-border rounded-xl p-1 h-auto">
            <TabsTrigger
              value="architect"
              className="flex-1 text-xs py-1.5 font-medium rounded-lg text-muted-foreground data-[state=active]:bg-card/80 data-[state=active]:text-foreground data-[state=active]:shadow-md transition-all"
            >
              AI Architect
            </TabsTrigger>
            <TabsTrigger
              value="specs"
              className="flex-1 text-xs py-1.5 font-medium rounded-lg text-muted-foreground data-[state=active]:bg-card/80 data-[state=active]:text-foreground data-[state=active]:shadow-md transition-all"
            >
              Specs
            </TabsTrigger>
          </TabsList>

          {/* AI Architect Tab */}
          {hasRoom && roomId ? (
            <AiSidebarRoomState roomId={roomId}>
              {(roomContext) => (
                <ArchitectTabContent
                  roomContext={roomContext}
                  hasRoom={hasRoom}
                  localMessages={localMessages}
                  input={input}
                  setInput={setInput}
                  handleKeyDown={handleKeyDown}
                  handleSendMessage={handleSendMessage}
                  handleGenerateSpec={handleGenerateSpec}
                  isSpecPending={isSpecPending}
                />
              )}
            </AiSidebarRoomState>
          ) : (
            <ArchitectTabContent
              roomContext={localRoomContext}
              hasRoom={hasRoom}
              localMessages={localMessages}
              input={input}
              setInput={setInput}
              handleKeyDown={handleKeyDown}
              handleSendMessage={handleSendMessage}
              handleGenerateSpec={handleGenerateSpec}
              isSpecPending={isSpecPending}
            />
          )}

          {/* Specs Tab */}
          <TabsContent value="specs" className="flex flex-col flex-1 min-h-0 mt-3">
            <div className="flex flex-col gap-5 px-5 pb-5">
              {/* Generate button */}
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm h-11 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] transition-all duration-300"
                onClick={handleGenerateSpec}
                disabled={!hasRoom || isSpecPending}
              >
                {isSpecPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Generate Spec
              </Button>

              {/* Demo spec card */}
              <div className="rounded-xl border border-border bg-card/50 hover:bg-white/[0.04] hover:border-primary/30 transition-all duration-300 p-4 flex flex-col gap-3 shadow-md group">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm font-semibold text-foreground leading-tight tracking-tight">{DEMO_SPEC.title}</p>
                    <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed line-clamp-3">
                      {DEMO_SPEC.snippet}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 mt-1 border-t border-border/50">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                    v1.0 · 2 pages
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled
                    className="h-7 px-2.5 text-[11px] text-muted-foreground rounded-lg gap-1.5 hover:text-foreground hover:bg-white/10"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </Button>
                </div>
              </div>

              {/* Info note */}
              <p className="text-[11px] text-muted-foreground leading-relaxed text-center font-medium mt-auto">
                Spec generation is wired to the AI Architect output.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

const ArchitectTabContent = ({
  roomContext,
  hasRoom,
  localMessages,
  input,
  setInput,
  handleKeyDown,
  handleSendMessage,
  handleGenerateSpec,
  isSpecPending,
}: {
  roomContext: AiSidebarRoomContext;
  hasRoom: boolean;
  localMessages: Message[];
  input: string;
  setInput: (val: string) => void;
  handleKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>, ctx: AiSidebarRoomContext) => void;
  handleSendMessage: (text: string, ctx: AiSidebarRoomContext) => void;
  handleGenerateSpec: () => void;
  isSpecPending: boolean;
}) => {
  const { status, chat } = roomContext;
  const isAiActive = status.isActive;
  const statusText = status.message?.text;
  const messages = hasRoom ? chat.messages : localMessages;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const capped = Math.min(ta.scrollHeight, 160);
    ta.style.height = `${Math.max(72, capped)}px`;
  }, [input]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <TabsContent value="architect" className="flex flex-col flex-1 min-h-0 mt-3">
      {/* Chat scroll area */}
      <div className="flex-1 min-h-0 px-4">
        <ScrollArea className="h-full">
          {messages.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center text-center pt-8 pb-6 gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.15)] relative">
                <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-ping opacity-20" />
                <Sparkles className="h-6 w-6 text-primary relative z-10" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-foreground tracking-tight">Quartz-Ai Architect</p>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed max-w-[240px] mx-auto">
                  Describe a system and I&apos;ll help design the architecture diagram.
                </p>
              </div>
              {/* Starter chips */}
              <div className="flex flex-col gap-2 w-full mt-2">
                {STARTER_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleSendMessage(chip, roomContext)}
                    disabled={isAiActive}
                    className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-card border border-border text-left text-[13px] font-medium text-foreground hover:bg-white/[0.04] hover:border-primary/30 transition-all duration-300 group disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="truncate">{chip}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages */
            <div className="flex flex-col gap-4 pb-4">
              {messages.map((msg) =>
                msg.role === "user" ? (
                  <div key={msg.id} className="flex flex-col items-end gap-1.5">
                    {hasRoom && msg.sender && (
                      <div className="flex items-center gap-1.5 px-1">
                        <span className="text-[10px] font-medium text-muted-foreground">
                          {msg.sender.name}
                        </span>
                        <img
                          src={msg.sender.avatar}
                          alt={msg.sender.name}
                          className="h-4 w-4 rounded-full border border-border"
                        />
                      </div>
                    )}
                    <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-tr-sm bg-primary/20 border border-primary/30 text-foreground text-[13px] leading-relaxed font-medium shadow-[0_0_10px_rgba(34,211,238,0.05)]">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div key={msg.id} className="flex flex-col items-start gap-1.5">
                    <div className="max-w-[90%] px-3.5 py-2.5 rounded-2xl rounded-tl-sm bg-card border border-border text-foreground text-[13px] leading-relaxed shadow-sm">
                      {msg.content}
                    </div>
                  </div>
                )
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Status strip */}
      {isAiActive && statusText && (
        <div className="mx-4 mt-2 flex items-center gap-2.5 rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-2.5 text-[11px] text-primary shadow-[0_0_10px_rgba(34,211,238,0.05)]">
          <div className="relative flex h-2.5 w-2.5 items-center justify-center">
            <div className="absolute h-full w-full animate-ping rounded-full bg-primary opacity-75"></div>
            <div className="relative h-1.5 w-1.5 rounded-full bg-primary"></div>
          </div>
          <span className="min-w-0 truncate font-medium">{statusText}</span>
        </div>
      )}

      {/* Input area */}
      <div className="shrink-0 p-5 pt-3 border-t border-border mt-2 bg-background/50 backdrop-blur-md rounded-b-2xl">
        <div className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, roomContext)}
            placeholder="Describe your system..."
            disabled={isAiActive}
            className="flex-1 resize-none min-h-[72px] max-h-[160px] bg-card border-border text-foreground placeholder:text-muted-foreground text-[13px] rounded-xl focus-visible:ring-primary/30 focus-visible:ring-2 focus-visible:border-primary/50 leading-relaxed disabled:cursor-not-allowed disabled:opacity-60 shadow-sm"
          />
          <Button
            size="icon"
            className="h-10 w-10 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-all active:scale-95 disabled:bg-card disabled:text-muted-foreground disabled:scale-100 disabled:shadow-none disabled:border disabled:border-border"
            onClick={() => handleSendMessage(input, roomContext)}
            disabled={!input.trim() || isAiActive}
          >
            {isAiActive ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send message</span>
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center font-medium uppercase tracking-widest">
          Enter to send · Shift+Enter for newline
        </p>
      </div>
    </TabsContent>
  );
};

function AiSidebarRoomState({
  children,
  roomId,
}: {
  children: (context: AiSidebarRoomContext) => ReactNode;
  roomId: string;
}) {
  const self = useSelf();
  const createFeed = useCreateFeed();
  const addFeedMessage = useCreateFeedMessage();
  const { messages: statusMessages } = useFeedMessages(AI_STATUS_FEED_ID, { limit: 10 });
  const { messages: chatFeedMessages } = useFeedMessages(AI_CHAT_FEED_ID, { limit: 50 });
  const [eventMessage, setEventMessage] = useState<AiStatusFeedMessage | null>(null);

  const [runId, setRunId] = useState<string | undefined>();
  const [publicToken, setPublicToken] = useState<string | undefined>();

  const { run } = useRealtimeRun<typeof designAgent>(runId, {
    accessToken: publicToken,
    enabled: !!runId && !!publicToken,
  });

  const isPresenceActive = useOthers((others) =>
    others.some((other) => other.presence.thinking || other.presence.isThinking)
  );

  useEffect(() => {
    createFeed(AI_STATUS_FEED_ID, { metadata: { type: "ai-status" } }).catch(() => {
      // The feed may already exist
    });
    createFeed(AI_CHAT_FEED_ID, { metadata: { type: "ai-chat" } }).catch(() => {
      // The feed may already exist
    });
  }, [createFeed]);

  // Monitor run status for completion
  useEffect(() => {
    if (!run || !runId) return;

    if (run.status === "COMPLETED") {
      const payload: AiChatFeedMessage = {
        type: "ai-chat",
        role: "assistant",
        content: "I've updated the canvas based on your request!",
        createdAt: new Date().toISOString(),
      };
      addFeedMessage(AI_CHAT_FEED_ID, payload).catch(console.error);
      
      // Use setTimeout to avoid synchronous setState in effect warning
      setTimeout(() => {
        setRunId(undefined);
        setPublicToken(undefined);
      }, 0);
    } else if (
      run.status === "FAILED" ||
      run.status === "CANCELED" ||
      run.status === "CRASHED"
    ) {
      const payload: AiChatFeedMessage = {
        type: "ai-chat",
        role: "assistant",
        content: "Sorry, I encountered an error while updating the canvas.",
        createdAt: new Date().toISOString(),
      };
      addFeedMessage(AI_CHAT_FEED_ID, payload).catch(console.error);
      
      setTimeout(() => {
        setRunId(undefined);
        setPublicToken(undefined);
      }, 0);
    }
  }, [run?.status, runId, addFeedMessage]);

  useEventListener(({ event }) => {
    const e = event as Record<string, unknown>;
    if (e.type !== "ai-status") return;

    const candidate = {
      type: "ai-status" as const,
      text: e.text as string,
      state: e.state as AiStatusFeedMessage["state"],
      createdAt: e.createdAt as string,
    };

    if (isAiStatusFeedMessage(candidate)) {
      setEventMessage(candidate);
    }
  });

  const latestFeedStatus =
    (statusMessages ?? [])
      .map((message) => message.data)
      .filter((data): data is AiStatusFeedMessage => isAiStatusFeedMessage(data))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .at(-1) ?? null;

  const latestStatus =
    eventMessage &&
    (!latestFeedStatus || eventMessage.createdAt >= latestFeedStatus.createdAt)
      ? eventMessage
      : latestFeedStatus;

  const isFeedActive =
    latestStatus?.state === "started" || latestStatus?.state === "processing";

  const isRunActive =
    run !== undefined &&
    run.status !== "COMPLETED" &&
    run.status !== "CANCELED" &&
    run.status !== "FAILED" &&
    run.status !== "CRASHED" &&
    run.status !== "SYSTEM_FAILURE" &&
    run.status !== "EXPIRED" &&
    run.status !== "TIMED_OUT";

  const chatMessages: Message[] = (chatFeedMessages ?? [])
    .map((msg) => ({ id: msg.id, data: msg.data }))
    .filter((item): item is { id: string; data: AiChatFeedMessage } => isAiChatFeedMessage(item.data))
    .sort((a, b) => a.data.createdAt.localeCompare(b.data.createdAt))
    .map((item) => ({
      id: item.id,
      role: item.data.role,
      content: item.data.content,
      sender: item.data.sender,
    }));

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Push user message to chat feed
    const payload: AiChatFeedMessage = {
      type: "ai-chat",
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
      sender: self?.info
        ? {
            name: self.info.name,
            avatar: self.info.avatar,
          }
        : undefined,
    };

    try {
      await addFeedMessage(AI_CHAT_FEED_ID, payload);

      // Trigger design agent
      const response = await fetch("/api/ai/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed, roomId }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setRunId(data.runId);
      setPublicToken(data.publicToken);
    } catch (err) {
      console.error("Failed to trigger design agent:", err);
      const errorPayload: AiChatFeedMessage = {
        type: "ai-chat",
        role: "assistant",
        content: "Failed to start the design process. Please try again.",
        createdAt: new Date().toISOString(),
      };
      addFeedMessage(AI_CHAT_FEED_ID, errorPayload).catch(console.error);
    }
  };

  return children({
    status: {
      isActive: isPresenceActive || isFeedActive || isRunActive,
      message: latestStatus,
    },
    chat: {
      messages: chatMessages,
      sendMessage,
    },
    runId,
  });
}
