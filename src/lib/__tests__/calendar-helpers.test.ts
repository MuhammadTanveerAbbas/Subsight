import { describe, it, expect } from 'vitest'
import { buildMonthGrid } from '../calendar-helpers'
import type { Sub } from '@/app/(app)/dashboard/dashboard-types'

const sub = (over: Partial<Sub> = {}): Sub => ({
  id: 's1',
  name: 'Netflix',
  category: 'Streaming',
  amount: 15.99,
  cycle: 'monthly',
  nextDate: '2026-11-15',
  status: 'active',
  autoRenew: true,
  currency: 'USD',
  provider: '',
  notes: '',
  ...over,
})

describe('buildMonthGrid', () => {
  it('places a renewal on its day cell', () => {
    const cells = buildMonthGrid([sub()], 2026, 10)
    const day15 = cells.find((cell) => cell.day === 15 && cell.inMonth)
    expect(day15?.renewals.map((s) => s.name)).toEqual(['Netflix'])
    expect(cells.find((cell) => cell.day === 16)?.renewals).toEqual([])
  })

  it('marks days outside the requested month', () => {
    const cells = buildMonthGrid([], 2026, 10)
    expect(cells.some((cell) => !cell.inMonth)).toBe(true)
  })
})
