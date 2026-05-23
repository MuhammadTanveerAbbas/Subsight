import { describe, it, expect } from 'vitest'
import { buildMonthlyData, buildCatData } from '../chart-helpers'
import type { Sub } from '@/app/(app)/dashboard/dashboard-types'

const activeMonthly: Sub = {
  id: '1',
  name: 'Netflix',
  category: 'streaming',
  amount: 15.99,
  cycle: 'Monthly',
  nextDate: '2025-01-15',
  status: 'active',
  autoRenew: true,
  currency: 'USD',
  provider: 'Netflix Inc.',
  notes: '',
}

const activeAnnual: Sub = {
  id: '2',
  name: 'Spotify',
  category: 'music',
  amount: 120,
  cycle: 'Annually',
  nextDate: '2025-06-01',
  status: 'active',
  autoRenew: true,
  currency: 'USD',
  provider: 'Spotify AB',
  notes: '',
}

const inactiveSub: Sub = {
  id: '3',
  name: 'Old Service',
  category: 'software',
  amount: 9.99,
  cycle: 'Monthly',
  nextDate: '2024-12-01',
  status: 'inactive',
  autoRenew: false,
  currency: 'USD',
  provider: 'Old Inc.',
  notes: '',
}

const quarterlySub: Sub = {
  id: '4',
  name: 'Quarterly Box',
  category: 'shopping',
  amount: 60,
  cycle: 'Quarterly',
  nextDate: '2025-03-01',
  status: 'active',
  autoRenew: true,
  currency: 'USD',
  provider: 'Box Co.',
  notes: '',
}

const dailySub: Sub = {
  id: '5',
  name: 'Daily Tip',
  category: 'news',
  amount: 0.5,
  cycle: 'Daily',
  nextDate: '2025-01-01',
  status: 'active',
  autoRenew: true,
  currency: 'USD',
  provider: 'News Co.',
  notes: '',
}

const weeklySub: Sub = {
  id: '6',
  name: 'Weekly Digest',
  category: 'news',
  amount: 4.99,
  cycle: 'Weekly',
  nextDate: '2025-01-06',
  status: 'active',
  autoRenew: true,
  currency: 'USD',
  provider: 'Digest Inc.',
  notes: '',
}

describe('buildMonthlyData', () => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ]

  it('returns 12 months', () => {
    const result = buildMonthlyData([activeMonthly])
    expect(result).toHaveLength(12)
  })

  it('returns correct month labels', () => {
    const result = buildMonthlyData([activeMonthly])
    result.forEach((item, i) => {
      expect(item.month).toBe(months[i])
    })
  })

  it('includes full amount for monthly subscriptions', () => {
    const result = buildMonthlyData([activeMonthly])
    result.forEach((item) => {
      expect(item.spend).toBe(15.99)
    })
  })

  it('normalizes annual subscriptions to monthly', () => {
    const result = buildMonthlyData([activeAnnual])
    const expectedMonthly = Math.round((120 / 12) * 100) / 100
    result.forEach((item) => {
      expect(item.spend).toBe(expectedMonthly)
    })
  })

  it('normalizes quarterly subscriptions to monthly', () => {
    const result = buildMonthlyData([quarterlySub])
    const expectedMonthly = Math.round((60 / 3) * 100) / 100
    result.forEach((item) => {
      expect(item.spend).toBe(expectedMonthly)
    })
  })

  it('includes daily subscriptions as full amount', () => {
    const result = buildMonthlyData([dailySub])
    result.forEach((item) => {
      expect(item.spend).toBe(0.5)
    })
  })

  it('includes weekly subscriptions as full amount', () => {
    const result = buildMonthlyData([weeklySub])
    result.forEach((item) => {
      expect(item.spend).toBe(4.99)
    })
  })

  it('excludes inactive subscriptions', () => {
    const result = buildMonthlyData([activeMonthly, inactiveSub])
    result.forEach((item) => {
      expect(item.spend).toBe(15.99)
    })
  })

  it('handles empty subscriptions array', () => {
    const result = buildMonthlyData([])
    expect(result).toHaveLength(12)
    result.forEach((item) => {
      expect(item.spend).toBe(0)
    })
  })

  it('combines multiple active subscriptions', () => {
    const result = buildMonthlyData([activeMonthly, dailySub])
    const expected = Math.round((15.99 + 0.5) * 100) / 100
    result.forEach((item) => {
      expect(item.spend).toBe(expected)
    })
  })

  it('returns rounded spend to 2 decimals', () => {
    const sub: Sub = {
      ...activeMonthly,
      amount: 10.333,
    }
    const result = buildMonthlyData([sub])
    result.forEach((item) => {
      expect(item.spend).toBe(10.33)
    })
  })

  it('handles single subscription', () => {
    const result = buildMonthlyData([activeMonthly])
    result.forEach((item) => {
      expect(item.spend).toBe(15.99)
    })
  })

  it('handles annual billing cycle normalization', () => {
    const annualAmount = 240
    const sub: Sub = {
      ...activeAnnual,
      amount: annualAmount,
    }
    const result = buildMonthlyData([sub])
    const expectedMonthly = Math.round((annualAmount / 12) * 100) / 100
    result.forEach((item) => {
      expect(item.spend).toBe(expectedMonthly)
    })
  })

  it('handles all active subs with different cycles', () => {
    const result = buildMonthlyData([activeMonthly, activeAnnual, quarterlySub, dailySub, weeklySub])
    const expectedMonthly = Math.round((
      15.99 + (120 / 12) + (60 / 3) + 0.5 + 4.99
    ) * 100) / 100
    result.forEach((item) => {
      expect(item.spend).toBe(expectedMonthly)
    })
  })
})

describe('buildCatData', () => {
  it('returns empty array for no active subscriptions', () => {
    const result = buildCatData([inactiveSub])
    expect(result).toEqual([])
  })

  it('returns empty array for empty input', () => {
    const result = buildCatData([])
    expect(result).toEqual([])
  })

  it('returns 100% for single category', () => {
    const result = buildCatData([activeMonthly])
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('streaming')
    expect(result[0]!.value).toBe(100)
  })

  it('returns correct percentage for multiple categories', () => {
    const result = buildCatData([activeMonthly, activeAnnual])
    const total = 15.99 + 120
    const streamingPct = Math.round((15.99 / total) * 100)
    const musicPct = Math.round((120 / total) * 100)
    const streaming = result.find((c) => c.name === 'streaming')
    const music = result.find((c) => c.name === 'music')
    expect(streaming?.value).toBe(streamingPct)
    expect(music?.value).toBe(musicPct)
  })

  it('sorts categories by value descending', () => {
    const result = buildCatData([activeMonthly, activeAnnual])
    expect(result[0]!.value).toBeGreaterThanOrEqual(result[1]!.value)
  })

  it('limits to top 8 categories', () => {
    const manyCats = Array.from({ length: 12 }, (_, i) => ({
      ...activeMonthly,
      id: `cat-${i}`,
      category: `category-${i}`,
      amount: 10 + i,
    }))
    const result = buildCatData(manyCats)
    expect(result.length).toBeLessThanOrEqual(8)
  })

  it('uses "Other" for subscriptions with no category', () => {
    const sub: Sub = {
      ...activeMonthly,
      category: '',
    }
    const result = buildCatData([sub])
    expect(result[0]!.name).toBe('Other')
  })

  it('excludes inactive subscriptions from calculation', () => {
    const result = buildCatData([activeMonthly, inactiveSub])
    expect(result).toHaveLength(1)
    expect(result[0]!.value).toBe(100)
  })

  it('assigns colors from the palette', () => {
    const result = buildCatData([activeMonthly, activeAnnual])
    result.forEach((cat) => {
      expect(cat.color).toMatch(/^#[0-9a-f]{6}$/)
    })
  })

  it('recycles colors if more than 8 categories', () => {
    const manyCats = Array.from({ length: 10 }, (_, i) => ({
      ...activeMonthly,
      id: `cat-${i}`,
      category: `category-${i}`,
      amount: 10,
    }))
    const result = buildCatData(manyCats)
    expect(result[0]!.color).toBe('#22c55e')
    expect(result[8]).toBeUndefined()
  })

  it('handles single subscription with existing category', () => {
    const result = buildCatData([activeMonthly])
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      name: 'streaming',
      value: 100,
      color: '#22c55e',
    })
  })
})
