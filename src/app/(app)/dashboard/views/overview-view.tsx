"use client";

import { useMemo } from "react";
import {
  DollarSign, CreditCard, TrendingUp, Zap, ChevronRight, Plus,
  AlertCircle, CalendarClock,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip,
  PieChart as RechartsPie, Pie, Cell,
} from "recharts";
import { KPI } from "@/components/subscription/kpi";
import { Badge } from "@/components/subscription/badge";
import { buildMonthlyData, buildCatData } from "@/lib/chart-helpers";
import { AnalyticsView } from "./analytics-view";
import type { T } from "@/app/(app)/dashboard/dashboard-constants";
import type { Sub } from "@/app/(app)/dashboard/dashboard-types";

type Nav = (id: string, tab?: string) => void;

const sectionTitle: React.CSSProperties = {
  fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700,
};

export function OverviewView({ t, subs, onNav }: { t: T; subs: Sub[]; onNav: Nav }) {
  const active      = useMemo(() => subs.filter((s) => s.status !== "inactive"), [subs]);
  const monthly     = useMemo(() => active.reduce((a, s) => a + s.amount, 0), [active]);
  const monthlyData = useMemo(() => buildMonthlyData(subs), [subs]);
  const catData     = useMemo(() => buildCatData(subs), [subs]);
  const dueSoon     = useMemo(() => subs.filter((s) => s.status === "warning" || s.status === "renewal_passed"), [subs]);

  const primaryBtn: React.CSSProperties = {
    background: t.green, color: "#000", border: "none", borderRadius: 10,
    padding: "10px 16px", fontSize: 12.5, fontWeight: 700,
    fontFamily: "var(--font-display)", cursor: "pointer",
    display: "flex", alignItems: "center", gap: 6,
  };

  if (subs.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "55vh", gap: 20, textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: t.greenDim, border: `1px solid ${t.greenBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CreditCard size={28} color={t.green} strokeWidth={1.5} />
        </div>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: t.text, letterSpacing: -0.5, marginBottom: 8 }}>
            Welcome to Subsight
          </h2>
          <p style={{ fontSize: 13, color: t.text3, fontFamily: "var(--font-mono)", lineHeight: 1.7, maxWidth: 380 }}>
            Add your subscriptions to see spending, renewal dates and analytics in one place.
          </p>
        </div>
        <button
          onClick={() => onNav("add")}
          style={{ ...primaryBtn, padding: "13px 28px", fontSize: 14 }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = t.green2)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = t.green)}
        >
          <Plus size={15} /> Add Your First Subscription
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <style>{`
        @media (max-width: 900px) { .dash-stats { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 560px) { .dash-stats { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* Page header: one primary action */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: t.text, letterSpacing: -0.5 }}>
            Dashboard
          </h2>
          <p style={{ fontSize: 11.5, color: t.text3, fontFamily: "var(--font-mono)", marginTop: 4, lineHeight: 1.5 }}>
            Spending, renewals and personal expenses in one view
          </p>
        </div>
        <button
          onClick={() => onNav("add")}
          style={primaryBtn}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = t.green2)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = t.green)}
        >
          <Plus size={14} /> Add subscription
        </button>
      </div>

      {/* KPI row */}
      <div className="kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
        <KPI t={t} label="Monthly Spend"  value={`$${monthly.toFixed(2)}`}                                            Icon={DollarSign}  sub={`${active.length} active subscriptions`} trend="neutral" />
        <KPI t={t} label="Active Subs"    value={`${active.length}`}                                                  Icon={CreditCard}  sub={`${subs.length} total tracked`} />
        <KPI t={t} label="Annual Cost"    value={`$${(monthly * 12).toFixed(0)}`}                                     Icon={TrendingUp}  sub="Projected this year" />
        <KPI t={t} label="Avg per Sub"    value={`$${active.length ? (monthly / active.length).toFixed(2) : "0.00"}`} Icon={Zap}         sub="Monthly average cost" trend="neutral" />
      </div>

      {/* Charts */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ ...sectionTitle, color: t.text }}>Spending overview</div>
        <div className="chart-2col" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, minWidth: 0 }}>
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: "20px 22px", minWidth: 0 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.text, fontFamily: "var(--font-display)" }}>Monthly Spending</div>
              <div style={{ fontSize: 10, color: t.text3, fontFamily: "var(--font-mono)", marginTop: 3, lineHeight: 1.4 }}>
                Projected monthly cost across 12 months
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <div style={{ minWidth: 280 }}>
                <ResponsiveContainer width="100%" height={190}>
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
                    <XAxis dataKey="month" tick={{ fontSize: 9, fill: t.text3, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: t.text3, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip contentStyle={{ background: t.surface2, border: `1px solid ${t.border2}`, borderRadius: 8, fontSize: 12, fontFamily: "var(--font-mono)", color: t.text }} formatter={(v: number) => [`$${v}`, "Spend"]} />
                    <Area type="monotone" dataKey="spend" stroke={t.green} strokeWidth={2} fill={t.greenDim} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: "20px 22px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.text, fontFamily: "var(--font-display)", marginBottom: 4 }}>By Category</div>
            <div style={{ fontSize: 10, color: t.text3, fontFamily: "var(--font-mono)", marginBottom: 14, lineHeight: 1.4 }}>Share of monthly spend</div>
            {catData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={130}>
                  <RechartsPie width={200} height={130}>
                    <Pie data={catData} cx="50%" cy="50%" innerRadius={34} outerRadius={56} dataKey="value" paddingAngle={2}>
                      {catData.map((c, i) => <Cell key={i} fill={c.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: t.surface2, border: `1px solid ${t.border2}`, borderRadius: 8, fontSize: 11, fontFamily: "var(--font-mono)", color: t.text }} formatter={(v: number) => [`${v}%`, ""]} />
                  </RechartsPie>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 8 }}>
                  {catData.slice(0, 5).map((c) => (
                    <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ width: 7, height: 7, borderRadius: 2, background: c.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 10, color: t.text2, fontFamily: "var(--font-mono)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                      <span style={{ fontSize: 10, color: t.text, fontFamily: "var(--font-mono)" }}>{c.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "28px 0", color: t.text3, fontSize: 12, fontFamily: "var(--font-mono)" }}>No data yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Deep-dive numbers and personal vault, merged from analytics */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, ...sectionTitle, color: t.text }}>
          <CalendarClock size={14} color={t.green} /> Detail
        </div>
        <AnalyticsView t={t} subs={subs} onNav={onNav} />
      </div>

      {dueSoon.length > 0 && (
        <div style={{ background: t.amberDim, border: `1px solid ${t.amber}44`, borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <AlertCircle size={14} color={t.amber} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: t.amber, fontFamily: "var(--font-mono)", lineHeight: 1.5 }}>
            <strong>{dueSoon.length}</strong> subscription{dueSoon.length > 1 ? "s" : ""} renewing soon: {dueSoon.map((s) => s.name).join(", ")}
          </span>
          <button onClick={() => onNav("subscriptions")} style={{ marginLeft: "auto", background: "none", border: "none", color: t.amber, cursor: "pointer", fontSize: 11, fontFamily: "var(--font-mono)", textDecoration: "underline", whiteSpace: "nowrap", flexShrink: 0 }}>
            View all
          </button>
        </div>
      )}

      {/* Recent subscriptions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ ...sectionTitle, color: t.text }}>Recent activity</div>
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 20px", borderBottom: `1px solid ${t.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.text, fontFamily: "var(--font-display)" }}>Recent Subscriptions</div>
            <button onClick={() => onNav("subscriptions")} aria-label="View all subscriptions" style={{ fontSize: 11, color: t.green, background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", gap: 4 }}>
              View all <ChevronRight size={11} aria-hidden="true" />
            </button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }} role="table" aria-label="Recent subscriptions">
              <thead>
                <tr style={{ background: t.surface2 }}>
                  {["Name", "Category", "Amount", "Next Renewal", "Status"].map((h) => (
                    <th key={h} scope="col" style={{ padding: "9px 16px", textAlign: "left", fontSize: 9.5, color: t.text3, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-mono)", fontWeight: 600, borderBottom: `1px solid ${t.border}` }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subs.slice(0, 6).map((s) => (
                  <tr
                    key={s.id}
                    style={{ borderBottom: `1px solid ${t.border}`, transition: "background 0.12s" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = t.surface2)}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                  >
                    <td style={{ padding: "11px 16px", fontSize: 13, fontWeight: 600, color: t.text, fontFamily: "var(--font-display)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</td>
                    <td style={{ padding: "11px 16px", fontSize: 11, color: t.text2, fontFamily: "var(--font-mono)" }}>{s.category}</td>
                    <td style={{ padding: "11px 16px", fontSize: 13, fontWeight: 700, color: t.text, fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>{s.currency} {s.amount.toFixed(2)}</td>
                    <td style={{ padding: "11px 16px", fontSize: 11, color: t.text2, fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>{s.nextDate || "-"}</td>
                    <td style={{ padding: "11px 16px" }}><Badge status={s.status} t={t} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
