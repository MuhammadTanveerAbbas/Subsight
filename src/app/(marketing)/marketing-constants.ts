// Extracted constants to reduce module size and improve webpack cache performance

export const DARK = {
  bg:"#080808", surface:"#111111", surface2:"#181818", surface3:"#1e1e1e",
  border:"#1f1f1f", border2:"#2a2a2a",
  text:"#f0f0f0", text2:"#a0a0a0", text3:"#585858",
  green:"#22c55e", green2:"#16a34a",
  greenDim:"rgba(34,197,94,0.08)", greenBorder:"rgba(34,197,94,0.22)", greenGlow:"rgba(34,197,94,0.14)",
  red:"#ef4444", amber:"#f59e0b",
  navBg:"rgba(8,8,8,0.92)", shadow:"rgba(0,0,0,0.7)", grid:"rgba(255,255,255,0.025)",
} as const;

export const LIGHT = {
  bg:"#f8f8f6", surface:"#ffffff", surface2:"#f2f2ef", surface3:"#eaeae6",
  border:"#e4e4e0", border2:"#d0d0ca",
  text:"#111111", text2:"#545450", text3:"#888880",
  green:"#16a34a", green2:"#15803d",
  greenDim:"rgba(22,163,74,0.08)", greenBorder:"rgba(22,163,74,0.22)", greenGlow:"rgba(22,163,74,0.10)",
  red:"#dc2626", amber:"#d97706",
  navBg:"rgba(248,248,246,0.92)", shadow:"rgba(0,0,0,0.12)", grid:"rgba(0,0,0,0.04)",
} as const;

export type Theme = typeof DARK | typeof LIGHT;
export type ThemeKey = "dark" | "light";
