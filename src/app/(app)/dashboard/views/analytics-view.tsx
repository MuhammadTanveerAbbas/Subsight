"use client";

import { useEffect, useMemo, useState } from "react";
import { TrendingUp, Layers, PauseCircle, CalendarClock, Wallet, ArrowUpRight } from "lucide-react";
import { buildCatData } from "@/lib/chart-helpers";
import { fetchVault } from "@/lib/vault-api";
import type { T } from "@/app/(app)/dashboard/dashboard-constants";
import type { Sub } from "@/app/(app)/dashboard/dashboard-types";

/* Embedded in the dashboard page. It adds the deep-dive numbers and the
   personal vault card; the trend and category charts live in the dashboard. */
export function AnalyticsView({
  t, subs, onNav,
}: {
  t: T;
  subs: Sub[];
  onNav?: (id: string, tab?: string) => void;
}) {
  const active   = useMemo(() => subs.filter((s) => s.status === "active"), [subs]);
  const inactive = useMemo(() => subs.filter((s) => s.status === "inactive"), [subs]);
  const catData  = useMemo(() => buildCatData(subs), [subs]);

  const topSub       = useMemo(() => active.slice().sort((a, b) => b.amount - a.amount)[0], [active]);
  const topCat       = useMemo(() => catData[0], [catData]);
  const wastedMonthly = useMemo(() => inactive.reduce((a, s) => a + s.amount, 0), [inactive]);
  const monthlyCount = useMemo(() => active.filter((s) => s.cycle.toLowerCase() === "monthly").length, [active]);
  const annualCount  = useMemo(() => active.filter((s) => ["annually", "yearly"].includes(s.cycle.toLowerCase())).length, [active]);

  const [vaultSummary, setVaultSummary] = useState<{ total: number; currency: string } | null>(null);
  useEffect(() => {
    let alive = true;
    fetchVault()
      .then((data) => {
        if (!alive) return;
        setVaultSummary({
          total: data.items.reduce((sum, i) => sum + i.amount, 0),
          currency: data.settings.currency,
        });
      })
      .catch(() => { /* vault data is optional here */ });
    return () => { alive = false; };
  }, []);

  const stats = [
    { l: "Highest Single Sub", v: topSub ? `$${topSub.amount.toFixed(2)}` : "-", n: topSub ? topSub.name : "No active subs", Icon: TrendingUp },
    { l: "Top Category", v: topCat ? `${topCat.value}%` : "-", n: topCat ? topCat.name : "No data", Icon: Layers },
    { l: "Inactive Cost / mo", v: wastedMonthly > 0 ? `$${wastedMonthly.toFixed(2)}` : "$0.00", n: `${inactive.length} paused sub${inactive.length !== 1 ? "s" : ""}`, Icon: PauseCircle },
    { l: "Billing Mix", v: active.length ? `${monthlyCount}m / ${annualCount}y` : "-", n: `${active.length} active total`, Icon: CalendarClock },
  ];

  return (
    <>
      <style>{`
        @media (max-width: 900px) { .ana-kpi-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 560px) { .ana-kpi-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="ana-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {stats.map((s) => (
            <div key={s.l} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: "18px 18px 16px", minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ width: 26, height: 26, borderRadius: 7, background: t.surface2, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <s.Icon size={13} strokeWidth={1.8} color={t.text3} aria-hidden="true" />
                </span>
                <span style={{ fontSize: 10, color: t.text3, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", lineHeight: 1.4 }}>
                  {s.l}
                </span>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: t.text, letterSpacing: -0.6, lineHeight: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {s.v}
              </div>
              <div style={{ fontSize: 10.5, color: t.text3, fontFamily: "var(--font-mono)", marginTop: 7, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {s.n}
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <span style={{ width: 34, height: 34, borderRadius: 9, background: t.greenDim, border: `1px solid ${t.greenBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Wallet size={16} color={t.green} />
          </span>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.text, fontFamily: "var(--font-display)" }}>Vault · personal expenses</div>
            <div style={{ fontSize: 10.5, color: t.text3, fontFamily: "var(--font-mono)", marginTop: 3, lineHeight: 1.5 }}>
              {vaultSummary
                ? `${new Intl.NumberFormat("en-US", { style: "currency", currency: vaultSummary.currency, maximumFractionDigits: 2 }).format(vaultSummary.total)} logged in your private vault. Not included in the figures above.`
                : "Track personal expenses privately in your vault, separate from subscriptions."}
            </div>
          </div>
          <button
            onClick={() => onNav?.("vault", "analytics")}
            style={{ background: t.surface2, border: `1px solid ${t.border2}`, borderRadius: 8, padding: "9px 14px", color: t.text, cursor: "pointer", fontSize: 12, fontFamily: "var(--font-display)", display: "flex", alignItems: "center", gap: 7 }}
          >
            View vault analytics <ArrowUpRight size={13} />
          </button>
        </div>
      </div>
    </>
  );
}
