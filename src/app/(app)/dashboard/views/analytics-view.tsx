"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip,
  BarChart, Bar, Cell, PieChart as RechartsPie, Pie,
} from "recharts";
import { buildMonthlyData, buildCatData } from "@/lib/chart-helpers";
import type { T } from "@/app/(app)/dashboard/dashboard-constants";
import type { Sub } from "@/app/(app)/dashboard/dashboard-types";

const COLORS = ["#22c55e","#3b82f6","#f59e0b","#a78bfa","#06b6d4","#fb923c","#34d399","#f472b6"];
const TR = "all 0.2s cubic-bezier(0.4,0,0.2,1)";

const ACCENTS = [
  { color: "#fb923c", glow: "rgba(251,146,60,0.22)"  },
  { color: "#a78bfa", glow: "rgba(167,139,250,0.22)" },
  { color: "#ef4444", glow: "rgba(239,68,68,0.22)"   },
  { color: "#06b6d4", glow: "rgba(6,182,212,0.22)"   },
];

export function AnalyticsView({ t, subs }: { t: T; subs: Sub[] }) {
  const monthlyData = useMemo(() => buildMonthlyData(subs), [subs]);
  const catData     = useMemo(
    () => buildCatData(subs).map((d, i) => ({ ...d, color: COLORS[i % COLORS.length] })),
    [subs],
  );

  const active   = useMemo(() => subs.filter((s) => s.status === "active"),   [subs]);
  const inactive = useMemo(() => subs.filter((s) => s.status === "inactive"), [subs]);

  // Unique stats not shown in overview
  const topSub       = useMemo(() => active.slice().sort((a, b) => b.amount - a.amount)[0], [active]);
  const topCat       = useMemo(() => catData[0], [catData]);
  const wastedMonthly = useMemo(() => inactive.reduce((a, s) => a + s.amount, 0), [inactive]);
  const monthlyCount = useMemo(() => active.filter((s) => s.cycle.toLowerCase() === "monthly").length, [active]);
  const annualCount  = useMemo(() => active.filter((s) => ["annually","yearly"].includes(s.cycle.toLowerCase())).length, [active]);

  const stats = [
    {
      l: "Highest Single Sub",
      v: topSub ? `$${topSub.amount.toFixed(2)}` : "-",
      n: topSub ? topSub.name : "No active subs",
      icon: "↑",
    },
    {
      l: "Top Category",
      v: topCat ? `${topCat.value}%` : "-",
      n: topCat ? topCat.name : "No data",
      icon: "◈",
    },
    {
      l: "Inactive Cost / mo",
      v: wastedMonthly > 0 ? `$${wastedMonthly.toFixed(2)}` : "$0.00",
      n: `${inactive.length} paused sub${inactive.length !== 1 ? "s" : ""}`,
      icon: "⊘",
    },
    {
      l: "Billing Mix",
      v: active.length ? `${monthlyCount}m / ${annualCount}y` : "-",
      n: `${active.length} active total`,
      icon: "⟳",
    },
  ];

  // inline hover handlers for chart cards always use live `t` values
  const chartHover = (e: React.MouseEvent<HTMLDivElement>, on: boolean) => {
    const el = e.currentTarget;
    el.style.borderColor  = on ? t.border2  : t.border;
    el.style.boxShadow    = on ? `0 8px 32px rgba(0,0,0,0.28)` : "none";
    el.style.transform    = on ? "translateY(-2px)" : "translateY(0)";
  };

  const kpiHover = (e: React.MouseEvent<HTMLDivElement>, on: boolean, i: number) => {
    const el   = e.currentTarget;
    const acc  = ACCENTS[i]!;
    const val  = el.querySelector<HTMLElement>(".ana-val");
    const icon = el.querySelector<HTMLElement>(".ana-icon");
    el.style.borderColor = on ? acc.color : t.border;
    el.style.boxShadow   = on ? `0 6px 28px ${acc.glow}` : "none";
    el.style.transform   = on ? "translateY(-3px)" : "translateY(0)";
    if (val)  val.style.color  = on ? acc.color : t.text;
    if (icon) { icon.style.background = on ? `${acc.color}22` : t.surface2; icon.style.color = on ? acc.color : t.text3; }
  };

  return (
    <>
      <style>{`
        @media (max-width: 900px) { .ana-kpi-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 700px) { .ana-2col { grid-template-columns: 1fr !important; } }
        @media (max-width: 560px) { .ana-kpi-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

        {/* Title */}
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: t.text, letterSpacing: -0.5, transition: TR }}>
            Analytics
          </h2>
          <p style={{ fontSize: 11.5, color: t.text3, fontFamily: "var(--font-mono)", marginTop: 3, lineHeight: 1.5, transition: TR }}>
            Deep-dive metrics unique to your subscription portfolio
          </p>
        </div>

        {/* Unique KPI strip 4 equal columns, no gaps */}
        <div className="ana-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {stats.map((s, i) => (
            <div
              key={s.l}
              style={{
                background: t.surface,
                border: `1px solid ${t.border}`,
                borderRadius: 14,
                padding: "20px 20px 18px",
                position: "relative",
                overflow: "hidden",
                transition: TR,
                cursor: "default",
              }}
              onMouseEnter={(e) => kpiHover(e, true,  i)}
              onMouseLeave={(e) => kpiHover(e, false, i)}
            >
              {/* top accent line */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: ACCENTS[i]!.color, opacity: 0.6, borderRadius: "14px 14px 0 0" }} />

              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: t.text3, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.09em", lineHeight: 1.4, transition: TR }}>
                  {s.l}
                </div>
                <span
                  className="ana-icon"
                  style={{
                    fontSize: 13, color: t.text3,
                    background: t.surface2,
                    borderRadius: 6, width: 26, height: 26,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, transition: TR,
                  }}
                >
                  {s.icon}
                </span>
              </div>

              <div className="ana-val" style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: t.text, letterSpacing: -0.8, lineHeight: 1, transition: TR }}>
                {s.v}
              </div>
              <div style={{ fontSize: 10.5, color: t.text3, fontFamily: "var(--font-mono)", marginTop: 7, lineHeight: 1.4, transition: TR, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {s.n}
              </div>
            </div>
          ))}
        </div>

        {/* Trend chart full width */}
        <div
          style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, padding: "24px 26px", transition: TR }}
          onMouseEnter={(e) => chartHover(e, true)}
          onMouseLeave={(e) => chartHover(e, false)}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "var(--font-display)", transition: TR }}>
                Monthly Spending Trend
              </div>
              <div style={{ fontSize: 10.5, color: t.text3, fontFamily: "var(--font-mono)", marginTop: 3, lineHeight: 1.4, transition: TR }}>
                Projected monthly cost across all 12 months
              </div>
            </div>
            <div style={{ fontSize: 10, color: t.text3, fontFamily: "var(--font-mono)", background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 6, padding: "4px 10px", transition: TR }}>
              12 months
            </div>
          </div>
          <div style={{ marginTop: 20, overflowX: "auto" }}>
            <div style={{ minWidth: 340 }}>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={monthlyData} aria-label="Monthly spending trend">
                  <defs>
                    <linearGradient id="anaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={t.green} stopOpacity={0.28} />
                      <stop offset="95%" stopColor={t.green} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: t.text3, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: t.text3, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ background: t.surface2, border: `1px solid ${t.border2}`, borderRadius: 10, fontSize: 12, fontFamily: "var(--font-mono)", color: t.text, boxShadow: "0 6px 24px rgba(0,0,0,0.32)" }}
                    labelStyle={{ color: t.text2, marginBottom: 2 }}
                    itemStyle={{ color: t.text }}
                    cursor={{ stroke: t.text3, strokeWidth: 1, strokeDasharray: "4 3" }}
                    formatter={(v: number) => [`$${v}`, "Spend"]}
                  />
                  <Area type="monotone" dataKey="spend" stroke={t.green} strokeWidth={2.5} fill="url(#anaGrad)"
                    dot={{ fill: t.green, r: 3.5, strokeWidth: 0 }}
                    activeDot={{ r: 5.5, fill: t.green, strokeWidth: 2.5, stroke: t.surface }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom row bar + donut, equal halves */}
        <div className="ana-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

          {/* Bar chart */}
          <div
            style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, padding: "24px 26px", transition: TR }}
            onMouseEnter={(e) => chartHover(e, true)}
            onMouseLeave={(e) => chartHover(e, false)}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: t.text, fontFamily: "var(--font-display)", marginBottom: 4, transition: TR }}>
              Spending by Category
            </div>
            <div style={{ fontSize: 10.5, color: t.text3, fontFamily: "var(--font-mono)", marginBottom: 20, lineHeight: 1.4, transition: TR }}>
              % share of total monthly spend
            </div>
            {catData.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <div style={{ minWidth: 200 }}>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={catData} layout="vertical" aria-label="Spending by category">
                      <XAxis type="number" tick={{ fontSize: 9, fill: t.text3, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 9.5, fill: t.text2, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} width={82} />
                      <Tooltip
                        contentStyle={{ background: t.surface2, border: `1px solid ${t.border2}`, borderRadius: 10, fontSize: 11, fontFamily: "var(--font-mono)", color: t.text, boxShadow: "0 6px 24px rgba(0,0,0,0.32)" }}
                        labelStyle={{ color: t.text2, marginBottom: 2 }}
                        itemStyle={{ color: t.text }}
                        cursor={{ fill: t.text3, opacity: 0.12 }}
                        formatter={(v: number) => [`${v}%`, "Share"]}
                      />
                      <Bar dataKey="value" radius={[0, 7, 7, 0]}>
                        {catData.map((c, i) => <Cell key={i} fill={c.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : <EmptyChart t={t} />}
          </div>

          {/* Donut chart */}
          <div
            style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, padding: "24px 26px", transition: TR }}
            onMouseEnter={(e) => chartHover(e, true)}
            onMouseLeave={(e) => chartHover(e, false)}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: t.text, fontFamily: "var(--font-display)", marginBottom: 4, transition: TR }}>
              Distribution
            </div>
            <div style={{ fontSize: 10.5, color: t.text3, fontFamily: "var(--font-mono)", marginBottom: 16, lineHeight: 1.4, transition: TR }}>
              Category share of active subscriptions
            </div>
            {catData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <RechartsPie width={200} height={160} aria-label="Category distribution">
                    <Pie data={catData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} dataKey="value" paddingAngle={3} strokeWidth={0}>
                      {catData.map((c, i) => <Cell key={i} fill={c.color} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: t.surface2, border: `1px solid ${t.border2}`, borderRadius: 10, fontSize: 11, fontFamily: "var(--font-mono)", color: t.text, boxShadow: "0 6px 24px rgba(0,0,0,0.32)" }}
                      labelStyle={{ color: t.text2, marginBottom: 2 }}
                      itemStyle={{ color: t.text }}
                      formatter={(v: number) => [`${v}%`, "Share"]}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "7px 16px", justifyContent: "center", marginTop: 12 }}>
                  {catData.map((c) => (
                    <div
                      key={c.name}
                      style={{ display: "flex", alignItems: "center", gap: 6, cursor: "default", transition: TR }}
                      onMouseEnter={(e) => { const lbl = e.currentTarget.querySelector<HTMLElement>("span:last-child"); if (lbl) lbl.style.color = t.text; }}
                      onMouseLeave={(e) => { const lbl = e.currentTarget.querySelector<HTMLElement>("span:last-child"); if (lbl) lbl.style.color = t.text2; }}
                    >
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: c.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 10, color: t.text2, fontFamily: "var(--font-mono)", transition: TR }}>{c.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : <EmptyChart t={t} />}
          </div>
        </div>
      </div>
    </>
  );
}

function EmptyChart({ t }: { t: T }) {
  return (
    <div style={{ textAlign: "center", padding: "44px 0", color: t.text3, fontSize: 12, fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>
      No active subscriptions yet
    </div>
  );
}
