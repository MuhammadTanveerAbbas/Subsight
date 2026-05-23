"use client";

import { useState, useEffect } from "react";
import { Globe, Tag, Plus, X, Bell, Save, RefreshCw, ToggleRight, ToggleLeft } from "lucide-react";
import type { T } from "@/app/(app)/dashboard/dashboard-constants";

export function SettingsView({
  t,
  toast,
}: {
  t: T;
  toast: (m: string, tp: "success" | "error" | "info") => void;
}) {
  const [currency, setCurrency] = useState("USD");
  const [goalPeriod, setGoalPeriod] = useState("Monthly");
  const [goalAmt, setGoalAmt] = useState("");
  const [goalCur, setGoalCur] = useState("USD");
  const [catInput, setCatInput] = useState("");
  const [cats, setCats] = useState<string[]>([]);
  const [notifs, setNotifs] = useState({
    renewal: true,
    weekly: false,
    budget: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("subsight-settings");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.currency) setCurrency(parsed.currency);
        if (parsed.cats) setCats(parsed.cats);
        if (parsed.notifs) setNotifs(parsed.notifs);
      } catch {}
    }
  }, []);

  const addCat = () => {
    if (catInput.trim() && !cats.includes(catInput.trim())) {
      setCats((p) => [...p, catInput.trim()]);
      setCatInput("");
    }
  };
  const removeCat = (c: string) => setCats((p) => p.filter((x) => x !== c));

  const save = async () => {
    setSaving(true);
    localStorage.setItem(
      "subsight-settings",
      JSON.stringify({ currency, cats, notifs }),
    );
    await new Promise((r) => setTimeout(r, 300));
    setSaving(false);
    toast("Settings saved", "success");
  };

  const sel: React.CSSProperties = {
    background: t.surface2,
    border: `1px solid ${t.border}`,
    borderRadius: 8,
    padding: "10px 13px",
    fontSize: 13,
    color: t.text,
    fontFamily: "var(--font-mono)",
    cursor: "pointer",
    outline: "none",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 18,
        maxWidth: 680,
      }}
    >
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
          Settings
        </h2>
        <p
          style={{
            fontSize: 11.5,
            color: t.text3,
            fontFamily: "var(--font-mono)",
            marginTop: 3,
          }}
        >
          Manage spending goals, categories, and preferences
        </p>
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
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 5,
          }}
        >
          <Globe size={14} color={t.green} />
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: t.text,
              fontFamily: "var(--font-display)",
            }}
          >
            Display Currency
          </span>
        </div>
        <p
          style={{
            fontSize: 12,
            color: t.text3,
            fontFamily: "var(--font-mono)",
            marginBottom: 16,
          }}
        >
          Choose your preferred currency for display across the app
        </p>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          style={{ ...sel, minWidth: 160 }}
        >
          {["USD", "EUR", "GBP", "PKR", "CAD", "AUD", "JPY", "CHF"].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
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
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 5,
          }}
        >
          <Tag size={14} color={t.green} />
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: t.text,
              fontFamily: "var(--font-display)",
            }}
          >
            Custom Categories
          </span>
        </div>
        <p
          style={{
            fontSize: 12,
            color: t.text3,
            fontFamily: "var(--font-mono)",
            marginBottom: 16,
          }}
        >
          Create your own subscription categories
        </p>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <input
            value={catInput}
            onChange={(e) => setCatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCat()}
            placeholder="Category name"
            style={{ ...sel, flex: 1 }}
          />
          <button
            onClick={addCat}
            style={{
              background: t.green,
              color: "#000",
              border: "none",
              borderRadius: 8,
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "var(--font-display)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Plus size={13} /> Add
          </button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {cats.map((c) => (
            <div
              key={c}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: t.surface2,
                border: `1px solid ${t.border}`,
                borderRadius: 6,
                padding: "5px 11px",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: t.text2,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {c}
              </span>
              <button
                onClick={() => removeCat(c)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: t.text3,
                  padding: 1,
                  display: "flex",
                }}
              >
                <X size={11} />
              </button>
            </div>
          ))}
          {cats.length === 0 && (
            <span
              style={{
                fontSize: 12,
                color: t.text3,
                fontFamily: "var(--font-mono)",
              }}
            >
              No custom categories yet
            </span>
          )}
        </div>
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
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 5,
          }}
        >
          <Bell size={14} color={t.green} />
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: t.text,
              fontFamily: "var(--font-display)",
            }}
          >
            Notifications
          </span>
        </div>
        <p
          style={{
            fontSize: 12,
            color: t.text3,
            fontFamily: "var(--font-mono)",
            marginBottom: 16,
          }}
        >
          Control when and how you get notified
        </p>
        {[
          {
            key: "renewal" as const,
            label: "Renewal Alerts",
            desc: "Get notified before a subscription renews (Pro)",
          },
          {
            key: "weekly" as const,
            label: "Weekly Summary",
            desc: "Weekly email digest of your spending activity (Pro)",
          },
          {
            key: "budget" as const,
            label: "Budget Warnings",
            desc: "Alert when approaching your spending goal",
          },
        ].map((item) => (
          <div
            key={item.key}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "13px 0",
              borderBottom: `1px solid ${t.border}`,
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
                {item.label}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: t.text3,
                  fontFamily: "var(--font-mono)",
                  marginTop: 2,
                }}
              >
                {item.desc}
              </div>
            </div>
            <button
              onClick={() =>
                setNotifs((p) => ({ ...p, [item.key]: !p[item.key] }))
              }
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: notifs[item.key] ? t.green : t.text3,
                flexShrink: 0,
              }}
            >
              {notifs[item.key] ? (
                <ToggleRight size={27} />
              ) : (
                <ToggleLeft size={27} />
              )}
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={save}
        disabled={saving}
        style={{
          background: t.green,
          color: "#000",
          border: "none",
          borderRadius: 9,
          padding: "13px",
          fontSize: 14,
          fontWeight: 700,
          fontFamily: "var(--font-display)",
          cursor: saving ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          opacity: saving ? 0.75 : 1,
        }}
      >
        {saving ? (
          <>
            <RefreshCw
              size={14}
              style={{ animation: "spin 1s linear infinite" }}
            />{" "}
            Saving…
          </>
        ) : (
          <>
            <Save size={14} /> Save Settings
          </>
        )}
      </button>
    </div>
  );
}
