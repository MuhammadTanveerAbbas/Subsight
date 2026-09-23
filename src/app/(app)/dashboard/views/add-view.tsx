"use client";

import { useState } from "react";
import { Plus, Sparkles, RefreshCw, CreditCard, ToggleLeft, ToggleRight, AlertCircle } from "lucide-react";
import { BILLING_CYCLE_LABELS, BILLING_CYCLES, CURRENCIES } from "@/lib/types";
import { createSubscription } from "@/lib/subscriptions-api";
import { fetchWithTimeout } from "@/lib/fetch-client";
import type { T } from "@/app/(app)/dashboard/dashboard-constants";

const CATEGORIES = [
  "Streaming", "Productivity", "Cloud", "Design",
  "Development", "Music", "Finance", "Education",
  "Lifestyle", "Communication", "Health", "Other",
];

export function AddView({
  t,
  onSuccess,
  toast,
}: {
  t: T;
  onSuccess: () => void | Promise<void>;
  toast: (m: string, tp: "success" | "error" | "info") => void;
}) {
  const blank = {
    name: "", category: "", amount: "", cycle: "monthly",
    startDate: "", provider: "", autoRenew: true, currency: "USD", notes: "",
  };
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoad] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiProgress, setAiProgress] = useState(0);
  const f = (k: keyof typeof form) => (v: string | boolean) =>
    setForm((p) => ({ ...p, [k]: v }));

  const aiAutofill = async () => {
    if (!form.name.trim()) return;
    setAiLoad(true);
    setError(null);
    setAiProgress(0);
    // Simulate progress ticks while waiting
    const ticker = setInterval(() => setAiProgress((p) => Math.min(p + 12, 88)), 350);
    try {
      const res = await fetchWithTimeout("/api/ai/autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name }),
        timeoutMs: 30_000,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "AI autofill failed");
      }
      const data = await res.json();
      setForm((p) => ({
        ...p,
        category:  data.category    || p.category,
        amount:    data.amount      ? String(data.amount) : p.amount,
        provider:  data.provider    || p.provider,
        cycle:     data.billingCycle || p.cycle,
        autoRenew: data.autoRenew   ?? p.autoRenew,
        currency:  data.currency    || p.currency,
      }));
      setAiProgress(100);
      toast("AI autofill complete", "success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "AI autofill unavailable");
    } finally {
      clearInterval(ticker);
      setTimeout(() => setAiProgress(0), 600);
      setAiLoad(false);
    }
  };

  const submit = async () => {
    if (!form.name.trim() || !form.amount) return;
    setLoading(true);
    setError(null);
    try {
      await createSubscription({
        name: form.name.trim(),
        amount: parseFloat(form.amount),
        billingCycle: form.cycle,
        category: form.category || null,
        provider: form.provider || null,
        startDate: form.startDate || undefined,
        currency: form.currency,
        autoRenew: form.autoRenew,
        notes: form.notes || null,
      });
      setForm(blank);
      toast("Subscription added", "success");
      await onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add subscription");
    } finally {
      setLoading(false);
    }
  };

  const iStyle: React.CSSProperties = {
    width: "100%",
    background: t.surface2,
    border: `1px solid ${t.border}`,
    borderRadius: 8,
    padding: "10px 13px",
    fontSize: 13,
    color: t.text,
    fontFamily: "var(--font-mono)",
    outline: "none",
    transition: "border-color 0.2s",
  };
  const lStyle: React.CSSProperties = {
    fontSize: 10.5,
    color: t.text3,
    fontFamily: "var(--font-mono)",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    display: "block",
    marginBottom: 5,
    lineHeight: 1.5,
  };

  const preview = {
    name:      form.name     || "Subscription Name",
    amount:    form.amount   ? `${form.currency} ${parseFloat(form.amount).toFixed(2)}` : `${form.currency} 0.00`,
    cycle:     form.cycle,
    category:  form.category || "Category",
    start:     form.startDate || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    autoRenew: form.autoRenew ? "Yes" : "No",
  };

  return (
    <div
      className="add-grid"
      style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}
    >
      {/* ── Form card ─────────────────────────────── */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 28 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: t.text, letterSpacing: -0.5, marginBottom: 4 }}>
          Add Subscription
        </h2>
        <p style={{ fontSize: 12, color: t.text3, fontFamily: "var(--font-mono)", marginBottom: 24, lineHeight: 1.5 }}>
          Track a recurring payment. Use AI Fill to auto-populate details.
        </p>

        {error && (
          <div
            role="alert"
            style={{
              background: t.redDim, border: `1px solid ${t.red}44`,
              borderRadius: 8, padding: "10px 14px", marginBottom: 18,
              fontSize: 12, color: t.red, fontFamily: "var(--font-mono)",
              display: "flex", alignItems: "flex-start", gap: 8, lineHeight: 1.5,
            }}
          >
            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Name + AI Fill */}
          <div>
            <label style={lStyle} htmlFor="sub-name">Subscription Name *</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                id="sub-name"
                value={form.name}
                onChange={(e) => f("name")(e.target.value)}
                placeholder="e.g. Netflix"
                disabled={loading}
                style={{ ...iStyle, flex: 1 }}
                onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = t.greenBorder)}
                onBlur={(e)  => ((e.target as HTMLInputElement).style.borderColor = t.border)}
              />
              <button
                onClick={aiAutofill}
                disabled={!form.name.trim() || loading || aiLoading}
                aria-label="AI auto-fill subscription details"
                style={{
                  background: aiLoading ? t.surface3 : t.greenDim,
                  border: `1px solid ${aiLoading ? t.border2 : t.greenBorder}`,
                  borderRadius: 8,
                  padding: "0 14px",
                  cursor: form.name.trim() && !loading && !aiLoading ? "pointer" : "not-allowed",
                  color: aiLoading ? t.text3 : t.green,
                  opacity: !form.name.trim() ? 0.5 : 1,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                  fontWeight: 600,
                  transition: "all 0.2s",
                  position: "relative",
                  overflow: "hidden",
                  minWidth: 86,
                }}
              >
                {/* Progress bar */}
                {aiLoading && aiProgress > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      height: 2,
                      width: `${aiProgress}%`,
                      background: t.green,
                      transition: "width 0.3s ease",
                      borderRadius: 1,
                    }}
                  />
                )}
                {aiLoading
                  ? <><RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} /> AI Fill</>
                  : <><Sparkles size={13} /> AI Fill</>
                }
              </button>
            </div>
          </div>

          {/* Amount + Currency + Cycle */}
          <div className="add-inner-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={lStyle} htmlFor="sub-currency">Currency & Amount *</label>
              <div style={{ display: "flex", gap: 6 }}>
                <select
                  id="sub-currency"
                  value={form.currency}
                  onChange={(e) => f("currency")(e.target.value)}
                  disabled={loading}
                  style={{ ...iStyle, width: "auto", flexShrink: 0, cursor: "pointer", paddingRight: 8 }}
                >
                  {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <input
                  id="sub-amount"
                  aria-label="Amount"
                  value={form.amount}
                  onChange={(e) => f("amount")(e.target.value)}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  disabled={loading}
                  style={{ ...iStyle }}
                  onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = t.greenBorder)}
                  onBlur={(e)  => ((e.target as HTMLInputElement).style.borderColor = t.border)}
                />
              </div>
            </div>
            <div>
              <label style={lStyle} htmlFor="sub-cycle">Billing Cycle</label>
              <select
                id="sub-cycle"
                value={form.cycle}
                onChange={(e) => f("cycle")(e.target.value)}
                disabled={loading}
                style={{ ...iStyle, cursor: "pointer" }}
              >
                {BILLING_CYCLES.map((c) => (
                  <option key={c} value={c}>{BILLING_CYCLE_LABELS[c]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category + Start Date */}
          <div className="add-inner-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={lStyle} htmlFor="sub-category">Category</label>
              <select
                id="sub-category"
                value={form.category}
                onChange={(e) => f("category")(e.target.value)}
                disabled={loading}
                style={{ ...iStyle, cursor: "pointer" }}
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={lStyle} htmlFor="sub-start">Start Date</label>
              <input
                id="sub-start"
                value={form.startDate}
                onChange={(e) => f("startDate")(e.target.value)}
                type="date"
                disabled={loading}
                style={{ ...iStyle }}
                onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = t.greenBorder)}
                onBlur={(e)  => ((e.target as HTMLInputElement).style.borderColor = t.border)}
              />
            </div>
          </div>

          {/* Provider */}
          <div>
            <label style={lStyle} htmlFor="sub-provider">Provider</label>
            <input
              id="sub-provider"
              value={form.provider}
              onChange={(e) => f("provider")(e.target.value)}
              placeholder="e.g. Netflix Inc."
              disabled={loading}
              style={{ ...iStyle }}
              onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = t.greenBorder)}
              onBlur={(e)  => ((e.target as HTMLInputElement).style.borderColor = t.border)}
            />
          </div>

          {/* Notes */}
          <div>
            <label style={lStyle} htmlFor="sub-notes">Notes (optional)</label>
            <textarea
              id="sub-notes"
              value={form.notes}
              onChange={(e) => f("notes")(e.target.value)}
              rows={2}
              placeholder="Optional notes…"
              disabled={loading}
              style={{ ...iStyle, resize: "vertical", lineHeight: 1.5 }}
              onFocus={(e) => ((e.target as HTMLTextAreaElement).style.borderColor = t.greenBorder)}
              onBlur={(e)  => ((e.target as HTMLTextAreaElement).style.borderColor = t.border)}
            />
          </div>

          {/* Auto Renew */}
          <div
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 8, padding: "12px 14px",
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.text, fontFamily: "var(--font-display)" }}>
                Auto Renew
              </div>
              <div style={{ fontSize: 11, color: t.text3, fontFamily: "var(--font-mono)", marginTop: 2, lineHeight: 1.4 }}>
                Automatically renews each billing cycle
              </div>
            </div>
            <button
              onClick={() => f("autoRenew")(!form.autoRenew)}
              disabled={loading}
              aria-label={`Auto renew is ${form.autoRenew ? "on" : "off"}`}
              aria-pressed={form.autoRenew}
              style={{ background: "none", border: "none", cursor: loading ? "not-allowed" : "pointer", color: form.autoRenew ? t.green : t.text3, opacity: loading ? 0.5 : 1 }}
            >
              {form.autoRenew ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
            </button>
          </div>

          {/* Submit */}
          <button
            onClick={submit}
            disabled={!form.name.trim() || !form.amount || loading}
            aria-disabled={!form.name.trim() || !form.amount || loading}
            style={{
              background: t.green, color: "#000", border: "none", borderRadius: 9, padding: "13px",
              fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)",
              cursor: !form.name.trim() || !form.amount || loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              opacity: !form.name.trim() || !form.amount ? 0.6 : 1,
              transition: "background 0.2s, opacity 0.2s",
              boxShadow: form.name.trim() && form.amount ? `0 2px 12px ${t.green}44` : "none",
            }}
            onMouseEnter={(e) => { if (form.name.trim() && form.amount && !loading) (e.currentTarget as HTMLElement).style.background = t.green2; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = t.green; }}
          >
            {loading
              ? <><RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> Adding…</>
              : <><Plus size={14} /> Add Subscription</>
            }
          </button>
        </div>
      </div>

      {/* ── Preview card ───────────────────────────── */}
      <div
        style={{
          background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 22,
          position: "sticky", top: 88, alignSelf: "start",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: t.text, fontFamily: "var(--font-display)", marginBottom: 14 }}>
          Preview
        </div>
        <div style={{ background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 10, padding: 16 }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div
              style={{
                width: 40, height: 40, borderRadius: 10,
                background: t.greenDim, border: `1px solid ${t.greenBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}
            >
              <CreditCard size={16} color={t.green} strokeWidth={1.5} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {preview.name}
              </div>
              <div style={{ fontSize: 11, color: t.text3, fontFamily: "var(--font-mono)", marginTop: 1 }}>
                {form.provider || "Provider"}
              </div>
            </div>
          </div>
          {/* Fields */}
          {([
            ["Amount",       preview.amount],
            ["Billing Cycle", preview.cycle],
            ["Category",     preview.category],
            ["Start Date",   preview.start],
            ["Auto Renew",   preview.autoRenew],
          ] as [string, string][]).map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${t.border}` }}>
              <span style={{ fontSize: 11.5, color: t.text3, fontFamily: "var(--font-mono)" }}>{k}</span>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: t.text, fontFamily: "var(--font-mono)" }}>{v}</span>
            </div>
          ))}
          {/* Status badge */}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
            <span style={{ fontSize: 11.5, color: t.text3, fontFamily: "var(--font-mono)" }}>Status</span>
            <span style={{ fontSize: 10, color: t.green, background: t.greenDim, border: `1px solid ${t.greenBorder}`, borderRadius: 4, padding: "2px 8px", fontFamily: "var(--font-mono)" }}>
              Active
            </span>
          </div>
        </div>
        <p style={{ fontSize: 11, color: t.text3, fontFamily: "var(--font-mono)", marginTop: 12, lineHeight: 1.5 }}>
          Type a service name and press <strong style={{ color: t.green }}>AI Fill</strong> to auto-populate all fields instantly.
        </p>
      </div>
    </div>
  );
}
