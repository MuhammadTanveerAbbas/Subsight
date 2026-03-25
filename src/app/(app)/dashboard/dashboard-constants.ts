// Extracted constants to reduce module size and improve webpack cache performance

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
  id: string; name: string; category: string; amount: number;
  cycle: string; nextDate: string; status: SubStatus;
  autoRenew: boolean; currency: string; provider: string; notes: string;
}

export const MOCK_SUBS: Sub[] = [
  { id:"1", name:"Netflix",   category:"Streaming",    amount:15.99, cycle:"Monthly",   nextDate:"Apr 3, 2026",  status:"active",          autoRenew:true,  currency:"USD", provider:"Netflix Inc.",   notes:"" },
  { id:"2", name:"Notion",    category:"Productivity", amount:16.00, cycle:"Monthly",   nextDate:"Apr 8, 2026",  status:"active",          autoRenew:true,  currency:"USD", provider:"Notion Labs",    notes:"" },
  { id:"3", name:"AWS",       category:"Cloud",        amount:43.20, cycle:"Monthly",   nextDate:"Apr 1, 2026",  status:"warning",         autoRenew:true,  currency:"USD", provider:"Amazon",         notes:"Check usage before renewal" },
  { id:"4", name:"Spotify",   category:"Music",        amount:9.99,  cycle:"Monthly",   nextDate:"Apr 12, 2026", status:"active",          autoRenew:true,  currency:"USD", provider:"Spotify AB",     notes:"" },
  { id:"5", name:"Figma",     category:"Design",       amount:15.00, cycle:"Monthly",   nextDate:"Apr 5, 2026",  status:"active",          autoRenew:false, currency:"USD", provider:"Figma Inc.",     notes:"" },
  { id:"6", name:"GitHub",    category:"Development",  amount:4.00,  cycle:"Monthly",   nextDate:"Apr 15, 2026", status:"active",          autoRenew:true,  currency:"USD", provider:"Microsoft",      notes:"" },
  { id:"7", name:"Cursor AI", category:"Development",  amount:29.00, cycle:"Monthly",   nextDate:"Mar 12, 2026", status:"renewal_passed",  autoRenew:true,  currency:"USD", provider:"Anysphere Inc.", notes:"" },
  { id:"8", name:"Adobe CC",  category:"Design",       amount:54.99, cycle:"Monthly",   nextDate:"Apr 20, 2026", status:"active",          autoRenew:true,  currency:"USD", provider:"Adobe Inc.",     notes:"Considering cancellation" },
];

export const MONTHLY_DATA = [
  { month:"Jan",spend:290 },{ month:"Feb",spend:310 },{ month:"Mar",spend:275 },
  { month:"Apr",spend:340 },{ month:"May",spend:420 },{ month:"Jun",spend:380 },
  { month:"Jul",spend:310 },{ month:"Aug",spend:460 },{ month:"Sep",spend:390 },
  { month:"Oct",spend:350 },{ month:"Nov",spend:430 },{ month:"Dec",spend:388 },
];

export const CAT_DATA = [
  { name:"Development", value:33, color:"#22c55e" },
  { name:"Design",      value:27, color:"#3b82f6" },
  { name:"Cloud",       value:22, color:"#f59e0b" },
  { name:"Streaming",   value:11, color:"#ef4444" },
  { name:"Other",       value:7,  color:"#8b5cf6" },
];

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
