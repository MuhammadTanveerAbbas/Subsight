export const DARK = {
  bg:"#080808", surface:"#111111", surface2:"#181818", surface3:"#1e1e1e",
  border:"#1f1f1f", border2:"#2a2a2a",
  text:"#f0f0f0", text2:"#a0a0a0", text3:"#585858",
  green:"#22c55e", green2:"#16a34a",
  greenDim:"rgba(34,197,94,0.08)", greenBorder:"rgba(34,197,94,0.22)",
  red:"#ef4444", redDim:"rgba(239,68,68,0.10)",
  amber:"#f59e0b", amberDim:"rgba(245,158,11,0.10)",
  blue:"#3b82f6", blueDim:"rgba(59,130,246,0.10)",
  shadow:"rgba(0,0,0,0.70)", sidebarBg:"#0c0c0c",
  navBg:"rgba(12,12,12,0.95)",
} as const;

export const LIGHT = {
  bg:"#f8f8f6", surface:"#ffffff", surface2:"#f2f2ef", surface3:"#eaeae6",
  border:"#e4e4e0", border2:"#d0d0ca",
  text:"#111111", text2:"#545450", text3:"#888880",
  green:"#16a34a", green2:"#15803d",
  greenDim:"rgba(22,163,74,0.08)", greenBorder:"rgba(22,163,74,0.22)",
  red:"#dc2626", redDim:"rgba(220,38,38,0.10)",
  amber:"#d97706", amberDim:"rgba(217,119,6,0.10)",
  blue:"#2563eb", blueDim:"rgba(37,99,235,0.10)",
  shadow:"rgba(0,0,0,0.12)", sidebarBg:"#f0f0ee",
  navBg:"rgba(240,240,238,0.95)",
} as const;

export type TK = "dark" | "light";
export type T  = typeof DARK | typeof LIGHT;
export type SubStatus = "active" | "inactive" | "warning" | "renewal_passed";

export interface Sub {
  id: string;
  name: string;
  category: string;
  amount: number;
  cycle: string;
  nextDate: string;
  status: SubStatus;
  autoRenew: boolean;
  currency: string;
  provider: string;
  notes: string;
}

import {
  LayoutDashboard, CreditCard, BarChart3, Sparkles, Download,
  Settings, User, Plus,
} from "lucide-react";

export const NAV_MAIN = [
  { id:"overview",      label:"Overview",         Icon:LayoutDashboard },
  { id:"subscriptions", label:"Subscriptions",    Icon:CreditCard },
  { id:"analytics",     label:"Analytics",        Icon:BarChart3 },
  { id:"ai-summary",    label:"AI Summary",       Icon:Sparkles },
  { id:"add",           label:"Add Subscription", Icon:Plus },
  { id:"export",        label:"Export",           Icon:Download },
];

export const NAV_BOTTOM = [
  { id:"settings", label:"Settings", Icon:Settings },
  { id:"profile",  label:"Profile",  Icon:User },
];
