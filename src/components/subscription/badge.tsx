"use client";

import { type SubStatus } from "@/app/(app)/dashboard/dashboard-types";
import { type T } from "@/app/(app)/dashboard/dashboard-constants";

export function Badge({ status, t }: { status: SubStatus; t: T }) {
  const cfg: Record<SubStatus, { color: string; bg: string; label: string }> = {
    active: { color: t.green, bg: t.greenDim, label: "Active" },
    warning: { color: t.amber, bg: t.amberDim, label: "Due Soon" },
    renewal_passed: { color: t.red, bg: t.redDim, label: "Renewal Passed" },
    inactive: { color: t.text3, bg: t.surface2, label: "Inactive" },
  };
  const c = cfg[status];
  return (
    <span
      style={{
        fontSize: 10,
        color: c.color,
        background: c.bg,
        border: `1px solid ${c.color}33`,
        borderRadius: 4,
        padding: "3px 8px",
        fontFamily: "var(--font-mono)",
        whiteSpace: "nowrap",
      }}
    >
      {c.label}
    </span>
  );
}
