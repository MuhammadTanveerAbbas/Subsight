import type { Sub } from '@/app/(app)/dashboard/dashboard-types'
import type { VaultItem } from '@/lib/types'

export interface PriceChange {
  name: string
  oldAmount: number
  newAmount: number
  currency: string
  recordedAt: string
}

export interface Forecast {
  monthlyRecurring: number
  vaultThisMonth: number
  combined: number
  remaining: number | null
  series: { month: string; value: number }[]
  priceChanges: PriceChange[]
  plannedCancellations: Sub[]
}

const round2 = (value: number): number => Math.round(value * 100) / 100

export function monthlyEquivalent(sub: Sub): number {
  switch (sub.cycle.toLowerCase()) {
    case 'daily': return sub.amount * 30
    case 'weekly': return sub.amount * 4.33
    case 'monthly': return sub.amount
    case 'quarterly': return sub.amount / 3
    case 'annually':
    case 'yearly': return sub.amount / 12
    case 'one-time': return 0
    default: return sub.amount
  }
}

export function applyScenario(subs: Sub[], excludedIds: string[]): Sub[] {
  const excluded = new Set(excludedIds)
  return subs.filter((sub) => !excluded.has(sub.id))
}

export function buildForecast(
  subs: Sub[],
  vault: VaultItem[],
  budget: number,
  today: Date = new Date(),
): Forecast {
  const active = subs.filter((sub) => sub.status === 'active')
  const monthlyRecurring = round2(
    active.reduce((total, sub) => total + monthlyEquivalent(sub), 0),
  )
  const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  const vaultThisMonth = round2(
    vault
      .filter((item) => item.purchaseDate.startsWith(monthKey))
      .reduce((total, item) => total + item.amount, 0),
  )
  const combined = round2(monthlyRecurring + vaultThisMonth)

  const series = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() + index, 1)
    const month = date.toLocaleString('en-US', { month: 'short' })
    return { month, value: combined }
  })

  const priceChanges: PriceChange[] = active.flatMap((sub) =>
    (sub.priceHistory ?? []).map((point) => ({
      name: sub.name,
      oldAmount: round2(Number(point.amount)),
      newAmount: round2(sub.amount),
      currency: point.currency || sub.currency,
      recordedAt: point.recordedAt,
    })),
  )

  return {
    monthlyRecurring,
    vaultThisMonth,
    combined,
    remaining: budget > 0 ? round2(budget - combined) : null,
    series,
    priceChanges,
    plannedCancellations: active.filter((sub) => sub.cancelState === 'planned'),
  }
}
