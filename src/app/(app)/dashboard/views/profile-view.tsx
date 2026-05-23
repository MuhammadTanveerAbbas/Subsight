"use client";

import { useState, useEffect } from "react";
import {
  User, RefreshCw, Save, Zap, Shield, Lock, Globe, Bell, Sparkles, LogOut, Trash2, AlertTriangle, X,
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
  const [form, setForm] = useState({ name: "", email: "", avatar: "" });
  const [saving, setSaving] = useState(false);
  const [plan, setPlan] = useState<"free" | "pro">("free");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const { deleteAccount } = useAuth();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setForm((p) => ({ ...p, email: user.email || "" }));
      supabase
        .from("profiles")
        .select("full_name, avatar_url, subscription_tier")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setForm((p) => ({
              ...p,
              name: data.full_name || "",
              avatar: data.avatar_url || "",
            }));
            setPlan(data.subscription_tier === "pro" ? "pro" : "free");
          }
        });
    });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: form.name, avatar_url: form.avatar || null })
        .eq("id", user.id);
      if (error) throw error;
      toast("Profile updated", "success");
    } catch (err: any) {
      toast(err.message || "Failed to update profile", "error");
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
    width: "100%",
    background: t.surface2,
    border: `1px solid ${t.border}`,
    borderRadius: 8,
    padding: "11px 13px",
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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 18,
        maxWidth: 640,
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
          Profile
        </h2>
        <p
          style={{
            fontSize: 11.5,
            color: t.text3,
            fontFamily: "var(--font-mono)",
            marginTop: 3,
          }}
        >
          Manage your account information
        </p>
      </div>
      <div
        style={{
          background: t.surface,
          border: `1px solid ${t.border}`,
          borderRadius: 12,
          padding: "26px",
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
          <User size={14} color={t.green} />
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: t.text,
              fontFamily: "var(--font-display)",
            }}
          >
            Profile Settings
          </span>
        </div>
        <p
          style={{
            fontSize: 12,
            color: t.text3,
            fontFamily: "var(--font-mono)",
            marginBottom: 22,
          }}
        >
          Update your profile information
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 13,
              background: t.greenDim,
              border: `1px solid ${t.greenBorder}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            {form.avatar ? (
              <img
                src={form.avatar}
                alt="avatar"
                style={{ width: 56, height: 56, objectFit: "cover" }}
              />
            ) : (
              <User size={22} color={t.green} />
            )}
          </div>
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 16,
                fontWeight: 700,
                color: t.text,
              }}
            >
              {form.name || "User"}
            </div>
            <div
              style={{
                fontSize: 12,
                color: t.text3,
                fontFamily: "var(--font-mono)",
                marginTop: 2,
              }}
            >
              {form.email}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={lStyle}>Full Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Enter your full name"
              style={iStyle}
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
            <label style={lStyle}>Avatar URL (optional)</label>
            <input
              value={form.avatar}
              onChange={(e) =>
                setForm((p) => ({ ...p, avatar: e.target.value }))
              }
              placeholder="https://example.com/avatar.jpg"
              style={iStyle}
              onFocus={(e) =>
                ((e.target as HTMLInputElement).style.borderColor =
                  t.greenBorder)
              }
              onBlur={(e) =>
                ((e.target as HTMLInputElement).style.borderColor = t.border)
              }
            />
            <p
              style={{
                fontSize: 10,
                color: t.text3,
                fontFamily: "var(--font-mono)",
                marginTop: 5,
              }}
            >
              Provide a URL to your profile picture
            </p>
          </div>
          <button
            onClick={save}
            disabled={saving}
            style={{
              background: t.green,
              color: "#000",
              border: "none",
              borderRadius: 8,
              padding: "12px 22px",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              cursor: saving ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 7,
              width: "fit-content",
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
            marginBottom: 16,
          }}
        >
          <Zap size={14} color={t.green} />
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: t.text,
              fontFamily: "var(--font-display)",
            }}
          >
            Subscription Plan
          </span>
        </div>
        <div
          style={{
            background: t.surface2,
            border: `1px solid ${t.border}`,
            borderRadius: 10,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Zap size={13} color={plan === "pro" ? t.green : t.text3} />
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: t.text,
              fontFamily: "var(--font-display)",
            }}
          >
            {plan === "pro" ? "Pro Plan" : "Free Plan"}
          </span>
          <span
            style={{
              fontSize: 10,
              color: plan === "pro" ? t.green : t.text3,
              background: plan === "pro" ? t.greenDim : t.surface3,
              border: `1px solid ${plan === "pro" ? t.greenBorder : t.border}`,
              borderRadius: 4,
              padding: "2px 8px",
              fontFamily: "var(--font-mono)",
              marginLeft: "auto",
            }}
          >
            {plan === "pro" ? "Active" : "Free"}
          </span>
        </div>
        {plan === "free" && (
          <p
            style={{
              fontSize: 12,
              color: t.text3,
              fontFamily: "var(--font-mono)",
              marginTop: 10,
            }}
          >
            Upgrade to Pro for unlimited subscriptions, AI summaries, and email
            reminders.{" "}
            <a
              href="/pricing"
              style={{ color: t.green, textDecoration: "none" }}
            >
              View plans
            </a>
          </p>
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
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <Shield size={14} color={t.green} />
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: t.text,
              fontFamily: "var(--font-display)",
            }}
          >
            Privacy & Security
          </span>
        </div>
        {[
          {
            Icon: Lock,
            label: "End to End Encrypted",
            desc: "Your data is encrypted in transit and at rest",
          },
          {
            Icon: Shield,
            label: "No Third Party Sharing",
            desc: "We never sell or share your data",
          },
          {
            Icon: Globe,
            label: "Supabase Powered",
            desc: "Enterprise grade security with PostgreSQL",
          },
          {
            Icon: Bell,
            label: "Smart Reminders",
            desc: "Never miss a subscription renewal again",
          },
          {
            Icon: Sparkles,
            label: "AI Powered Insights",
            desc: "Real-time analysis powered by Groq",
          },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "11px 0",
              borderBottom: `1px solid ${t.border}`,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                background: t.greenDim,
                border: `1px solid ${t.greenBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: 1,
              }}
            >
              <item.Icon size={12} color={t.green} strokeWidth={1.5} />
            </div>
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
          </div>
        ))}
      </div>
      <div
        style={{
          background: t.surface,
          border: `1px solid ${t.red}33`,
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
          <AlertTriangle size={14} color={t.red} />
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: t.red,
              fontFamily: "var(--font-display)",
            }}
          >
            Danger Zone
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
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </p>
        <button
          onClick={() => {
            setConfirmText("");
            setConfirmOpen(true);
          }}
          style={{
            background: t.redDim,
            color: t.red,
            border: `1px solid ${t.red}33`,
            borderRadius: 8,
            padding: "11px 20px",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "var(--font-display)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 7,
            width: "fit-content",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.background = `${t.red}22`)
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.background = t.redDim)
          }
        >
          <Trash2 size={13} /> Delete Account
        </button>
      </div>

      {confirmOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setConfirmOpen(false)}
        >
          <div
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: 14,
              padding: "28px",
              maxWidth: 400,
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <AlertTriangle size={16} color={t.red} />
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: t.text,
                    fontFamily: "var(--font-display)",
                  }}
                >
                  Confirm Deletion
                </span>
              </div>
              <button
                onClick={() => setConfirmOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: t.text3,
                  padding: 0,
                }}
              >
                <X size={18} />
              </button>
            </div>
            <p
              style={{
                fontSize: 12,
                color: t.text3,
                fontFamily: "var(--font-mono)",
                marginBottom: 18,
                lineHeight: 1.5,
              }}
            >
              This will permanently delete your account, subscriptions, and all
              associated data. To confirm, type{" "}
              <span
                style={{
                  color: t.red,
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                }}
              >
                DELETE
              </span>{" "}
              below.
            </p>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              style={{
                width: "100%",
                background: t.surface2,
                border: `1px solid ${confirmText === "DELETE" ? t.red : t.border}`,
                borderRadius: 8,
                padding: "11px 13px",
                fontSize: 13,
                color: t.text,
                fontFamily: "var(--font-mono)",
                outline: "none",
                marginBottom: 16,
                boxSizing: "border-box",
              }}
              onFocus={(e) =>
                ((e.target as HTMLInputElement).style.borderColor = t.red)
              }
              onBlur={(e) =>
                ((e.target as HTMLInputElement).style.borderColor =
                  confirmText === "DELETE" ? t.red : t.border)
              }
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setConfirmOpen(false)}
                style={{
                  flex: 1,
                  background: t.surface2,
                  color: t.text,
                  border: `1px solid ${t.border}`,
                  borderRadius: 8,
                  padding: "11px",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "var(--font-display)",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setDeleting(true);
                  try {
                    await deleteAccount();
                    window.location.href = "/";
                  } catch {
                    setDeleting(false);
                    setConfirmOpen(false);
                  }
                }}
                disabled={confirmText !== "DELETE" || deleting}
                style={{
                  flex: 1,
                  background: t.red,
                  color: "#000",
                  border: "none",
                  borderRadius: 8,
                  padding: "11px",
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "var(--font-display)",
                  cursor:
                    confirmText !== "DELETE" || deleting
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    confirmText !== "DELETE" || deleting ? 0.5 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {deleting ? (
                  <>
                    <RefreshCw
                      size={13}
                      style={{ animation: "spin 1s linear infinite" }}
                    />{" "}
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={13} /> Delete Forever
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={signOut}
        style={{
          background: t.redDim,
          color: t.red,
          border: `1px solid ${t.red}33`,
          borderRadius: 9,
          padding: "13px",
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "var(--font-display)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.background = `${t.red}22`)
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.background = t.redDim)
        }
      >
        <LogOut size={13} /> Sign Out
      </button>
    </div>
  );
}
