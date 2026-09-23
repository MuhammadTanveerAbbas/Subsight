"use client";

import { useState, useEffect } from "react";
import {
  User, RefreshCw, Save, Shield, Lock, Globe, Bell, Sparkles,
  LogOut, Trash2, AlertTriangle, X, CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import type { T } from "@/app/(app)/dashboard/dashboard-constants";

export function ProfileView({
  t,
  toast,
}: {
  t: T;
  toast: (m: string, tp: "success" | "error" | "info") => void;
}) {
  const { user, updateProfile, deleteAccount } = useAuth();
  const [form, setForm]           = useState({ name: "", avatar: "" });
  const [email, setEmail]         = useState("");
  const [saving, setSaving]       = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting]   = useState(false);

  /* ── Load current profile data ──────────── */
  useEffect(() => {
    if (!user) return;
    setEmail(user.email ?? "");
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setForm({ name: data.full_name || "", avatar: data.avatar_url || "" });
        }
      });
  }, [user]);

  /* ── Save via auth context (refetches profile automatically) ── */
  const save = async () => {
    setSaving(true);
    try {
      await updateProfile({ full_name: form.name, avatar_url: form.avatar || undefined });
      toast("Profile updated", "success");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const iStyle: React.CSSProperties = {
    width: "100%", background: t.surface2, border: `1px solid ${t.border}`,
    borderRadius: 8, padding: "11px 13px", fontSize: 13, color: t.text,
    fontFamily: "var(--font-mono)", outline: "none", transition: "border-color 0.2s",
  };
  const lStyle: React.CSSProperties = {
    fontSize: 10.5, color: t.text3, fontFamily: "var(--font-mono)",
    letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 5, lineHeight: 1.5,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 640 }}>
      {/* Title */}
      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: t.text, letterSpacing: -0.5 }}>
          Profile
        </h2>
        <p style={{ fontSize: 11.5, color: t.text3, fontFamily: "var(--font-mono)", marginTop: 3, lineHeight: 1.5 }}>
          Manage your account information and security settings
        </p>
      </div>

      {/* Profile settings */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 26 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <User size={14} color={t.green} aria-hidden="true" />
          <span style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "var(--font-display)" }}>
            Profile Settings
          </span>
        </div>
        <p style={{ fontSize: 12, color: t.text3, fontFamily: "var(--font-mono)", marginBottom: 22, lineHeight: 1.5 }}>
          Update your display name and avatar
        </p>

        {/* Avatar preview */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: 13, background: t.greenDim, border: `1px solid ${t.greenBorder}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
            {form.avatar
              ? <img src={form.avatar} alt="Your avatar" style={{ width: 56, height: 56, objectFit: "cover" }} />
              : <span style={{ fontSize: 20, fontWeight: 700, color: t.green, fontFamily: "var(--font-display)" }}>
                  {(form.name || email || "U").charAt(0).toUpperCase()}
                </span>
            }
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: t.text }}>
              {form.name || "User"}
            </div>
            <div style={{ fontSize: 12, color: t.text3, fontFamily: "var(--font-mono)", marginTop: 2 }}>
              {email}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={lStyle} htmlFor="prof-name">Full Name</label>
            <input
              id="prof-name" value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Enter your full name"
              style={iStyle}
              onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = t.greenBorder)}
              onBlur={(e)  => ((e.target as HTMLInputElement).style.borderColor = t.border)}
            />
          </div>
          <div>
            <label style={lStyle} htmlFor="prof-avatar">Avatar URL (optional)</label>
            <input
              id="prof-avatar" value={form.avatar}
              onChange={(e) => setForm((p) => ({ ...p, avatar: e.target.value }))}
              placeholder="https://example.com/avatar.jpg"
              style={iStyle}
              onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = t.greenBorder)}
              onBlur={(e)  => ((e.target as HTMLInputElement).style.borderColor = t.border)}
            />
            <p style={{ fontSize: 10, color: t.text3, fontFamily: "var(--font-mono)", marginTop: 5, lineHeight: 1.4 }}>
              Provide a direct URL to your profile image
            </p>
          </div>
          <button
            onClick={save}
            disabled={saving}
            style={{
              background: t.green, color: "#000", border: "none", borderRadius: 8,
              padding: "12px 22px", fontSize: 13, fontWeight: 700,
              fontFamily: "var(--font-display)", cursor: saving ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 7, width: "fit-content",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => { if (!saving) (e.currentTarget as HTMLElement).style.background = t.green2; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = t.green; }}
          >
            {saving
              ? <><RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} /> Saving…</>
              : <><Save size={13} /> Save Changes</>
            }
          </button>
        </div>
      </div>

      {/* Plan info all features free */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: "20px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Sparkles size={14} color={t.green} aria-hidden="true" />
          <span style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "var(--font-display)" }}>
            Your Plan
          </span>
        </div>
        <div style={{ background: t.greenDim, border: `1px solid ${t.greenBorder}`, borderRadius: 10, padding: "13px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.green, boxShadow: `0 0 6px ${t.green}`, flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: t.green, fontFamily: "var(--font-display)" }}>
            All Features Included Free Forever
          </span>
        </div>
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            "Unlimited subscriptions",
            "AI-powered spending insights",
            "AI auto-fill for subscription details",
            "Full analytics dashboard",
            "Data export (CSV, JSON, PDF)",
          ].map((feat) => (
            <div key={feat} style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <CheckCircle2 size={13} color={t.green} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: t.text2, fontFamily: "var(--font-mono)" }}>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy & Security */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: "20px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Shield size={14} color={t.green} aria-hidden="true" />
          <span style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "var(--font-display)" }}>
            Privacy & Security
          </span>
        </div>
        {[
          { Icon: Shield,   label: "Data You Control",   desc: "Your data stays in your own Supabase database" },
          { Icon: Lock,     label: "Encrypted in Transit", desc: "All traffic encrypted via HTTPS/TLS" },
          { Icon: Globe,    label: "Supabase Hosted",     desc: "Backed by PostgreSQL with Row Level Security" },
          { Icon: Bell,     label: "Renewal Reminders",   desc: "Email reminders sent before subscriptions renew" },
          { Icon: Sparkles, label: "AI Analysis",         desc: "Spending summaries powered by Groq Llama 3.3" },
        ].map((item) => (
          <div
            key={item.label}
            style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: `1px solid ${t.border}` }}
          >
            <div style={{ width: 28, height: 28, borderRadius: 7, background: t.greenDim, border: `1px solid ${t.greenBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
              <item.Icon size={12} color={t.green} strokeWidth={1.5} aria-hidden="true" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.text, fontFamily: "var(--font-display)" }}>
                {item.label}
              </div>
              <div style={{ fontSize: 11, color: t.text3, fontFamily: "var(--font-mono)", marginTop: 2, lineHeight: 1.5 }}>
                {item.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Danger zone */}
      <div style={{ background: t.surface, border: `1px solid ${t.red}33`, borderRadius: 12, padding: "20px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <AlertTriangle size={14} color={t.red} aria-hidden="true" />
          <span style={{ fontSize: 14, fontWeight: 700, color: t.red, fontFamily: "var(--font-display)" }}>
            Danger Zone
          </span>
        </div>
        <p style={{ fontSize: 12, color: t.text3, fontFamily: "var(--font-mono)", marginBottom: 16, lineHeight: 1.5 }}>
          Permanently delete your account and all associated data. This cannot be undone.
        </p>
        <button
          onClick={() => { setConfirmText(""); setConfirmOpen(true); }}
          style={{
            background: t.redDim, color: t.red, border: `1px solid ${t.red}33`,
            borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 600,
            fontFamily: "var(--font-display)", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 7, transition: "background 0.15s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = `${t.red}22`)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = t.redDim)}
        >
          <Trash2 size={13} aria-hidden="true" /> Delete Account
        </button>
      </div>

      {/* Delete confirm modal */}
      {confirmOpen && (
        <div
          role="dialog" aria-modal="true" aria-labelledby="del-acct-title"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={() => setConfirmOpen(false)}
        >
          <div
            style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, padding: 28, maxWidth: 400, width: "90%", boxShadow: `0 8px 40px ${t.shadow}`, animation: "slideUp 0.18s ease" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <AlertTriangle size={16} color={t.red} />
                <span id="del-acct-title" style={{ fontSize: 16, fontWeight: 700, color: t.text, fontFamily: "var(--font-display)" }}>
                  Confirm Deletion
                </span>
              </div>
              <button onClick={() => setConfirmOpen(false)} aria-label="Cancel" style={{ background: "none", border: "none", cursor: "pointer", color: t.text3, padding: 4 }}>
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: 12, color: t.text3, fontFamily: "var(--font-mono)", marginBottom: 18, lineHeight: 1.6 }}>
              This will permanently delete your account, subscriptions, and all data. Type{" "}
              <span style={{ color: t.red, fontWeight: 700 }}>DELETE</span> below to confirm.
            </p>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              aria-label="Type DELETE to confirm account deletion"
              style={{
                width: "100%", background: t.surface2,
                border: `1px solid ${confirmText === "DELETE" ? t.red : t.border}`,
                borderRadius: 8, padding: "11px 13px",
                fontSize: 13, color: t.text, fontFamily: "var(--font-mono)", outline: "none",
                marginBottom: 16, boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setConfirmOpen(false)}
                style={{ flex: 1, background: t.surface2, color: t.text, border: `1px solid ${t.border}`, borderRadius: 8, padding: 11, fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setDeleting(true);
                  try { await deleteAccount(); window.location.href = "/"; }
                  catch { setDeleting(false); setConfirmOpen(false); }
                }}
                disabled={confirmText !== "DELETE" || deleting}
                style={{
                  flex: 1, background: t.red, color: "#fff", border: "none",
                  borderRadius: 8, padding: 11, fontSize: 13, fontWeight: 700,
                  fontFamily: "var(--font-display)", cursor: confirmText !== "DELETE" || deleting ? "not-allowed" : "pointer",
                  opacity: confirmText !== "DELETE" || deleting ? 0.5 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                {deleting
                  ? <><RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} /> Deleting…</>
                  : <><Trash2 size={13} /> Delete Forever</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign out */}
      <button
        onClick={signOut}
        style={{
          background: t.surface2, color: t.text2, border: `1px solid ${t.border2}`,
          borderRadius: 9, padding: 13, fontSize: 13, fontWeight: 600,
          fontFamily: "var(--font-display)", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = t.redDim; (e.currentTarget as HTMLElement).style.color = t.red; (e.currentTarget as HTMLElement).style.borderColor = `${t.red}44`; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = t.surface2; (e.currentTarget as HTMLElement).style.color = t.text2; (e.currentTarget as HTMLElement).style.borderColor = t.border2; }}
      >
        <LogOut size={13} aria-hidden="true" /> Sign Out
      </button>
    </div>
  );
}
