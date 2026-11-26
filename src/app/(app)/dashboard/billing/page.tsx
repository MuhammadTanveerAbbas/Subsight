"use client"

import { useEffect, useState } from "react"
import { useTheme } from "@/components/ThemeProvider"
import { DARK_TOKENS, LIGHT_TOKENS } from "@/lib/design-tokens"
import { CreditCard, CheckCircle, Loader2, XCircle } from "lucide-react"

type T = Record<string, string>

function useT(): T {
  const { theme } = useTheme()
  return theme === "dark" ? DARK_TOKENS : LIGHT_TOKENS
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg" style={{ background: "var(--surface2)" }}>{icon}</div>
      <div>
        <p className="m-0 font-sans text-xs" style={{ color: "var(--text3)" }}>{label}</p>
        <p className="m-0 font-display text-xl font-medium tabular-nums" style={{ color: "var(--text)" }}>{value}</p>
      </div>
    </div>
  )
}

export default function BillingPage() {
  const t = useT()
  const [loading, setLoading] = useState(true)

  useEffect(() => { setLoading(false) }, [])

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 size={24} className="animate-spin" style={{ color: "var(--text3)" }} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[800px] p-8">
      <div className="mb-6">
        <h1 className="m-0 font-display text-2xl font-medium" style={{ color: "var(--text)" }}>
          Plan and features
        </h1>
        <p className="m-0 mt-1 font-sans text-[13px]" style={{ color: "var(--text3)" }}>Every feature is included. No subscription required.</p>
      </div>

      <div className="billing-stat-grid mb-6 grid grid-cols-2 gap-3">
        <StatCard icon={<CreditCard size={16} strokeWidth={1.5} color="var(--green-ink)" />} label="Current plan" value="Free" />
        <StatCard icon={<CheckCircle size={16} strokeWidth={1.5} color="var(--green-ink)" />} label="Status" value="Active" />
      </div>

      <div className="mb-4 rounded-xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h2 className="m-0 font-display text-base font-medium" style={{ color: "var(--text)" }}>
          Everything included
        </h2>
        <p className="m-0 mb-4 mt-1 font-sans text-[13px]" style={{ color: "var(--text3)" }}>
          Every feature is available to all users at no cost.
        </p>
        <div className="flex flex-col gap-2">
          <FeatureRow enabled label="Unlimited subscriptions" />
          <FeatureRow enabled label="Full analytics dashboard" />
          <FeatureRow enabled label="AI spending insights" />
          <FeatureRow enabled label="AI auto-fill for subscription details" />
          <FeatureRow enabled label="Email renewal reminders" />
          <FeatureRow enabled label="Data export (CSV, JSON, PDF)" />
          <FeatureRow enabled label="Custom categories" />
          <FeatureRow enabled label="Multi-currency support" />
        </div>
      </div>

      <div className="rounded-xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h2 className="m-0 font-display text-base font-medium" style={{ color: "var(--text)" }}>
          About Subsight
        </h2>
        <p className="m-0 mt-2 font-sans text-[13px] leading-relaxed" style={{ color: "var(--text2)" }}>
          Subsight is a free subscription tracker that keeps recurring expenses in one place.
          Every feature is available to every user, with no card and no premium tiers.
        </p>
      </div>
    </div>
  )
}

function FeatureRow({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3">
      {enabled
        ? <CheckCircle size={16} strokeWidth={1.5} className="shrink-0" style={{ color: "var(--green-ink)" }} />
        : <XCircle size={16} strokeWidth={1.5} className="shrink-0" style={{ color: "var(--text3)" }} />
      }
      <span className="font-sans text-[13px]" style={{ color: enabled ? "var(--text)" : "var(--text3)" }}>{label}</span>
    </div>
  )
}
