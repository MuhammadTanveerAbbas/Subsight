import { DARK as DARK_THEME, LIGHT as LIGHT_THEME } from "@/app/(marketing)/marketing-constants";

export const DARK = { ...DARK_THEME, navBg: "rgba(12,12,12,0.95)" } as const;
export const LIGHT = { ...LIGHT_THEME, navBg: "rgba(240,240,238,0.95)" } as const;

export type T = typeof DARK | typeof LIGHT;
export type { TK, SubStatus, Sub } from "./dashboard-types";

import {
  LayoutDashboard, CreditCard, BarChart3, Sparkles, Download,
  Settings, User, Plus, Receipt,
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
  { id:"billing",  label:"Billing",  Icon:Receipt },
  { id:"settings", label:"Settings", Icon:Settings },
  { id:"profile",  label:"Profile",  Icon:User },
];
