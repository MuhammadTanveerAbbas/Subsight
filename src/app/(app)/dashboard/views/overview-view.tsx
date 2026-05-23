"use client";

import { DollarSign, CreditCard, TrendingUp, Zap, ChevronRight } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip,
  PieChart as RechartsPie, Pie, Cell,
} from "recharts";
import { KPI } from "@/components/subscription/kpi";
import { Badge } from "@/components/subscription/badge";
import { buildMonthlyData, buildCatData } from "@/lib/chart-helpers";
import type { T } from "@/app/(app)/dashboard/dashboard-constants";
import type { Sub } from "@/app/(app)/dashboard/dashboard-types";

export function OverviewView({
  t,
  subs,
  onNav,
}: {
  t: T;
  subs: Sub[];
  onNav: (id: string) => void;
}) {
  const active = subs.filter((s) => s.status !== "inactive");
  const monthly = active.reduce((a, s) => a + s.amount, 0);
  const monthlyData = buildMonthlyData(subs);
  const catData = buildCatData(subs);
  const dueSoon = subs.filter(
    (s) => s.status === "warning" || s.status === "renewal_passed",
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        className="kpi-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
          gap: 14,
        }}
      >
        <KPI
          t={t}
          label="Monthly Spend"
          value={`$${monthly.toFixed(2)}`}
          sub={`${active.length} active subscriptions`}
          trend="neutral"
          Icon={DollarSign}
        />
        <KPI
          t={t}
          label="Active Subs"
          value={`${active.length}`}
          sub={`${subs.length} total tracked`}
          Icon={CreditCard}
        />
        <KPI
          t={t}
          label="Annual Cost"
          value={`$${(monthly * 12).toFixed(0)}`}
          sub="Projected this year"
          Icon={TrendingUp}
        />
        <KPI
          t={t}
          label="Avg per Sub"
          value={`$${active.length ? (monthly / active.length).toFixed(2) : "0.00"}`}
          sub="Monthly average cost"
          trend="neutral"
          Icon={Zap}
        />
      </div>

      <div
        className="chart-2col"
        style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}
      >
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 12,
            padding: "20px 22px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 18,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: t.text,
                  fontFamily: "var(--font-display)",
                }}
              >
                Monthly Spending
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: t.text3,
                  fontFamily: "var(--font-mono)",
                  marginTop: 2,
                }}
              >
                Based on your active subscriptions
              </div>
            </div>
            <button
              onClick={() => onNav("analytics")}
              style={{
                fontSize: 11,
                color: t.green,
                background: t.greenDim,
                border: `1px solid ${t.greenBorder}`,
                borderRadius: 6,
                padding: "5px 10px",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              View Full <ChevronRight size={11} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={t.green} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={t.green} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
              <XAxis
                dataKey="month"
                tick={{
                  fontSize: 9,
                  fill: t.text3,
                  fontFamily: "var(--font-mono)",
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{
                  fontSize: 9,
                  fill: t.text3,
                  fontFamily: "var(--font-mono)",
                }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  background: t.surface2,
                  border: `1px solid ${t.border2}`,
                  borderRadius: 8,
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                  color: t.text,
                }}
                formatter={(v: number) => [`$${v}`, ""]}
              />
              <Area
                type="monotone"
                dataKey="spend"
                stroke={t.green}
                strokeWidth={2}
                fill="url(#aGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 12,
            padding: "20px 22px",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: t.text,
              fontFamily: "var(--font-display)",
              marginBottom: 4,
            }}
          >
            By Category
          </div>
          <div
            style={{
              fontSize: 10,
              color: t.text3,
              fontFamily: "var(--font-mono)",
              marginBottom: 14,
            }}
          >
            Spending breakdown
          </div>
          {catData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={120}>
                <RechartsPie>
                  <Pie
                    data={catData}
                    cx="50%"
                    cy="50%"
                    innerRadius={34}
                    outerRadius={54}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {catData.map((c, i) => (
                      <Cell key={i} fill={c.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: t.surface2,
                      border: `1px solid ${t.border2}`,
                      borderRadius: 8,
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                      color: t.text,
                    }}
                    formatter={(v: number) => [`${v}%`, ""]}
                  />
                </RechartsPie>
              </ResponsiveContainer>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 5,
                  marginTop: 8,
                }}
              >
                {catData.map((c) => (
                  <div
                    key={c.name}
                    style={{ display: "flex", alignItems: "center", gap: 7 }}
                  >
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 2,
                        background: c.color,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 10,
                        color: t.text2,
                        fontFamily: "var(--font-mono)",
                        flex: 1,
                      }}
                    >
                      {c.name}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        color: t.text,
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {c.value}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "24px 0",
                color: t.text3,
                fontSize: 12,
                fontFamily: "var(--font-mono)",
              }}
            >
              No data yet
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          background: t.surface,
          border: `1px solid ${t.border}`,
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "15px 20px",
            borderBottom: `1px solid ${t.border}`,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: t.text,
              fontFamily: "var(--font-display)",
            }}
          >
            My Subscriptions
          </div>
          <button
            onClick={() => onNav("subscriptions")}
            style={{
              fontSize: 11,
              color: t.green,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-mono)",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            View all <ChevronRight size={11} />
          </button>
        </div>
        {subs.length === 0 ? (
          <div
            style={{
              padding: "44px 20px",
              textAlign: "center",
              color: t.text3,
              fontFamily: "var(--font-mono)",
              fontSize: 13,
            }}
          >
            No subscriptions yet.{" "}
            <button
              onClick={() => onNav("add")}
              style={{
                background: "none",
                border: "none",
                color: t.green,
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: 13,
              }}
            >
              Add your first one →
            </button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 560,
              }}
            >
              <thead>
                <tr style={{ background: t.surface2 }}>
                  {["Name", "Category", "Amount", "Next Renewal", "Status"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: "9px 16px",
                          textAlign: "left",
                          fontSize: 9.5,
                          color: t.text3,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          fontFamily: "var(--font-mono)",
                          fontWeight: 400,
                          borderBottom: `1px solid ${t.border}`,
                        }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {subs.slice(0, 5).map((s) => (
                  <tr
                    key={s.id}
                    style={{
                      borderBottom: `1px solid ${t.border}`,
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.background =
                        t.surface2)
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.background =
                        "transparent")
                    }
                  >
                    <td
                      style={{
                        padding: "11px 16px",
                        fontSize: 13,
                        fontWeight: 600,
                        color: t.text,
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {s.name}
                    </td>
                    <td
                      style={{
                        padding: "11px 16px",
                        fontSize: 11,
                        color: t.text2,
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {s.category}
                    </td>
                    <td
                      style={{
                        padding: "11px 16px",
                        fontSize: 13,
                        fontWeight: 700,
                        color: t.text,
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {s.currency} {s.amount.toFixed(2)}
                    </td>
                    <td
                      style={{
                        padding: "11px 16px",
                        fontSize: 11,
                        color: t.text2,
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {s.nextDate || ""}
                    </td>
                    <td style={{ padding: "11px 16px" }}>
                      <Badge status={s.status} t={t} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
