import { describe, it, expect } from 'vitest'
import { buildForecast, applyScenario, monthlyEquivalent } from '../plan-helpers'
import type { Sub } from '@/app/(app)/dashboard/dashboard-types'
import type { VaultItem } from '@/lib/types'

const sub = (over: Partial<Sub> = {}): Sub => ({
  id: 's1',
  name: 'Netflix',
  category: 'Streaming',
  amount: 10,
  cycle: 'monthly',
  nextDate: '2026-11-20',
  status: 'active',
  autoRenew: true,
  currency: 'USD',
  provider: '',
  notes: '',
  ...over,
})

const item = (over: Partial<VaultItem> = {}): VaultItem => ({
  id: 'v1',
  name: 'Groceries',
  category: 'Food',
  amount: 50,
  currency: 'USD',
  purchaseDate: '2026-11-05',
  notes: '',
  createdAt: '2026-11-05T00:00:00Z',
  ...over,
})

describe('plan helpers', () => {
  it('normalizes billing cycles to a monthly amount', () => {
    expect(monthlyEquivalent(sub({ amount: 120, cycle: 'annually' }))).toBe(10)
    expect(monthlyEquivalent(sub({ amount: 30, cycle: 'quarterly' }))).toBe(10)
  })

  it('combines normalized recurring spend with vault spend for the current month', () => {
    const forecast = buildForecast(
      [sub({ id: 's1', amount: 120, cycle: 'annually' }), sub({ id: 's2', amount: 10 })],
      [item()],
      0,
      new Date('2026-11-15T00:00:00Z'),
    )
    expect(forecast.monthlyRecurring).toBe(20)
    expect(forecast.vaultThisMonth).toBe(50)
    expect(forecast.combined).toBe(70)
  })

  it('ignores vault items from another month', () => {
    const forecast = buildForecast(
      [sub()],
      [item({ purchaseDate: '2026-10-05' })],
      0,
      new Date('2026-11-15T00:00:00Z'),
    )
    expect(forecast.vaultThisMonth).toBe(0)
  })

  it('reports remaining budget only when a budget is set', () => {
    const today = new Date('2026-11-15T00:00:00Z')
    expect(buildForecast([sub()], [], 0, today).remaining).toBeNull()
    expect(buildForecast([sub()], [], 40, today).remaining).toBe(30)
  })

  it('applies a scenario without mutating the input', () => {
    const subs = [sub({ id: 's1' }), sub({ id: 's2' })]
    const result = applyScenario(subs, ['s2'])
    expect(result.map((s) => s.id)).toEqual(['s1'])
    expect(subs.map((s) => s.id)).toEqual(['s1', 's2'])
  })
})
