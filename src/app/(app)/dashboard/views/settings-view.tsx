"use client";

import { useState, useEffect } from "react";
import { Globe, Tag, Plus, X, Bell, Save, RefreshCw, ToggleRight, ToggleLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import type { T } from "@/app/(app)/dashboard/dashboard-constants";

export function SettingsView({
  t,
  toast,
}: {
  t: T;
  toast: (m: string, tp: "success" | "error" | "info") => void;
}) {
  const { user } = useAuth();
  const [currency, setCurrency] = useState("USD");
  const [catInput, setCatInput] = useState("");
  const [cats, setCats] = useState<string[]>([]);
  const [notifs, setNotifs] = useState({ renewal: true, weekly: false, budget: true });
  const [saving, setSaving] = useState(false);
  const [loadingPrefs, setLoadingPrefs] = useState(true);

  /* ── Load prefs from Supabase (fallback to localStorage) ── */
  useEffect(() => {
    const loadPrefs = async () => {
      // Always try localStorage first for instant load
      const stored = localStorage.getItem("subsight-settings");
      if (stored) {
        try {
          const p = JSON.parse(stored);
          if (p.currency) setCurrency(p.currency);
          if (p.cats) setCats(p.cats);
          if (p.notifs) setNotifs(p.notifs);
        } catch { /* ignore */ }
      }

      if (!user) { setLoadingPrefs(false); return; }

      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("profiles")
          .select("preferences")
          .eq("id", user.id)
          .single();
        if (data?.preferences) {
          const prefs = typeof data.preferences === "string"
            ? JSON.parse(data.preferences)
            : data.preferences;
          if (prefs.currency) setCurrency(prefs.currency);
          if (prefs.cats)     setCats(prefs.cats);
          if (prefs.notifs)   setNotifs(prefs.notifs);
        }
      } catch { /* column may not exist yet localStorage is the fallback */ }
      finally { setLoadingPrefs(false); }
    };
    loadPrefs();
  }, [user]);

  const addCat = () => {
    const v = catInput.trim();
    if (v && !cats.includes(v)) {
      setCats((p) => [...p, v]);
      setCatInput("");
    }
  };
  const removeCat = (c: string) => setCats((p) => p.filter((x) => x !== c));

  const save = async () => {
    setSaving(true);
    const prefs = { currency, cats, notifs };
    // Always persist to localStorage
    localStorage.setItem("subsight-settings", JSON.stringify(prefs));

    // Best-effort Supabase persist
    if (user) {
      try {
        const supabase = createClient();
        await supabase
          .from("profiles")
          .update({ preferences: prefs } as never)
          .eq("id", user.id);
      } catch { /* column may not exist that's fine */ }
    }

    await new Promise((r) => setTimeout(r, 220));
    setSaving(false);
    toast("Settings saved", "success");
  };

  const sel: React.CSSProperties = {
    background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 8,
    padding: "10px 13px", fontSize: 13, color: t.text,
    fontFamily: "var(--font-mono)", cursor: "pointer", outline: "none",
  };

  if (loadingPrefs) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 680 }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 22, height: 100,
            backgroundImage: `linear-gradient(90deg,${t.surface2} 25%,${t.surface3} 50%,${t.surface2} 75%)`,
            backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite linear" }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 680 }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: t.text, letterSpacing: -0.5 }}>
          Settings
        </h2>
        <p style={{ fontSize: 11.5, color: t.text3, fontFamily: "var(--font-mono)", marginTop: 3, lineHeight: 1.5 }}>
          Manage categories, currency, and notification preferences
        </p>
      </div>

      {/* Currency */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Globe size={14} color={t.green} aria-hidden="true" />
          <span style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "var(--font-display)" }}>
            Display Currency
          </span>
        </div>
        <p style={{ fontSize: 12, color: t.text3, fontFamily: "var(--font-mono)", marginBottom: 14, lineHeight: 1.5 }}>
          Choose your preferred currency for display across the app
        </p>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          aria-label="Display currency"
          style={{ ...sel, minWidth: 160 }}
        >
          {["USD","EUR","GBP","PKR","CAD","AUD","JPY","CHF","INR","SGD","AED"].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Custom categories */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Tag size={14} color={t.green} aria-hidden="true" />
          <span style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "var(--font-display)" }}>
            Custom Categories
          </span>
        </div>
        <p style={{ fontSize: 12, color: t.text3, fontFamily: "var(--font-mono)", marginBottom: 14, lineHeight: 1.5 }}>
          Create your own subscription categories alongside the defaults
        </p>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <input
            value={catInput}
            onChange={(e) => setCatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCat()}
            placeholder="Category name…"
            aria-label="New category name"
            style={{ ...sel, flex: 1 }}
          />
          <button
            onClick={addCat}
            aria-label="Add category"
            style={{
              background: t.green, color: "#000", border: "none", borderRadius: 8,
              padding: "10px 16px", fontSize: 13, fontWeight: 700,
              cursor: "pointer", fontFamily: "var(--font-display)",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <Plus size={13} aria-hidden="true" /> Add
          </button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {cats.map((c) => (
            <div
              key={c}
              style={{ display: "flex", alignItems: "center", gap: 6, background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 6, padding: "5px 10px" }}
            >
              <span style={{ fontSize: 12, color: t.text2, fontFamily: "var(--font-mono)" }}>{c}</span>
              <button
                onClick={() => removeCat(c)}
                aria-label={`Remove ${c} category`}
                style={{ background: "none", border: "none", cursor: "pointer", color: t.text3, padding: 1, display: "flex" }}
              >
                <X size={11} aria-hidden="true" />
              </button>
            </div>
          ))}
          {cats.length === 0 && (
            <span style={{ fontSize: 12, color: t.text3, fontFamily: "var(--font-mono)" }}>
              No custom categories yet
            </span>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Bell size={14} color={t.green} aria-hidden="true" />
          <span style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "var(--font-display)" }}>
            Notifications
          </span>
        </div>
        <p style={{ fontSize: 12, color: t.text3, fontFamily: "var(--font-mono)", marginBottom: 14, lineHeight: 1.5 }}>
          Control when and how you get notified
        </p>
        {([
          { key: "renewal" as const, label: "Renewal Alerts",  desc: "Get notified before a subscription renews" },
          { key: "weekly"  as const, label: "Weekly Summary",  desc: "Weekly email digest of your spending activity" },
          { key: "budget"  as const, label: "Budget Warnings", desc: "Alert when approaching your monthly spending goal" },
        ]).map((item, idx, arr) => (
          <div
            key={item.key}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 0",
              borderBottom: idx < arr.length - 1 ? `1px solid ${t.border}` : "none",
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.text, fontFamily: "var(--font-display)" }}>
                {item.label}
              </div>
              <div style={{ fontSize: 11, color: t.text3, fontFamily: "var(--font-mono)", marginTop: 2, lineHeight: 1.4 }}>
                {item.desc}
              </div>
            </div>
            <button
              onClick={() => setNotifs((p) => ({ ...p, [item.key]: !p[item.key] }))}
              aria-label={`${notifs[item.key] ? "Disable" : "Enable"} ${item.label}`}
              aria-pressed={notifs[item.key]}
              style={{ background: "none", border: "none", cursor: "pointer", color: notifs[item.key] ? t.green : t.text3, flexShrink: 0 }}
            >
              {notifs[item.key] ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
            </button>
          </div>
        ))}
      </div>

      {/* Save */}
      <button
        onClick={save}
        disabled={saving}
        style={{
          background: t.green, color: "#000", border: "none", borderRadius: 9, padding: 13,
          fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)",
          cursor: saving ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          opacity: saving ? 0.75 : 1, transition: "background 0.2s",
          boxShadow: `0 2px 10px ${t.green}44`,
        }}
        onMouseEnter={(e) => { if (!saving) (e.currentTarget as HTMLElement).style.background = t.green2; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = t.green; }}
      >
        {saving
          ? <><RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> Saving…</>
          : <><Save size={14} /> Save Settings</>
        }
      </button>
    </div>
  );
}
