"use client";

import { CheckCircle2, Clock, AlertCircle, XCircle } from "lucide-react";
import { type SubStatus } from "@/app/(app)/dashboard/dashboard-types";
import { type T } from "@/app/(app)/dashboard/dashboard-constants";

const STATUS_CFG = (t: T): Record<SubStatus, { color: string; bg: string; border: string; label: string; Icon: React.ElementType }> => ({
  active: {
    color:  t.green,
    bg:     t.greenDim,
    border: `${t.green}33`,
    label:  "Active",
    Icon:   CheckCircle2,
  },
  warning: {
    color:  t.amber,
    bg:     t.amberDim,
    border: `${t.amber}33`,
    label:  "Due Soon",
    Icon:   Clock,
  },
  renewal_passed: {
    color:  t.red,
    bg:     t.redDim,
    border: `${t.red}33`,
    label:  "Overdue",
    Icon:   AlertCircle,
  },
  inactive: {
    color:  t.text3,
    bg:     t.surface2,
    border: t.border2,
    label:  "Inactive",
    Icon:   XCircle,
  },
});

export function Badge({ status, t }: { status: SubStatus; t: T }) {
  const c = STATUS_CFG(t)[status];
  return (
    <span
      style={{
        display:     "inline-flex",
        alignItems:  "center",
        gap:         5,
        fontSize:    10,
        fontWeight:  600,
        color:       c.color,
        background:  c.bg,
        border:      `1px solid ${c.border}`,
        borderRadius: 6,
        padding:     "3px 8px",
        fontFamily:  "var(--font-mono)",
        whiteSpace:  "nowrap",
        letterSpacing: "0.02em",
      }}
    >
      <c.Icon size={10} strokeWidth={2.2} aria-hidden="true" />
      {c.label}
    </span>
  );
}
