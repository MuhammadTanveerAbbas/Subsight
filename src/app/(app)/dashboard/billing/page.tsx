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
    <div className="mx-auto max-w-[800px] p-[28px_32px]">
      <div className="mb-7">
        <h1 className="m-0 mb-1.5 font-display text-[26px] font-extrabold tracking-tight" style={{ color: "var(--text)" }}>
          Plan & Features
        </h1>
        <p className="m-0 font-mono text-[13px]" style={{ color: "var(--text3)" }}>All features are included no subscription required</p>
      </div>

      <div className="billing-stat-grid mb-7 grid grid-cols-2 gap-3.5">
        <StatCard icon={<CreditCard size={18} color="var(--green)" />} label="Current Plan" value="Free" cssVar="var(--green)" />
        <StatCard icon={<CheckCircle size={18} color="var(--green)" />} label="Status" value="Active" cssVar="var(--green)" />
      </div>

      <div className="mb-5 rounded-xl p-[24px_28px]" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h2 className="m-0 mb-1 font-display text-base font-bold" style={{ color: "var(--text)" }}>
          Everything Included
        </h2>
        <p className="m-0 mb-5 font-mono text-[12px]" style={{ color: "var(--text3)" }}>
          Every feature is available to all users, free of charge.
        </p>
        <div className="flex flex-col gap-2.5">
          <FeatureRow enabled label="Unlimited subscriptions" />
          <FeatureRow enabled label="Full analytics dashboard" />
          <FeatureRow enabled label="AI-powered spending insights" />
          <FeatureRow enabled label="AI auto-fill for subscription details" />
          <FeatureRow enabled label="Email renewal reminders" />
          <FeatureRow enabled label="Data export (CSV, JSON, PDF)" />
          <FeatureRow enabled label="Custom categories" />
          <FeatureRow enabled label="Multi-currency support" />
        </div>
      </div>

      <div className="rounded-xl p-[24px_28px]" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h2 className="m-0 mb-3 font-display text-base font-bold" style={{ color: "var(--text)" }}>
          About Subsight
        </h2>
        <p className="m-0 font-mono text-[13px] leading-relaxed" style={{ color: "var(--text2)" }}>
          Subsight is a free subscription tracker that helps you stay on top of your recurring expenses.
          All features are unlocked for every user no credit card needed, no premium tiers.
        </p>
      </div>
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
