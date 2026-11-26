"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { CalendarClock, Check, Minus, Wallet } from "lucide-react";
import type { T } from "@/app/(app)/dashboard/dashboard-constants";
import type { PricePoint, Sub } from "@/app/(app)/dashboard/dashboard-types";
import type { VaultItem, VaultSettings } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { applyScenario, buildForecast, monthlyEquivalent } from "@/lib/plan-helpers";

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: 20,
  minWidth: 0,
};

const label: React.CSSProperties = {
  fontSize: 12,
  color: "var(--text3)",
  fontFamily: "var(--font-display)",
};

const figure: React.CSSProperties = {
  fontSize: 26,
  fontWeight: 500,
  color: "var(--text)",
  lineHeight: 1.1,
  fontVariantNumeric: "tabular-nums",
};

function money(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency", currency, maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

export function PlanView({ t, subs }: { t: T; subs: Sub[] }) {
  const [vault, setVault] = useState<VaultItem[]>([]);
  const [settings, setSettings] = useState<VaultSettings>({ monthlyBudget: 0, currency: "USD" });
  const [history, setHistory] = useState<Record<string, PricePoint[]>>({});
  const [loading, setLoading] = useState(true);
  const [excluded, setExcluded] = useState<string[]>([]);

  useEffect(() => {
    let alive = true;
    const supabase = createClient();
    Promise.all([
      supabase.from("vault_items").select("*"),
      supabase.from("vault_settings").select("*").maybeSingle(),
      supabase.from("price_history").select("subscription_id, amount, currency, recorded_at").order("recorded_at", { ascending: false }),
    ]).then(([items, config, prices]) => {
      if (!alive) return;
      if (!items.error) setVault((items.data ?? []) as VaultItem[]);
      if (!config.error && config.data) setSettings(config.data as VaultSettings);
      if (!prices.error) {
        const map: Record<string, PricePoint[]> = {};
        for (const row of (prices.data ?? []) as { subscription_id: string; amount: number; currency: string; recorded_at: string }[]) {
          const list = map[row.subscription_id] ?? [];
          list.push({
            amount: Number(row.amount),
            currency: row.currency,
            recordedAt: row.recorded_at,
          });
          map[row.subscription_id] = list;
        }
        setHistory(map);
      }
      setLoading(false);
    });
    return () => { alive = false; };
  }, []);

  const enriched = useMemo(
    () => subs.map((sub) => ({ ...sub, priceHistory: history[sub.id] ?? [] })),
    [subs, history],
  );
  const scenarioSubs = useMemo(() => applyScenario(enriched, excluded), [enriched, excluded]);
  const forecast = useMemo(
    () => buildForecast(scenarioSubs, vault, settings.monthlyBudget),
    [scenarioSubs, vault, settings.monthlyBudget],
  );
  const currency = settings.currency || "USD";

  const toggleExclude = (id: string) => {
    setExcluded((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ ...card, height: i === 1 ? 220 : 96, opacity: 0.5 }} />
        ))}
      </div>
    );
  }

  const stats = [
    { name: "Recurring", value: money(forecast.monthlyRecurring, currency) },
    { name: "Vault this month", value: money(forecast.vaultThisMonth, currency) },
    { name: "Combined plan", value: money(forecast.combined, currency) },
    {
      name: "Remaining",
      value: forecast.remaining === null ? "No budget set" : money(forecast.remaining, currency),
    },
  ];

  const categoryTotals = Object.entries(
    vault
      .filter((item) => item.purchaseDate.slice(0, 7) === new Date().toISOString().slice(0, 7))
      .reduce<Record<string, number>>((acc, item) => {
        acc[item.category] = (acc[item.category] ?? 0) + item.amount;
        return acc;
      }, {}),
  ).sort((a, b) => b[1] - a[1]);
  const maxCategory = Math.max(1, ...categoryTotals.map(([, value]) => value));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, color: t.text }}>
          One ledger
        </h2>
        <p style={{ fontSize: 13, color: t.text3, marginTop: 4, fontFamily: "var(--font-display)" }}>
          Recurring charges and personal spending in one monthly forecast
        </p>
      </div>

      <div className="kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
        {stats.map((stat) => (
          <div key={stat.name} style={card}>
            <div style={label}>{stat.name}</div>
            <div style={{ ...figure, marginTop: 12 }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={card}>
        <div style={{ fontSize: 13, fontWeight: 500, color: t.text, marginBottom: 4 }}>12 month forecast</div>
        <div style={{ fontSize: 12, color: t.text3, marginBottom: 16 }}>
          Based on your current subscriptions and this month&apos;s vault spending
        </div>
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecast.series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--grid)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text3)", fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text3)", fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} width={52} />
              <Tooltip
                contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--text)" }}
                formatter={(value: number) => [money(value, currency), "Plan"]}
              />
              <Area type="monotone" dataKey="value" stroke="var(--green)" strokeWidth={2} fill="var(--green-dim)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }} className="ana-2col">
        <div style={card}>
          <div style={{ fontSize: 13, fontWeight: 500, color: t.text, marginBottom: 12 }}>What if you stop one</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {enriched.filter((sub) => sub.status === "active").map((sub) => {
              const off = excluded.includes(sub.id);
              return (
                <button
                  key={sub.id}
                  onClick={() => toggleExclude(sub.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, width: "100%",
                    padding: "10px 0", border: "none", borderTop: "1px solid var(--border)",
                    background: "transparent", cursor: "pointer", textAlign: "left", color: t.text,
                  }}
                >
                  <span style={{
                    display: "flex", width: 20, height: 20, alignItems: "center", justifyContent: "center",
                    border: "1px solid var(--border2)", borderRadius: 4,
                    background: off ? "var(--green-dim)" : "transparent",
                  }}>
                    {off ? <Check size={16} strokeWidth={1.5} /> : <Minus size={16} strokeWidth={1.5} color="var(--text3)" />}
                  </span>
                  <span style={{ flex: 1, fontSize: 13 }}>{sub.name}</span>
                  <span style={{ fontSize: 12, color: t.text3, fontVariantNumeric: "tabular-nums" }}>
                    {money(monthlyEquivalent(sub), sub.currency)}/mo
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={card}>
            <div style={{ fontSize: 13, fontWeight: 500, color: t.text, marginBottom: 12 }}>Price changes</div>
            {forecast.priceChanges.length === 0 ? (
              <div style={{ fontSize: 12, color: t.text3 }}>No recorded price changes</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {forecast.priceChanges.slice(0, 6).map((change, i) => (
                  <div key={`${change.name}-${i}`} style={{ display: "flex", gap: 8, fontSize: 12, color: t.text2 }}>
                    <span style={{ flex: 1 }}>{change.name}</span>
                    <span style={{ color: t.text3, fontVariantNumeric: "tabular-nums" }}>
                      {change.currency} {change.oldAmount.toFixed(2)} to {change.newAmount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <CalendarClock size={16} strokeWidth={1.5} color="var(--text3)" />
              <span style={{ fontSize: 13, fontWeight: 500, color: t.text }}>Cancellations</span>
            </div>
            {forecast.plannedCancellations.length === 0 ? (
              <div style={{ fontSize: 12, color: t.text3 }}>No cancellations planned</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {forecast.plannedCancellations.map((sub) => {
                  const days = sub.cancelByDate
                    ? Math.ceil((new Date(sub.cancelByDate).getTime() - Date.now()) / 86400000)
                    : null;
                  return (
                    <div key={sub.id} style={{ display: "flex", gap: 8, fontSize: 12, color: t.text2 }}>
                      <span style={{ flex: 1 }}>{sub.name}</span>
                      <span style={{ color: t.text3 }}>
                        {days === null ? "No date" : days < 0 ? "Overdue" : `${days} days left`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Wallet size={16} strokeWidth={1.5} color="var(--text3)" />
          <span style={{ fontSize: 13, fontWeight: 500, color: t.text }}>Vault by category</span>
        </div>
        {categoryTotals.length === 0 ? (
          <div style={{ fontSize: 12, color: t.text3 }}>No vault spending this month</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {categoryTotals.slice(0, 5).map(([name, value]) => (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 96, fontSize: 12, color: t.text2 }}>{name}</span>
                <span style={{ flex: 1, height: 4, borderRadius: 2, background: "var(--surface3)" }}>
                  <span style={{ display: "block", width: `${(value / maxCategory) * 100}%`, height: 4, borderRadius: 2, background: "var(--border2)" }} />
                </span>
                <span style={{ fontSize: 12, color: t.text, fontVariantNumeric: "tabular-nums" }}>{money(value, currency)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
