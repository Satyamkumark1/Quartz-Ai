export const AI_STATUS_FEED_ID = "ai-status-feed";
export const AI_CHAT_FEED_ID = "ai-chat-feed";

export type AiStatusState = "started" | "processing" | "complete" | "error";

export type AiStatusFeedMessage = {
  type: "ai-status";
  text?: string;
  state: AiStatusState;
  createdAt: string;
};

export type AiChatFeedMessage = {
  type: "ai-chat";
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  sender?: {
    name: string;
    avatar: string;
  };
};

export function isAiStatusFeedMessage(value: unknown): value is AiStatusFeedMessage {
  if (!value || typeof value !== "object") return false;

  const record = value as Record<string, unknown>;
  const state = record.state;

  return (
    record.type === "ai-status" &&
    typeof record.createdAt === "string" &&
    (record.text === undefined || typeof record.text === "string") &&
    (state === "started" ||
      state === "processing" ||
      state === "complete" ||
      state === "error")
  );
}

export function isAiChatFeedMessage(value: unknown): value is AiChatFeedMessage {
  if (!value || typeof value !== "object") return false;

  const record = value as Record<string, unknown>;

  return (
    record.type === "ai-chat" &&
    (record.role === "user" || record.role === "assistant") &&
    typeof record.content === "string" &&
    typeof record.createdAt === "string" &&
    (record.sender === undefined ||
      (typeof record.sender === "object" &&
        record.sender !== null &&
        "name" in record.sender &&
        "avatar" in record.sender))
  );
}
