import { DARK as DARK_THEME, LIGHT as LIGHT_THEME } from "@/app/(marketing)/marketing-constants";

export const DARK = { ...DARK_THEME, navBg: "rgba(12,12,12,0.95)" } as const;
export const LIGHT = { ...LIGHT_THEME, navBg: "rgba(240,240,238,0.95)" } as const;

export type T = typeof DARK | typeof LIGHT;
export type { TK, SubStatus, Sub } from "./dashboard-types";

import {
  LayoutDashboard, CreditCard, Sparkles, Download,
  Settings, User, Plus, Receipt, Wallet,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  Icon: React.ElementType;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/* Sidebar is split into named categories. Each group gets its own header
   when expanded and a divider when collapsed. */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { id: "overview",      label: "Dashboard",        Icon: LayoutDashboard },
      { id: "ai-summary",    label: "AI Summary",       Icon: Sparkles },
    ],
  },
  {
    label: "Manage",
    items: [
      { id: "subscriptions", label: "Subscriptions",    Icon: CreditCard },
      { id: "add",           label: "Add Subscription", Icon: Plus },
      { id: "vault",         label: "Vault",            Icon: Wallet },
      { id: "export",        label: "Export",           Icon: Download },
    ],
  },
];

export const NAV_BOTTOM: NavItem[] = [
  { id: "billing",  label: "Billing",  Icon: Receipt },
  { id: "settings", label: "Settings", Icon: Settings },
  { id: "profile",  label: "Profile",  Icon: User },
];

export const NAV_ALL: NavItem[] = [
  ...NAV_GROUPS.flatMap((g) => g.items),
  ...NAV_BOTTOM,
];
