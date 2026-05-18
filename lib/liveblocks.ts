import { Liveblocks } from "@liveblocks/node";

const globalForLiveblocks = globalThis as unknown as {
  liveblocks: Liveblocks | undefined;
};

export const liveblocks =
  globalForLiveblocks.liveblocks ??
  new Liveblocks({
    secret: process.env.LIVEBLOCKS_SECRET_KEY || "sk_dev_dummy",
  });

if (process.env.NODE_ENV !== "production") globalForLiveblocks.liveblocks = liveblocks;

const COLORS = [
  "#E57373",
  "#9575CD",
  "#4FC3F7",
  "#81C784",
  "#FFF176",
  "#FF8A65",
  "#F06292",
  "#7986CB",
  "#81D4FA",
  "#F48FB1",
  "#80CBC4",
  "#CE93D8",
  "#BCAAA4",
  "#FFAB91",
  "#FFCC80",
  "#26A69A",
];

export function getUserColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
}
