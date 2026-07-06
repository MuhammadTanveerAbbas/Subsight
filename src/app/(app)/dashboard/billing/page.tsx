"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/components/ThemeProvider"
import { DARK_TOKENS, LIGHT_TOKENS } from "@/lib/design-tokens"
import { CreditCard, ExternalLink, CheckCircle, XCircle, AlertTriangle, Loader2, ArrowRight } from "lucide-react"

type T = Record<string, string>

function useT(): T {
  const { theme } = useTheme()
  return theme === "dark" ? DARK_TOKENS : LIGHT_TOKENS
}

function StatCard({ icon, label, value, cssVar }: { icon: React.ReactNode; label: string; value: string; cssVar: string }) {
  return (
    <div className="flex items-center gap-3.5 rounded-xl p-[18px_20px]" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg" style={{ background: `color-mix(in srgb, ${cssVar} 8%, transparent)` }}>{icon}</div>
      <div>
        <p className="m-0 mb-0.5 font-mono text-[11px]" style={{ color: "var(--text3)" }}>{label}</p>
        <p className="m-0 font-display text-lg font-bold" style={{ color: "var(--text)" }}>{value}</p>
      </div>
    </div>
  )
}

export default function BillingPage() {
  const t = useT()
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
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 size={24} className="animate-spin" style={{ color: "var(--text3)" }} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[800px] p-[28px_32px]">
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      <div className="mb-7">
        <h1 className="m-0 mb-1.5 font-display text-[26px] font-extrabold tracking-tight" style={{ color: "var(--text)" }}>
          Billing
        </h1>
        <p className="m-0 font-mono text-[13px]" style={{ color: "var(--text3)" }}>Manage your subscription and billing information</p>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3.5">
        <StatCard icon={<CreditCard size={18} color="var(--green)" />} label="Current Plan" value={isPro ? "Pro" : "Free"} cssVar="var(--green)" />
        <StatCard icon={isPro ? <CheckCircle size={18} color="var(--green)" /> : <XCircle size={18} color="var(--text3)" />}
          label="Status" value={status === "active" ? "Active" : status === "past_due" ? "Past Due" : status === "canceled" ? "Canceled" : "Inactive"}
          cssVar={status === "active" ? "var(--green)" : status === "past_due" ? "var(--amber)" : "var(--text3)"} />
        {isPro && (
          <StatCard icon={<AlertTriangle size={18} color="var(--amber)" />} label="Current Period Ends" value={periodEnd || "N/A"} cssVar="var(--amber)" />
        )}
      </div>

      <div className="mb-5 rounded-xl p-[24px_28px]" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h2 className="m-0 mb-4 font-display text-base font-bold" style={{ color: "var(--text)" }}>
          {isPro ? "Pro Plan" : "Free Plan"}
        </h2>
        <div className="mb-5 flex flex-col gap-2.5">
          <FeatureRow enabled label="Up to 5 subscriptions" />
          <FeatureRow enabled label="Basic analytics" />
          <FeatureRow enabled={isPro} label="Unlimited subscriptions" />
          <FeatureRow enabled={isPro} label="AI-powered insights" />
          <FeatureRow enabled={isPro} label="Email reminders" />
          <FeatureRow enabled={isPro} label="Data export (CSV, JSON, PDF)" />
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg p-[10px_14px] font-mono text-[12px]" style={{ background: "var(--red-dim)", border: "1px solid color-mix(in srgb, var(--red) 27%, transparent)", color: "var(--red)" }}>{error}</div>
        )}

        <div className="flex gap-2.5">
          {isPro ? (
            <button onClick={managePortal} disabled={portalLoading}
              className="flex items-center gap-1.5 rounded-lg border-none px-5 py-3 text-[13px] font-bold transition-all duration-200"
              style={{ background: "var(--green)", color: "#000", cursor: portalLoading ? "not-allowed" : "pointer", opacity: portalLoading ? 0.75 : 1 }}>
              {portalLoading ? <><Loader2 size={14} className="animate-spin" /> Loading…</> : <><ExternalLink size={14} /> Manage Billing</>}
            </button>
          ) : (
            <a href="/pricing"
              className="inline-flex items-center gap-1.5 rounded-lg border-none px-5 py-3 text-[13px] font-bold no-underline"
              style={{ background: "var(--green)", color: "#000", cursor: "pointer" }}>
              Upgrade to Pro <ArrowRight size={14} />
            </a>
          )}
        </div>
      </div>

      {isPro && (
        <div className="rounded-xl p-[24px_28px]" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h2 className="m-0 mb-3 font-display text-base font-bold" style={{ color: "var(--text)" }}>
            Need Help?
          </h2>
          <p className="m-0 font-mono text-[13px] leading-relaxed" style={{ color: "var(--text2)" }}>
            Visit the Stripe Customer Portal to update your payment method, view invoices, or cancel your subscription.
            Your data is safe and will remain accessible until the end of your billing period.
          </p>
        </div>
      )}
    </div>
  )
}

function FeatureRow({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      {enabled
        ? <CheckCircle size={14} className="shrink-0" style={{ color: "var(--green)" }} />
        : <XCircle size={14} className="shrink-0" style={{ color: "var(--text3)" }} />
      }
      <span className="font-mono text-[13px]" style={{ color: enabled ? "var(--text)" : "var(--text3)" }}>{label}</span>
    </div>
  )
}
