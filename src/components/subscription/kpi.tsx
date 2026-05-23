"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import type { T } from "@/app/(app)/dashboard/dashboard-constants";

export function KPI({
  label,
  value,
  sub,
  Icon,
  trend,
  t,
}: {
  label: string;
  value: string;
  sub?: string;
  Icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  t: T;
}) {
  return (
    <div
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 12,
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: 10.5,
            color: t.text3,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: t.greenDim,
            border: `1px solid ${t.greenBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={14} color={t.green} strokeWidth={1.5} />
        </div>
      </div>
      <div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 28,
            fontWeight: 800,
            color: t.text,
            lineHeight: 1,
            letterSpacing: -1,
          }}
        >
          {value}
        </div>
        {sub && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              marginTop: 6,
            }}
          >
            {trend === "up" && <TrendingUp size={11} color={t.green} />}
            {trend === "down" && <TrendingDown size={11} color={t.red} />}
            <span
              style={{
                fontSize: 11,
                color:
                  trend === "up" ? t.green : trend === "down" ? t.red : t.text3,
                fontFamily: "var(--font-mono)",
              }}
            >
              {sub}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
