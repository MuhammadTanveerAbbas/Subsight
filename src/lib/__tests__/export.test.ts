import { describe, it, expect } from 'vitest'
import {
  escapeCSVValue,
  subscriptionsToJSON,
  subscriptionsToCSV,
} from '../export'

const sample = [
  {
    name: 'Netflix',
    category: 'Streaming',
    amount: 15.99,
    currency: 'USD',
    cycle: 'monthly',
    nextDate: '2026-08-01',
    status: 'active',
    autoRenew: true,
    provider: 'Netflix Inc.',
  },
  {
    name: 'Service, "Special"',
    category: 'Other',
    amount: 9,
    currency: 'USD',
    cycle: 'yearly',
    status: 'inactive',
    autoRenew: false,
    provider: 'Acme\nCorp',
  },
]

describe('export utilities', () => {
  it('escapes CSV values with commas, quotes, and newlines', () => {
    expect(escapeCSVValue('plain')).toBe('plain')
    expect(escapeCSVValue('a,b')).toBe('"a,b"')
    expect(escapeCSVValue('say "hi"')).toBe('"say ""hi"""')
    expect(escapeCSVValue('line\nbreak')).toBe('"line\nbreak"')
  })

  it('serializes subscriptions to JSON', () => {
    const json = subscriptionsToJSON(sample)
    expect(JSON.parse(json)).toEqual(sample)
  })

  it('serializes subscriptions to CSV with BOM and headers', () => {
    const csv = subscriptionsToCSV(sample)
    expect(csv.startsWith('\uFEFF')).toBe(true)
    expect(csv).toContain('Name,Category,Amount')
    expect(csv).toContain('"Service, ""Special"""')
    expect(csv).toContain('"Acme\nCorp"')
  })
})
