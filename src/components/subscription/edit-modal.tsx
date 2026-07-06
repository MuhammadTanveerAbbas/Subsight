"use client";

import { useState } from "react";
import { X, RefreshCw, Save, ToggleLeft, ToggleRight } from "lucide-react";
import { updateSubscription as updateSubscriptionApi } from "@/lib/subscriptions-api";
import { useSubscriptions } from "@/contexts/subscription-context";
import { BILLING_CYCLE_LABELS, BILLING_CYCLES } from "@/lib/types";
import type { Sub, SubStatus } from "@/app/(app)/dashboard/dashboard-types";
import type { T } from "@/app/(app)/dashboard/dashboard-constants";

function InputRow({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  t,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  t: T;
}) {
  const base: React.CSSProperties = {
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
  return (
    <div>
      <label
        style={{
          fontSize: 10.5,
          color: t.text3,
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.08em",
          display: "block",
          marginBottom: 5,
        }}
      >
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        style={base}
        onFocus={(e) =>
          ((e.target as HTMLInputElement).style.borderColor = t.greenBorder)
        }
        onBlur={(e) =>
          ((e.target as HTMLInputElement).style.borderColor = t.border)
        }
      />
    </div>
  );
}

function SelectRow({
  label,
  value,
  onChange,
  options,
  labels,
  t,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  labels?: Record<string, string>;
  t: T;
}) {
  return (
    <div>
      <label
        style={{
          fontSize: 10.5,
          color: t.text3,
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.08em",
          display: "block",
          marginBottom: 5,
        }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          background: t.surface2,
          border: `1px solid ${t.border}`,
          borderRadius: 8,
          padding: "10px 13px",
          fontSize: 13,
          color: t.text,
          fontFamily: "var(--font-mono)",
          outline: "none",
          cursor: "pointer",
        }}
      >
        {options.map((o) => (
          <option key={o} value={o}>{labels?.[o] || o}</option>
        ))}
      </select>
    </div>
  );
}

export function EditModal({
  sub,
  onSave,
  onClose,
  t,
}: {
  sub: Sub;
  onSave: (s: Sub) => void;
  onClose: () => void;
  t: T;
}) {
  const [form, setForm] = useState<Sub>({ ...sub });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refetchSubscriptions } = useSubscriptions();
  const f =
    <K extends keyof Sub>(k: K) =>
    (v: Sub[K]) =>
      setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateSubscriptionApi(form.id, {
        name: form.name,
        category: form.category,
        amount: form.amount,
        billingCycle: form.cycle,
        provider: form.provider,
        notes: form.notes,
        autoRenew: form.autoRenew,
        currency: form.currency,
        status: form.status,
      });
      await refetchSubscriptions();
      onSave(form);
    } catch (err: any) {
      setError(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          background: t.surface,
          border: `1px solid ${t.border}`,
          borderRadius: 14,
          padding: "28px 28px",
          width: "100%",
          maxWidth: 520,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: `0 32px 80px ${t.shadow}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 19,
                fontWeight: 800,
                color: t.text,
                letterSpacing: -0.5,
              }}
            >
              Edit Subscription
            </h2>
            <p
              style={{
                fontSize: 11,
                color: t.text3,
                fontFamily: "var(--font-mono)",
                marginTop: 2,
              }}
            >
              Update details for {sub.name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: t.text3,
              cursor: "pointer",
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>
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
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <InputRow
            label="Subscription Name *"
            value={form.name}
            onChange={(v) => f("name")(v)}
            placeholder="e.g. Netflix"
            t={t}
          />
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label
                style={{
                  fontSize: 10.5,
                  color: t.text3,
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.08em",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Amount *
              </label>
              <div style={{ display: "flex", gap: 6 }}>
                <select
                  value={form.currency}
                  onChange={(e) => f("currency")(e.target.value)}
                  style={{
                    background: t.surface2,
                    border: `1px solid ${t.border}`,
                    borderRadius: 8,
                    padding: "10px 10px",
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
                  value={String(form.amount)}
                  onChange={(e) =>
                    f("amount")(parseFloat(e.target.value) || (0 as any))
                  }
                  type="number"
                  step="0.01"
                  style={{
                    flex: 1,
                    background: t.surface2,
                    border: `1px solid ${t.border}`,
                    borderRadius: 8,
                    padding: "10px 13px",
                    fontSize: 13,
                    color: t.text,
                    fontFamily: "var(--font-mono)",
                    outline: "none",
                  }}
                />
              </div>
            </div>
            <SelectRow
              label="Billing Cycle"
              value={form.cycle}
              onChange={(v) => f("cycle")(v)}
              options={BILLING_CYCLES.map((c) => c)}
              labels={BILLING_CYCLE_LABELS}
              t={t}
            />
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <SelectRow
              label="Category"
              value={form.category}
              onChange={(v) => f("category")(v)}
              options={[
                "Streaming", "Productivity", "Cloud", "Design",
                "Development", "Music", "Finance", "Education",
                "Lifestyle", "Other",
              ]}
              t={t}
            />
            <SelectRow
              label="Status"
              value={form.status}
              onChange={(v) => f("status")(v as SubStatus)}
              options={["active", "inactive", "warning", "renewal_passed"]}
              t={t}
            />
          </div>
          <InputRow
            label="Provider"
            value={form.provider}
            onChange={(v) => f("provider")(v)}
            placeholder="e.g. Netflix Inc."
            t={t}
          />
          <div>
            <label
              style={{
                fontSize: 10.5,
                color: t.text3,
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.08em",
                display: "block",
                marginBottom: 5,
              }}
            >
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => f("notes")(e.target.value)}
              rows={2}
              placeholder="Optional notes..."
              style={{
                width: "100%",
                background: t.surface2,
                border: `1px solid ${t.border}`,
                borderRadius: 8,
                padding: "10px 13px",
                fontSize: 13,
                color: t.text,
                fontFamily: "var(--font-mono)",
                outline: "none",
                resize: "vertical",
                transition: "border-color 0.2s",
              }}
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
              padding: "12px 14px",
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
                <ToggleRight size={28} />
              ) : (
                <ToggleLeft size={28} />
              )}
            </button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button
            onClick={handleSave}
            disabled={saving || !form.name}
            style={{
              flex: 1,
              background: t.green,
              color: "#000",
              border: "none",
              borderRadius: 8,
              padding: "12px",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              cursor: saving || !form.name ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              opacity: !form.name ? 0.6 : 1,
            }}
          >
            {saving ? (
              <>
                <RefreshCw
                  size={13}
                  style={{ animation: "spin 1s linear infinite" }}
                />{" "}
                Saving...
              </>
            ) : (
              <>
                <Save size={13} /> Save Changes
              </>
            )}
          </button>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              color: t.text2,
              border: `1px solid ${t.border2}`,
              borderRadius: 8,
              padding: "12px 20px",
              fontSize: 13,
              fontFamily: "var(--font-display)",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
