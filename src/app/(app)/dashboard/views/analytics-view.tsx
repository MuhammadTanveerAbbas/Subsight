"use client";

import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip,
  BarChart, Bar, Cell, PieChart as RechartsPie, Pie,
} from "recharts";
import { buildMonthlyData, buildCatData } from "@/lib/chart-helpers";
import type { T } from "@/app/(app)/dashboard/dashboard-constants";
import type { Sub } from "@/app/(app)/dashboard/dashboard-types";

export function AnalyticsView({ t, subs }: { t: T; subs: Sub[] }) {
  const monthlyData = buildMonthlyData(subs);
  const catData = buildCatData(subs);
  const active = subs.filter((s) => s.status === "active");
  const monthly = active.reduce((a, s) => a + s.amount, 0);
  const dueSoon = subs.filter(
    (s) => s.status === "warning" || s.status === "renewal_passed",
  ).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 22,
            fontWeight: 800,
            color: t.text,
            letterSpacing: -0.5,
          }}
        >
          Analytics
        </h2>
        <p
          style={{
            fontSize: 11.5,
            color: t.text3,
            fontFamily: "var(--font-mono)",
            marginTop: 3,
          }}
        >
          Spending trends and category breakdown
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))",
          gap: 12,
        }}
      >
        {[
          {
            l: "Monthly Total",
            v: `$${monthly.toFixed(2)}`,
            n: `${active.length} active subs`,
          },
          {
            l: "Annual Projected",
            v: `$${(monthly * 12).toFixed(0)}`,
            n: "Based on current subs",
          },
          { l: "Due Soon", v: `${dueSoon}`, n: "Renewals approaching" },
          {
            l: "Avg per Sub",
            v: `$${active.length ? (monthly / active.length).toFixed(2) : "0.00"}`,
            n: "Monthly average",
          },
        ].map((s) => (
          <div
            key={s.l}
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: 10,
              padding: "16px 18px",
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: t.text3,
                fontFamily: "var(--font-mono)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 8,
              }}
            >
              {s.l}
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 22,
                fontWeight: 800,
                color: t.text,
                letterSpacing: -0.5,
              }}
            >
              {s.v}
            </div>
            <div
              style={{
                fontSize: 10,
                color: t.text3,
                fontFamily: "var(--font-mono)",
                marginTop: 4,
              }}
            >
              {s.n}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: t.surface,
          border: `1px solid ${t.border}`,
          borderRadius: 12,
          padding: "22px",
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: t.text,
            fontFamily: "var(--font-display)",
            marginBottom: 4,
          }}
        >
          Monthly Spending Trend
        </div>
        <div
          style={{
            fontSize: 10,
            color: t.text3,
            fontFamily: "var(--font-mono)",
            marginBottom: 20,
          }}
        >
          Projected monthly cost based on active subscriptions
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={t.green} stopOpacity={0.2} />
                <stop offset="95%" stopColor={t.green} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
            <XAxis
              dataKey="month"
              tick={{
                fontSize: 10,
                fill: t.text3,
                fontFamily: "var(--font-mono)",
              }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{
                fontSize: 10,
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
              strokeWidth={2.5}
              fill="url(#g2)"
              dot={{ fill: t.green, r: 3, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div
        className="ana-2col"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
      >
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 12,
            padding: "22px",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: t.text,
              fontFamily: "var(--font-display)",
              marginBottom: 18,
            }}
          >
            Spending by Category
          </div>
          {catData.length > 0 ? (
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={catData} layout="vertical">
                <XAxis
                  type="number"
                  tick={{
                    fontSize: 9,
                    fill: t.text3,
                    fontFamily: "var(--font-mono)",
                  }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{
                    fontSize: 9,
                    fill: t.text2,
                    fontFamily: "var(--font-mono)",
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={78}
                />
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
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {catData.map((c, i) => (
                    <Cell key={i} fill={c.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: t.text3,
                fontSize: 12,
                fontFamily: "var(--font-mono)",
              }}
            >
              No data yet
            </div>
          )}
        </div>

        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 12,
            padding: "22px",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: t.text,
              fontFamily: "var(--font-display)",
              marginBottom: 18,
            }}
          >
            Distribution
          </div>
          {catData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <RechartsPie>
                  <Pie
                    data={catData}
                    cx="50%"
                    cy="50%"
                    innerRadius={44}
                    outerRadius={66}
                    dataKey="value"
                    paddingAngle={3}
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
                  flexWrap: "wrap",
                  gap: "6px 14px",
                  justifyContent: "center",
                  marginTop: 8,
                }}
              >
                {catData.map((c) => (
                  <div
                    key={c.name}
                    style={{ display: "flex", alignItems: "center", gap: 5 }}
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
                        fontSize: 9.5,
                        color: t.text2,
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {c.name}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
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
    </div>
  );
}
