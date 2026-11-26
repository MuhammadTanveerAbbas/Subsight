// Extracted constants to reduce module size and improve webpack cache performance

export const DARK = {
  bg:"#000000", surface:"#0a0a0a", surface2:"#141414", surface3:"#1e1e1e",
  border:"#2a2a2a", border2:"#3a3a3a",
  text:"#ffffff", text2:"rgba(255,255,255,0.62)", text3:"rgba(255,255,255,0.45)",
  green:"#22c55e", green2:"#16a34a", greenInk:"#4ade80",
  greenDim:"rgba(34,197,94,0.08)", greenBorder:"rgba(34,197,94,0.22)", greenGlow:"rgba(34,197,94,0)",
  red:"#ef4444", redDim:"rgba(239,68,68,0.10)",
  amber:"#f59e0b", amberDim:"rgba(245,158,11,0.10)",
  blue:"#3b82f6", blueDim:"rgba(59,130,246,0.10)",
  sidebarBg:"#000000",
  navBg:"rgba(11,12,10,0.94)", shadow:"rgba(0,0,0,0.50)", grid:"rgba(255,255,255,0.03)",
} as const;

export const LIGHT = {
  bg:"#ffffff", surface:"#f5f5f5", surface2:"#ebebeb", surface3:"#e1e1e1",
  border:"#d4d4d4", border2:"#bcbcbc",
  text:"#000000", text2:"rgba(0,0,0,0.62)", text3:"rgba(0,0,0,0.42)",
  green:"#16a34a", green2:"#128038", greenInk:"#15743c",
  greenDim:"rgba(22,163,74,0.08)", greenBorder:"rgba(22,163,74,0.22)", greenGlow:"rgba(22,163,74,0)",
  red:"#dc2626", redDim:"rgba(220,38,38,0.10)",
  amber:"#d97706", amberDim:"rgba(217,119,6,0.10)",
  blue:"#2563eb", blueDim:"rgba(37,99,235,0.10)",
  sidebarBg:"#ffffff",
  navBg:"rgba(247,247,243,0.94)", shadow:"rgba(0,0,0,0.10)", grid:"rgba(0,0,0,0.03)",
} as const;

export type Theme = typeof DARK | typeof LIGHT;
export type ThemeKey = "dark" | "light";
