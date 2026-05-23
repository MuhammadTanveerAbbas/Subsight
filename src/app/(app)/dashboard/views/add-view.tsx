"use client";

import { useState } from "react";
import {
  Plus, Sparkles, RefreshCw, CreditCard, ToggleLeft, ToggleRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { T } from "@/app/(app)/dashboard/dashboard-constants";

export function AddView({
  t,
  onSuccess,
  toast,
}: {
  t: T;
  onSuccess: () => void;
  toast: (m: string, tp: "success" | "error" | "info") => void;
}) {
  const blank = {
    name: "",
    category: "",
    amount: "",
    cycle: "Monthly",
    startDate: "",
    provider: "",
    autoRenew: true,
    currency: "USD",
    notes: "",
  };
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoad] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const f = (k: keyof typeof form) => (v: string | boolean) =>
    setForm((p) => ({ ...p, [k]: v }));

  const aiAutofill = async () => {
    if (!form.name) return;
    setAiLoad(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "AI autofill failed");
      }
      const data = await res.json();
      setForm((p) => ({
        ...p,
        category: data.category || p.category,
        amount: data.amount ? String(data.amount) : p.amount,
        provider: data.provider || p.provider,
        cycle:
          data.billingCycle === "yearly"
            ? "Annually"
            : data.billingCycle === "monthly"
              ? "Monthly"
              : p.cycle,
        autoRenew: data.autoRenew ?? p.autoRenew,
        currency: data.currency || p.currency,
      }));
      toast("AI autofill complete", "success");
    } catch (err: any) {
      setError(err.message || "AI autofill unavailable");
    } finally {
      setAiLoad(false);
    }
  };

  const submit = async () => {
    if (!form.name || !form.amount) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const startDate =
        form.startDate || new Date().toISOString().split("T")[0];
      const { error: dbError } = await supabase.from("subscriptions").insert({
        user_id: user.id,
        name: form.name,
        amount: parseFloat(form.amount),
        billing_cycle: form.cycle,
        category: form.category || null,
        provider: form.provider || null,
        start_date: startDate,
        currency: form.currency,
        auto_renew: form.autoRenew,
        status: "active",
        notes: form.notes || null,
        active_status: true,
        icon: "default",
      });
      if (dbError) throw dbError;
      setForm(blank);
      toast("Subscription added", "success");
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to add subscription");
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
    display: "block",
    marginBottom: 5,
  };
  const preview = {
    name: form.name || "Subscription Name",
    amount: form.amount
      ? `${form.currency} ${parseFloat(form.amount).toFixed(2)}`
      : `${form.currency} 0.00`,
    cycle: form.cycle,
    category: form.category || "",
    start:
      form.startDate ||
      new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    autoRenew: form.autoRenew ? "Yes" : "No",
  };

  return (
    <div
      className="add-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 320px",
        gap: 22,
        alignItems: "start",
      }}
    >
      <div
        style={{
          background: t.surface,
          border: `1px solid ${t.border}`,
          borderRadius: 12,
          padding: "28px",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 20,
            fontWeight: 800,
            color: t.text,
            letterSpacing: -0.5,
            marginBottom: 5,
          }}
        >
          Add Subscription
        </h2>
        <p
          style={{
            fontSize: 12,
            color: t.text3,
            fontFamily: "var(--font-mono)",
            marginBottom: 26,
          }}
        >
          Track your recurring payments with AI-powered insights
        </p>
        {error && (
          <div
            style={{
              background: t.redDim,
              border: `1px solid ${t.red}44`,
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 16,
              fontSize: 12,
              color: t.red,
              fontFamily: "var(--font-mono)",
            }}
          >
            {error}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={lStyle}>Subscription Name *</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={form.name}
                onChange={(e) => f("name")(e.target.value)}
                placeholder="e.g. Netflix"
                style={{ ...iStyle, flex: 1 }}
                onFocus={(e) =>
                  ((e.target as HTMLInputElement).style.borderColor =
                    t.greenBorder)
                }
                onBlur={(e) =>
                  ((e.target as HTMLInputElement).style.borderColor = t.border)
                }
              />
              <button
                onClick={aiAutofill}
                disabled={!form.name || aiLoading}
                style={{
                  background: t.greenDim,
                  border: `1px solid ${t.greenBorder}`,
                  borderRadius: 8,
                  padding: "0 14px",
                  cursor: form.name && !aiLoading ? "pointer" : "not-allowed",
                  color: t.green,
                  opacity: !form.name ? 0.5 : 1,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                  fontWeight: 600,
                }}
              >
                {aiLoading ? (
                  <RefreshCw
                    size={13}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                ) : (
                  <Sparkles size={13} />
                )}{" "}
                AI Fill
              </button>
            </div>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <div>
              <label style={lStyle}>Amount *</label>
              <div style={{ display: "flex", gap: 6 }}>
                <select
                  value={form.currency}
                  onChange={(e) => f("currency")(e.target.value)}
                  style={{
                    background: t.surface2,
                    border: `1px solid ${t.border}`,
                    borderRadius: 8,
                    padding: "10px 8px",
                    fontSize: 12,
                    color: t.text,
                    fontFamily: "var(--font-mono)",
                    cursor: "pointer",
                    outline: "none",
                    flexShrink: 0,
                  }}
                >
                  {["USD", "EUR", "GBP", "PKR", "CAD", "AUD"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <input
                  value={form.amount}
                  onChange={(e) => f("amount")(e.target.value)}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  style={{ ...iStyle }}
                  onFocus={(e) =>
                    ((e.target as HTMLInputElement).style.borderColor =
                      t.greenBorder)
                  }
                  onBlur={(e) =>
                    ((e.target as HTMLInputElement).style.borderColor =
                      t.border)
                  }
                />
              </div>
            </div>
            <div>
              <label style={lStyle}>Billing Cycle</label>
              <select
                value={form.cycle}
                onChange={(e) => f("cycle")(e.target.value)}
                style={{ ...iStyle, cursor: "pointer" }}
              >
                {["Daily", "Weekly", "Monthly", "Quarterly", "Annually"].map(
                  (c) => (
                    <option key={c}>{c}</option>
                  ),
                )}
              </select>
            </div>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <div>
              <label style={lStyle}>Category</label>
              <select
                value={form.category}
                onChange={(e) => f("category")(e.target.value)}
                style={{ ...iStyle, cursor: "pointer" }}
              >
                <option value="">Select category</option>
                {[
                  "Streaming",
                  "Productivity",
                  "Cloud",
                  "Design",
                  "Development",
                  "Music",
                  "Finance",
                  "Education",
                  "Lifestyle",
                  "Other",
                ].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={lStyle}>Start Date</label>
              <input
                value={form.startDate}
                onChange={(e) => f("startDate")(e.target.value)}
                type="date"
                style={{ ...iStyle }}
                onFocus={(e) =>
                  ((e.target as HTMLInputElement).style.borderColor =
                    t.greenBorder)
                }
                onBlur={(e) =>
                  ((e.target as HTMLInputElement).style.borderColor = t.border)
                }
              />
            </div>
          </div>
          <div>
            <label style={lStyle}>Provider</label>
            <input
              value={form.provider}
              onChange={(e) => f("provider")(e.target.value)}
              placeholder="e.g. Netflix Inc."
              style={{ ...iStyle }}
              onFocus={(e) =>
                ((e.target as HTMLInputElement).style.borderColor =
                  t.greenBorder)
              }
              onBlur={(e) =>
                ((e.target as HTMLInputElement).style.borderColor = t.border)
              }
            />
          </div>
          <div>
            <label style={lStyle}>Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => f("notes")(e.target.value)}
              rows={2}
              placeholder="Optional notes…"
              style={{ ...iStyle, resize: "vertical" }}
              onFocus={(e) =>
                ((e.target as HTMLTextAreaElement).style.borderColor =
                  t.greenBorder)
              }
              onBlur={(e) =>
                ((e.target as HTMLTextAreaElement).style.borderColor = t.border)
              }
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: t.surface2,
              border: `1px solid ${t.border}`,
              borderRadius: 8,
              padding: "13px 15px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: t.text,
                  fontFamily: "var(--font-display)",
                }}
              >
                Auto Renew
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: t.text3,
                  fontFamily: "var(--font-mono)",
                  marginTop: 1,
                }}
              >
                Automatically renews each billing cycle
              </div>
            </div>
            <button
              onClick={() => f("autoRenew")(!form.autoRenew)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: form.autoRenew ? t.green : t.text3,
              }}
            >
              {form.autoRenew ? (
                <ToggleRight size={27} />
              ) : (
                <ToggleLeft size={27} />
              )}
            </button>
          </div>
          <button
            onClick={submit}
            disabled={!form.name || !form.amount || loading}
            style={{
              background: t.green,
              color: "#000",
              border: "none",
              borderRadius: 9,
              padding: "13px",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              cursor:
                !form.name || !form.amount || loading
                  ? "not-allowed"
                  : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity: !form.name || !form.amount ? 0.6 : 1,
              transition: "background 0.2s",
            }}
          >
            {loading ? (
              <>
                <RefreshCw
                  size={14}
                  style={{ animation: "spin 1s linear infinite" }}
                />{" "}
                Adding…
              </>
            ) : (
              <>
                <Plus size={14} /> Add Subscription
              </>
            )}
          </button>
        </div>
      </div>
      <div
        style={{
          background: t.surface,
          border: `1px solid ${t.border}`,
          borderRadius: 12,
          padding: "22px",
          position: "sticky",
          top: 24,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: t.text,
            fontFamily: "var(--font-display)",
            marginBottom: 16,
          }}
        >
          Preview
        </div>
        <div
          style={{
            background: t.surface2,
            border: `1px solid ${t.border}`,
            borderRadius: 10,
            padding: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: t.greenDim,
                border: `1px solid ${t.greenBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CreditCard size={16} color={t.green} strokeWidth={1.5} />
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 14,
                  fontWeight: 700,
                  color: t.text,
                }}
              >
                {preview.name}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: t.text3,
                  fontFamily: "var(--font-mono)",
                  marginTop: 1,
                }}
              >
                {form.provider || "Provider"}
              </div>
            </div>
          </div>
          {[
            ["Amount", preview.amount],
            ["Billing Cycle", preview.cycle],
            ["Category", preview.category],
            ["Start Date", preview.start],
            ["Auto Renew", preview.autoRenew],
          ].map(([k, v]) => (
            <div
              key={k}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "9px 0",
                borderBottom: `1px solid ${t.border}`,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: t.text3,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {k}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: t.text,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {v}
              </span>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "9px 0",
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: t.text3,
                fontFamily: "var(--font-mono)",
              }}
            >
              Status
            </span>
            <span
              style={{
                fontSize: 10,
                color: t.green,
                background: t.greenDim,
                border: `1px solid ${t.greenBorder}`,
                borderRadius: 4,
                padding: "3px 8px",
                fontFamily: "var(--font-mono)",
              }}
            >
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
