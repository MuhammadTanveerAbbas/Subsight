"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Wallet, Plus, Pencil, Trash2, Search, TrendingUp, Receipt,
  Target, Layers, Save, RefreshCw, ShieldCheck, LockKeyhole,
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import type { T } from "@/app/(app)/dashboard/dashboard-constants";
import {
  VAULT_CATEGORIES, VAULT_CATEGORY_COLORS,
  type VaultItem, type VaultSettings, type VaultTab, type Currency,
} from "@/lib/types";
import {
  fetchVault, createVaultItem, updateVaultItem, deleteVaultItem, saveVaultSettings,
} from "@/lib/vault-api";

const TR = "all 0.2s cubic-bezier(0.4,0,0.2,1)";
const TABS: { id: VaultTab; label: string; Icon: React.ElementType }[] = [
  { id: "items",     label: "Items",     Icon: Wallet },
  { id: "analytics", label: "Analytics", Icon: TrendingUp },
  { id: "settings",  label: "Settings",  Icon: Target },
];

const today = () => new Date().toISOString().slice(0, 10);

function money(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency", currency, maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

export function VaultView({
  t, toast, initialTab = "items",
}: {
  t: T;
  toast: (m: string, tp: "success" | "error" | "info" | "warning") => void;
  initialTab?: VaultTab;
}) {
  const [tab, setTab] = useState<VaultTab>(initialTab);
  const [items, setItems] = useState<VaultItem[]>([]);
  const [settings, setSettings] = useState<VaultSettings>({ monthlyBudget: 0, currency: "USD" });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // Add / edit form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("Other");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [purchaseDate, setPurchaseDate] = useState(today());
  const [notes, setNotes] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");

  // Settings form
  const [budgetInput, setBudgetInput] = useState("0");
  const [settingsCurrency, setSettingsCurrency] = useState("USD");
  const [savingSettings, setSavingSettings] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchVault();
      setItems(data.items);
      setSettings(data.settings);
      setBudgetInput(String(data.settings.monthlyBudget));
      setSettingsCurrency(data.settings.currency);
      setCurrency((prev) => prev === "USD" ? data.settings.currency : prev);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not load your vault", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => { setTab(initialTab); }, [initialTab]);

  const inputStyle: React.CSSProperties = {
    background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 8,
    padding: "10px 12px", fontSize: 13, color: t.text,
    fontFamily: "var(--font-mono)", outline: "none", width: "100%",
  };

  const resetForm = () => {
    setEditingId(null); setName(""); setCategory("Other");
    setAmount(""); setPurchaseDate(today()); setNotes("");
  };

  const submitItem = async () => {
    const parsedAmount = Number(amount);
    if (!name.trim()) { toast("Give the item a name", "error"); return; }
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      toast("Enter a valid amount", "error"); return;
    }
    setBusy(true);
    try {
      const payload = {
        name: name.trim(), category, amount: parsedAmount,
        currency, purchaseDate, notes: notes.trim() || null,
      };
      if (editingId) await updateVaultItem(editingId, payload);
      else await createVaultItem(payload);
      toast(editingId ? "Vault item updated" : "Added to your vault", "success");
      resetForm();
      await load();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not save the item", "error");
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (item: VaultItem) => {
    setEditingId(item.id);
    setName(item.name); setCategory(item.category); setAmount(String(item.amount));
    setCurrency(item.currency); setPurchaseDate(item.purchaseDate); setNotes(item.notes);
    setTab("items");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeItem = async (item: VaultItem) => {
    if (!window.confirm(`Remove "${item.name}" from your vault?`)) return;
    setBusy(true);
    try {
      await deleteVaultItem(item.id);
      if (editingId === item.id) resetForm();
      toast("Item removed", "success");
      await load();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not remove the item", "error");
    } finally {
      setBusy(false);
    }
  };

  const saveSettings = async () => {
    const parsed = Number(budgetInput);
    if (!Number.isFinite(parsed) || parsed < 0) {
      toast("Enter a valid monthly budget", "error"); return;
    }
    setSavingSettings(true);
    try {
      await saveVaultSettings({ monthlyBudget: parsed, currency: settingsCurrency });
      setSettings({ monthlyBudget: parsed, currency: settingsCurrency });
      setCurrency(settingsCurrency);
      toast("Vault settings saved", "success");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not save settings", "error");
    } finally {
      setSavingSettings(false);
    }
  };

  /* ── Derived analytics ─────────────────────────────────────────────── */
  const analytics = useMemo(() => {
    const monthKey = new Date().toISOString().slice(0, 7);
    const total = items.reduce((sum, i) => sum + i.amount, 0);
    const thisMonth = items
      .filter((i) => i.purchaseDate.startsWith(monthKey))
      .reduce((sum, i) => sum + i.amount, 0);
    const byCat = new Map<string, number>();
    items.forEach((i) => byCat.set(i.category, (byCat.get(i.category) ?? 0) + i.amount));
    const catData = Array.from(byCat.entries())
      .map(([name, value]) => ({
        name, value: Math.round(value * 100) / 100,
        color: VAULT_CATEGORY_COLORS[name] ?? VAULT_CATEGORY_COLORS.Other,
      }))
      .sort((a, b) => b.value - a.value);

    const months = Array.from({ length: 6 }, (_, index) => {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - (5 - index));
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return {
        key,
        label: d.toLocaleString("en-US", { month: "short" }),
        value: items
          .filter((i) => i.purchaseDate.startsWith(key))
          .reduce((sum, i) => sum + i.amount, 0),
      };
    });

    return { total, thisMonth, catData, months };
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      const matchesCat = catFilter === "All" || i.category === catFilter;
      const matchesSearch = !q || i.name.toLowerCase().includes(q) || (i.notes || "").toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [items, search, catFilter]);

  const budgetPct = settings.monthlyBudget > 0
    ? Math.min(100, (analytics.thisMonth / settings.monthlyBudget) * 100)
    : 0;
  const budgetLeft = settings.monthlyBudget - analytics.thisMonth;

  const card: React.CSSProperties = {
    background: t.surface, border: `1px solid ${t.border}`,
    borderRadius: 12, padding: 22,
  };

  return (
    <>
      <style>{`
        @media (max-width: 900px) { .vault-kpis { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 760px) {
          .vault-form-grid { grid-template-columns: 1fr !important; }
          .vault-charts { grid-template-columns: 1fr !important; }
          .vault-filters { flex-direction: column !important; align-items: stretch !important; }
        }
        @media (max-width: 520px) { .vault-kpis { grid-template-columns: 1fr !important; } }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: t.text, letterSpacing: -0.5 }}>
              Vault
            </h2>
            <p style={{ fontSize: 11.5, color: t.text3, fontFamily: "var(--font-mono)", marginTop: 3, lineHeight: 1.5 }}>
              Your private tracker for personal expenses and everything you own
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 8, background: t.greenDim, border: `1px solid ${t.greenBorder}` }}>
            <LockKeyhole size={12} color={t.green} />
            <span style={{ fontSize: 10.5, color: t.green, fontFamily: "var(--font-mono)" }}>Private to your account</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, borderBottom: `1px solid ${t.border}` }}>
          {TABS.map(({ id, label, Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "10px 16px", background: "transparent", border: "none",
                  borderBottom: active ? `2px solid ${t.green}` : "2px solid transparent",
                  color: active ? t.green : t.text3, cursor: "pointer",
                  fontSize: 12.5, fontWeight: active ? 700 : 500,
                  fontFamily: "var(--font-display)", transition: TR,
                  marginBottom: -1,
                }}
              >
                <Icon size={14} /> {label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 9, color: t.text3, fontFamily: "var(--font-mono)", fontSize: 12, padding: 30 }}>
            <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> Loading your vault…
          </div>
        ) : (
          <>
            {/* ── ITEMS ─────────────────────────────────────────────── */}
            {tab === "items" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={card}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "var(--font-display)" }}>
                      {editingId ? "Edit item" : "Add to vault"}
                    </h3>
                    {editingId && (
                      <button onClick={resetForm} style={{ background: "none", border: "none", color: t.text3, cursor: "pointer", fontSize: 11, fontFamily: "var(--font-mono)" }}>
                        Cancel edit
                      </button>
                    )}
                  </div>
                  <div className="vault-form-grid" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 12 }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <span style={{ fontSize: 10, color: t.text3, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Name</span>
                      <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Laptop, rent, groceries" />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <span style={{ fontSize: 10, color: t.text3, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Category</span>
                      <select style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)}>
                        {VAULT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <span style={{ fontSize: 10, color: t.text3, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Amount</span>
                      <input style={inputStyle} type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <span style={{ fontSize: 10, color: t.text3, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Currency</span>
                      <select style={inputStyle} value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>
                        {["USD", "EUR", "GBP", "PKR", "CAD", "AUD", "JPY", "CHF", "INR", "SGD", "AED"].map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <span style={{ fontSize: 10, color: t.text3, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Date</span>
                      <input style={inputStyle} type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <span style={{ fontSize: 10, color: t.text3, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Notes (optional)</span>
                      <input style={inputStyle} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Where, why, serial number…" />
                    </label>
                  </div>
                  <button
                    onClick={submitItem}
                    disabled={busy}
                    style={{
                      marginTop: 14, background: t.green, color: "#000", border: "none", borderRadius: 8,
                      padding: "10px 18px", fontSize: 13, fontWeight: 700, fontFamily: "var(--font-display)",
                      cursor: busy ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 7,
                      opacity: busy ? 0.7 : 1,
                    }}
                  >
                    <Plus size={14} /> {editingId ? "Save changes" : "Add item"}
                  </button>
                </div>

                <div style={card}>
                  <div className="vault-filters" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Receipt size={14} color={t.green} />
                      <span style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "var(--font-display)" }}>
                        Your items <span style={{ color: t.text3, fontWeight: 400 }}>({filtered.length})</span>
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <div style={{ position: "relative", minWidth: 170 }}>
                        <Search size={13} color={t.text3} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                        <input
                          style={{ ...inputStyle, paddingLeft: 30 }}
                          value={search} onChange={(e) => setSearch(e.target.value)}
                          placeholder="Search items…"
                        />
                      </div>
                      <select style={{ ...inputStyle, width: "auto", minWidth: 130 }} value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
                        <option value="All">All categories</option>
                        {VAULT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  {filtered.length === 0 ? (
                    <div style={{ padding: "36px 10px", textAlign: "center", color: t.text3 }}>
                      <Wallet size={26} strokeWidth={1.4} style={{ margin: "0 auto 10px", opacity: 0.6 }} />
                      <div style={{ fontSize: 13, fontFamily: "var(--font-display)", color: t.text2 }}>
                        {items.length === 0 ? "Your vault is empty" : "Nothing matches your filters"}
                      </div>
                      <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", marginTop: 5 }}>
                        {items.length === 0 ? "Add your first expense or possession above" : "Try another search or category"}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {filtered.map((item) => {
                        const color = VAULT_CATEGORY_COLORS[item.category] ?? VAULT_CATEGORY_COLORS.Other;
                        return (
                          <div
                            key={item.id}
                            style={{
                              display: "flex", alignItems: "center", gap: 12,
                              padding: "12px 4px", borderTop: `1px solid ${t.border}`,
                            }}
                          >
                            <span style={{ width: 8, height: 8, borderRadius: 3, background: color, flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: t.text, fontFamily: "var(--font-display)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {item.name}
                              </div>
                              <div style={{ fontSize: 10.5, color: t.text3, fontFamily: "var(--font-mono)", marginTop: 3 }}>
                                {item.category} · {item.purchaseDate}
                                {item.notes ? ` · ${item.notes}` : ""}
                              </div>
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: t.text, fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
                              {money(item.amount, item.currency)}
                            </div>
                            <button onClick={() => startEdit(item)} aria-label={`Edit ${item.name}`} style={{ background: "none", border: "none", color: t.text3, cursor: "pointer", padding: 5, display: "flex" }}>
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => removeItem(item)} disabled={busy} aria-label={`Delete ${item.name}`} style={{ background: "none", border: "none", color: t.text3, cursor: "pointer", padding: 5, display: "flex" }}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── ANALYTICS ─────────────────────────────────────────── */}
            {tab === "analytics" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div className="vault-kpis" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                  {[
                    { label: "Total logged", value: money(analytics.total, settings.currency), note: `${items.length} item${items.length === 1 ? "" : "s"}`, Icon: Wallet },
                    { label: "This month", value: money(analytics.thisMonth, settings.currency), note: "Current calendar month", Icon: TrendingUp },
                    { label: "Average item", value: items.length ? money(analytics.total / items.length, settings.currency) : "—", note: "Across all entries", Icon: Receipt },
                    { label: "Budget left", value: settings.monthlyBudget > 0 ? money(budgetLeft, settings.currency) : "—", note: settings.monthlyBudget > 0 ? `of ${money(settings.monthlyBudget, settings.currency)}` : "Set a monthly budget", Icon: Target },
                  ].map((s) => (
                    <div key={s.label} style={{ ...card, padding: "18px 18px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <span style={{ width: 26, height: 26, borderRadius: 7, background: t.surface2, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <s.Icon size={13} color={t.text3} />
                        </span>
                        <span style={{ fontSize: 10, color: t.text3, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</span>
                      </div>
                      <div style={{ fontSize: 19, fontWeight: 800, color: t.text, fontFamily: "var(--font-display)", letterSpacing: -0.5 }}>{s.value}</div>
                      <div style={{ fontSize: 10.5, color: t.text3, fontFamily: "var(--font-mono)", marginTop: 4 }}>{s.note}</div>
                    </div>
                  ))}
                </div>

                {settings.monthlyBudget > 0 && (
                  <div style={card}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 9 }}>
                      <span style={{ fontSize: 12, color: t.text2, fontFamily: "var(--font-mono)" }}>Monthly budget used</span>
                      <span style={{ fontSize: 12, color: budgetPct >= 100 ? t.red : t.green, fontFamily: "var(--font-mono)" }}>{budgetPct.toFixed(0)}%</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: t.surface3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${budgetPct}%`, background: budgetPct >= 100 ? t.red : t.green, borderRadius: 4, transition: "width 0.4s" }} />
                    </div>
                  </div>
                )}

                <div className="vault-charts" style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 14 }}>
                  <div style={card}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: t.text, fontFamily: "var(--font-display)", marginBottom: 4 }}>Spending by category</h3>
                    <p style={{ fontSize: 10.5, color: t.text3, fontFamily: "var(--font-mono)", marginBottom: 8 }}>Where your money goes</p>
                    {analytics.catData.length ? (
                      <>
                        <div style={{ height: 210 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={analytics.catData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={2} stroke="none">
                                {analytics.catData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                              </Pie>
                              <Tooltip contentStyle={{ background: t.surface2, border: `1px solid ${t.border2}`, borderRadius: 8, fontSize: 11 }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "7px 14px", marginTop: 6 }}>
                          {analytics.catData.map((c) => (
                            <span key={c.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, color: t.text2, fontFamily: "var(--font-mono)" }}>
                              <span style={{ width: 7, height: 7, borderRadius: 2, background: c.color }} />{c.name}
                            </span>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div style={{ padding: "50px 0", textAlign: "center", fontSize: 11, color: t.text3, fontFamily: "var(--font-mono)" }}>Add items to see a breakdown</div>
                    )}
                  </div>

                  <div style={card}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: t.text, fontFamily: "var(--font-display)", marginBottom: 4 }}>Last 6 months</h3>
                    <p style={{ fontSize: 10.5, color: t.text3, fontFamily: "var(--font-mono)", marginBottom: 8 }}>Recorded spend per month ({settings.currency})</p>
                    <div style={{ height: 210 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.months} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false} />
                          <XAxis dataKey="label" tick={{ fill: t.text3, fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: t.text3, fontSize: 10 }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ background: t.surface2, border: `1px solid ${t.border2}`, borderRadius: 8, fontSize: 11 }} cursor={{ fill: t.surface2 }} />
                          <Bar dataKey="value" fill={t.green} radius={[4, 4, 0, 0]} maxBarSize={38} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div style={{ ...card, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <Layers size={16} color={t.green} />
                  <span style={{ flex: 1, fontSize: 12, color: t.text2, fontFamily: "var(--font-mono)" }}>
                    Want to change your monthly budget or vault currency?
                  </span>
                  <button onClick={() => setTab("settings")} style={{ background: t.surface2, border: `1px solid ${t.border2}`, borderRadius: 8, padding: "8px 14px", color: t.text, cursor: "pointer", fontSize: 12, fontFamily: "var(--font-display)" }}>
                    Open vault settings
                  </button>
                </div>
              </div>
            )}

            {/* ── SETTINGS ──────────────────────────────────────────── */}
            {tab === "settings" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 680, width: "100%" }}>
                <div style={card}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <Target size={14} color={t.green} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "var(--font-display)" }}>Monthly budget</span>
                  </div>
                  <p style={{ fontSize: 12, color: t.text3, fontFamily: "var(--font-mono)", marginBottom: 14, lineHeight: 1.5 }}>
                    Set a target for personal spending. Analytics will show how much of it you have used this month. Set 0 to hide the budget.
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <span style={{ fontSize: 10, color: t.text3, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Amount</span>
                      <input style={inputStyle} type="number" min="0" step="0.01" value={budgetInput} onChange={(e) => setBudgetInput(e.target.value)} />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <span style={{ fontSize: 10, color: t.text3, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Vault currency</span>
                      <select style={inputStyle} value={settingsCurrency} onChange={(e) => setSettingsCurrency(e.target.value as Currency)}>
                        {["USD", "EUR", "GBP", "PKR", "CAD", "AUD", "JPY", "CHF", "INR", "SGD", "AED"].map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </label>
                  </div>
                  <button
                    onClick={saveSettings} disabled={savingSettings}
                    style={{
                      marginTop: 16, background: t.green, color: "#000", border: "none", borderRadius: 8,
                      padding: "10px 18px", fontSize: 13, fontWeight: 700, fontFamily: "var(--font-display)",
                      cursor: savingSettings ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 7,
                      opacity: savingSettings ? 0.7 : 1,
                    }}
                  >
                    {savingSettings ? <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={14} />} Save vault settings
                  </button>
                </div>

                <div style={{ ...card, display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <ShieldCheck size={16} color={t.green} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: t.text, fontFamily: "var(--font-display)" }}>Private by design</div>
                    <p style={{ fontSize: 11.5, color: t.text3, fontFamily: "var(--font-mono)", marginTop: 5, lineHeight: 1.6 }}>
                      Vault records are tied to your account and protected by row level security. They stay separate from your tracked subscriptions, so your personal expenses never mix with subscription analytics.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
