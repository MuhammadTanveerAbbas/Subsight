"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/components/ThemeProvider"
import { CreditCard, ExternalLink, CheckCircle, XCircle, AlertTriangle, Loader2, ArrowRight } from "lucide-react"

const DARK = {
  bg: "#080808", surface: "#111111", surface2: "#181818", surface3: "#1e1e1e",
  border: "#1f1f1f", border2: "#2a2a2a",
  text: "#f0f0f0", text2: "#a0a0a0", text3: "#585858",
  green: "#22c55e", green2: "#16a34a",
  greenDim: "rgba(34,197,94,0.08)", greenBorder: "rgba(34,197,94,0.22)",
  red: "#ef4444", redDim: "rgba(239,68,68,0.10)",
  amber: "#f59e0b", amberDim: "rgba(245,158,11,0.10)",
  blue: "#3b82f6", blueDim: "rgba(59,130,246,0.10)",
  shadow: "rgba(0,0,0,0.70)",
}
const LIGHT = {
  bg: "#f8f8f6", surface: "#ffffff", surface2: "#f2f2ef", surface3: "#eaeae6",
  border: "#e4e4e0", border2: "#d0d0ca",
  text: "#111111", text2: "#545450", text3: "#888880",
  green: "#16a34a", green2: "#15803d",
  greenDim: "rgba(22,163,74,0.08)", greenBorder: "rgba(22,163,74,0.22)",
  red: "#dc2626", redDim: "rgba(220,38,38,0.10)",
  amber: "#d97706", amberDim: "rgba(217,119,6,0.10)",
  blue: "#2563eb", blueDim: "rgba(37,99,235,0.10)",
  shadow: "rgba(0,0,0,0.12)",
}
type T = typeof DARK | typeof LIGHT

function StatCard({ t, icon, label, value, color }: { t: T; icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
      <div>
        <p style={{ fontSize: 11, color: t.text3, fontFamily: "var(--font-mono)", margin: 0, marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 18, fontWeight: 700, color: t.text, fontFamily: "var(--font-display)", margin: 0 }}>{value}</p>
      </div>
    </div>
  )
}

export default function BillingPage() {
  const { theme } = useTheme()
  const t = theme === "dark" ? DARK : LIGHT
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isPro = profile?.subscription_tier === "pro"
  const status = profile?.subscription_status
  const periodEnd = profile?.current_period_end
    ? new Date(profile.current_period_end).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      })
    : null

  const managePortal = async () => {
    setPortalLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else throw new Error(data.error || "Failed to open portal")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to open billing portal")
    } finally {
      setPortalLoading(false)
    }
  }

  useEffect(() => { setLoading(false) }, [])

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
        <Loader2 size={24} style={{ animation: "spin 1s linear infinite", color: t.text3 }} />
      </div>
    )
  }

  return (
    <div style={{ padding: "28px 32px", maxWidth: 800, margin: "0 auto" }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: t.text, letterSpacing: -0.5, margin: 0, marginBottom: 6 }}>
          Billing
        </h1>
        <p style={{ fontSize: 13, color: t.text3, fontFamily: "var(--font-mono)", margin: 0 }}>Manage your subscription and billing information</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 28 }}>
        <StatCard t={t} icon={<CreditCard size={18} color={t.green} />} label="Current Plan" value={isPro ? "Pro" : "Free"} color={t.green} />
        <StatCard t={t} icon={isPro ? <CheckCircle size={18} color={t.green} /> : <XCircle size={18} color={t.text3} />}
          label="Status" value={status === "active" ? "Active" : status === "past_due" ? "Past Due" : status === "canceled" ? "Canceled" : "Inactive"}
          color={status === "active" ? t.green : status === "past_due" ? t.amber : t.text3} />
        {isPro && (
          <StatCard t={t} icon={<AlertTriangle size={18} color={t.amber} />} label="Current Period Ends" value={periodEnd || "N/A"} color={t.amber} />
        )}
      </div>

      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: "24px 28px", marginBottom: 20 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: t.text, margin: 0, marginBottom: 16 }}>
          {isPro ? "Pro Plan" : "Free Plan"}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          <FeatureRow t={t} enabled label="Up to 5 subscriptions" />
          <FeatureRow t={t} enabled label="Basic analytics" />
          <FeatureRow t={t} enabled={isPro} label="Unlimited subscriptions" />
          <FeatureRow t={t} enabled={isPro} label="AI-powered insights" />
          <FeatureRow t={t} enabled={isPro} label="Email reminders" />
          <FeatureRow t={t} enabled={isPro} label="Data export (CSV, JSON, PDF)" />
        </div>

        {error && (
          <div style={{ background: t.redDim, border: `1px solid ${t.red}44`, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: t.red, fontFamily: "var(--font-mono)", marginBottom: 16 }}>{error}</div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          {isPro ? (
            <button onClick={managePortal} disabled={portalLoading}
              style={{ background: t.green, color: "#000", border: "none", borderRadius: 9, padding: "12px 20px", fontSize: 13, fontWeight: 700, cursor: portalLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 7, opacity: portalLoading ? 0.75 : 1 }}>
              {portalLoading ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Loading…</> : <><ExternalLink size={14} /> Manage Billing</>}
            </button>
          ) : (
            <a href="/pricing"
              style={{ background: t.green, color: "#000", border: "none", borderRadius: 9, padding: "12px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7, textDecoration: "none" }}>
              Upgrade to Pro <ArrowRight size={14} />
            </a>
          )}
        </div>
      </div>

      {isPro && (
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: "24px 28px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: t.text, margin: 0, marginBottom: 12 }}>
            Need Help?
          </h2>
          <p style={{ fontSize: 13, color: t.text2, fontFamily: "var(--font-mono)", lineHeight: 1.65, margin: 0 }}>
            Visit the Stripe Customer Portal to update your payment method, view invoices, or cancel your subscription.
            Your data is safe and will remain accessible until the end of your billing period.
          </p>
        </div>
      )}
    </div>
  )
}

function FeatureRow({ t, enabled, label }: { t: T; enabled: boolean; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {enabled
        ? <CheckCircle size={14} color={t.green} style={{ flexShrink: 0 }} />
        : <XCircle size={14} color={t.text3} style={{ flexShrink: 0 }} />
      }
      <span style={{ fontSize: 13, color: enabled ? t.text : t.text3, fontFamily: "var(--font-mono)" }}>{label}</span>
    </div>
  )
}
