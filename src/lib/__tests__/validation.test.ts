import { describe, it, expect } from 'vitest'
import {
  subscriptionImportSchema,
  validateImportData,
  sanitizeSubscriptionData,
} from '../validation'
import { BILLING_CYCLES, CURRENCIES } from '../types'

const validSubscription = {
  name: 'Netflix',
  provider: 'Netflix Inc.',
  category: 'streaming',
  icon: 'streaming',
  startDate: '2025-01-01T00:00:00.000Z',
  billingCycle: 'monthly' as const,
  amount: 15.99,
  currency: 'USD' as const,
  notes: 'Family plan',
  activeStatus: true,
  autoRenew: true,
}

describe('subscriptionImportSchema', () => {
  it('validates correct data', () => {
    const result = subscriptionImportSchema.safeParse(validSubscription)
    expect(result.success).toBe(true)
  })

  it('rejects missing name', () => {
    const { name, ...rest } = validSubscription
    const result = subscriptionImportSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('rejects missing provider', () => {
    const { provider, ...rest } = validSubscription
    const result = subscriptionImportSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('rejects missing category', () => {
    const { category, ...rest } = validSubscription
    const result = subscriptionImportSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('rejects missing amount', () => {
    const { amount, ...rest } = validSubscription
    const result = subscriptionImportSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('rejects invalid billing cycle', () => {
    const result = subscriptionImportSchema.safeParse({
      ...validSubscription,
      billingCycle: 'biweekly',
    })
    expect(result.success).toBe(false)
  })

  it('rejects amount exceeding maximum', () => {
    const result = subscriptionImportSchema.safeParse({
      ...validSubscription,
      amount: 1_000_000,
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative amount', () => {
    const result = subscriptionImportSchema.safeParse({
      ...validSubscription,
      amount: -10,
    })
    expect(result.success).toBe(false)
  })

  it('rejects name exceeding 100 characters', () => {
    const result = subscriptionImportSchema.safeParse({
      ...validSubscription,
      name: 'A'.repeat(101),
    })
    expect(result.success).toBe(false)
  })

  it('accepts name of exactly 100 characters', () => {
    const result = subscriptionImportSchema.safeParse({
      ...validSubscription,
      name: 'A'.repeat(100),
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid icon', () => {
    const result = subscriptionImportSchema.safeParse({
      ...validSubscription,
      icon: 'nonexistent',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid currency', () => {
    const result = subscriptionImportSchema.safeParse({
      ...validSubscription,
      currency: 'XYZ',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid startDate format', () => {
    const result = subscriptionImportSchema.safeParse({
      ...validSubscription,
      startDate: 'not-a-date',
    })
    expect(result.success).toBe(false)
  })

  it('accepts optional id as valid UUID', () => {
    const result = subscriptionImportSchema.safeParse({
      ...validSubscription,
      id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid UUID', () => {
    const result = subscriptionImportSchema.safeParse({
      ...validSubscription,
      id: 'not-a-uuid',
    })
    expect(result.success).toBe(false)
  })
})

describe('validateImportData', () => {
  it('returns success with valid array', () => {
    const result = validateImportData([validSubscription])
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data!).toHaveLength(1)
      expect(result.data![0]!.name).toBe('Netflix')
    }
  })

  it('returns success with multiple valid subscriptions', () => {
    const result = validateImportData([validSubscription, validSubscription])
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data!).toHaveLength(2)
    }
  })

  it('returns error with invalid data', () => {
    const result = validateImportData([{ name: 'incomplete' }])
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBeTruthy()
      expect(typeof result.error).toBe('string')
    }
  })

  it('returns error with non-array input', () => {
    const result = validateImportData({ not: 'an array' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('Expected array')
    }
  })

  it('returns error with null input', () => {
    const result = validateImportData(null)
    expect(result.success).toBe(false)
  })

  it('returns error with undefined input', () => {
    const result = validateImportData(undefined)
    expect(result.success).toBe(false)
  })

  it('rejects array exceeding max length of 1000', () => {
    const largeArray = Array.from({ length: 1001 }, () => ({ ...validSubscription }))
    const result = validateImportData(largeArray)
    expect(result.success).toBe(false)
  })

  it('accepts array of exactly 1000 items', () => {
    const largeArray = Array.from({ length: 1000 }, () => ({ ...validSubscription }))
    const result = validateImportData(largeArray)
    expect(result.success).toBe(true)
  })

  it('returns error for empty name in array', () => {
    const result = validateImportData([{ ...validSubscription, name: '' }])
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('name')
    }
  })

  it('returns error for zero amount', () => {
    const result = validateImportData([{ ...validSubscription, amount: 0 }])
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('amount')
    }
  })
})

describe('sanitizeSubscriptionData', () => {
  it('escapes HTML in name', () => {
    const result = sanitizeSubscriptionData({
      ...validSubscription,
      name: '<script>alert("xss")</script>',
    })
    expect(result.name).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
  })

  it('escapes HTML in provider', () => {
    const result = sanitizeSubscriptionData({
      ...validSubscription,
      provider: '<b>Provider</b>',
    })
    expect(result.provider).toBe('&lt;b&gt;Provider&lt;/b&gt;')
  })

  it('escapes HTML in category', () => {
    const result = sanitizeSubscriptionData({
      ...validSubscription,
      category: '<script>evil()</script>',
    })
    expect(result.category).toBe('&lt;script&gt;evil()&lt;/script&gt;')
  })

  it('escapes HTML in notes', () => {
    const result = sanitizeSubscriptionData({
      ...validSubscription,
      notes: 'Hello <world> & "friends"',
    })
    expect(result.notes).toBe('Hello &lt;world&gt; &amp; &quot;friends&quot;')
  })

  it('trims whitespace from name', () => {
    const result = sanitizeSubscriptionData({
      ...validSubscription,
      name: '  Spotify  ',
    })
    expect(result.name).toBe('Spotify')
  })

  it('trims whitespace from provider', () => {
    const result = sanitizeSubscriptionData({
      ...validSubscription,
      provider: '  Spotify AB  ',
    })
    expect(result.provider).toBe('Spotify AB')
  })

  it('sanitizes amount to positive number capped at 999999', () => {
    const result = sanitizeSubscriptionData({
      ...validSubscription,
      amount: 1_500_000,
    })
    expect(result.amount).toBe(999999)
  })

  it('sanitizes negative amount to absolute value', () => {
    const result = sanitizeSubscriptionData({
      ...validSubscription,
      amount: -50,
    })
    expect(result.amount).toBe(50)
  })

  it('handles missing name gracefully', () => {
    const { name, ...rest } = validSubscription
    const result = sanitizeSubscriptionData(rest)
    expect(result.name).toBe('')
  })

  it('handles null data gracefully', () => {
    const result = sanitizeSubscriptionData(null)
    expect(result.name).toBe('')
    expect(result.provider).toBe('')
    expect(result.category).toBe('')
    expect(result.notes).toBe('')
    expect(result.amount).toBe(0)
  })

  it('handles undefined data gracefully', () => {
    const result = sanitizeSubscriptionData(undefined)
    expect(result.name).toBe('')
    expect(result.provider).toBe('')
    expect(result.category).toBe('')
    expect(result.notes).toBe('')
    expect(result.amount).toBe(0)
  })

  it('preserves non-string fields', () => {
    const result = sanitizeSubscriptionData(validSubscription)
    expect(result.activeStatus).toBe(true)
    expect(result.autoRenew).toBe(true)
    expect(result.billingCycle).toBe('monthly')
  })

  it('truncates name to 100 characters', () => {
    const longName = 'A'.repeat(150)
    const result = sanitizeSubscriptionData({
      ...validSubscription,
      name: longName,
    })
    expect(result.name).toBe('A'.repeat(100))
  })

  it('truncates notes to 500 characters', () => {
    const longNotes = 'A'.repeat(600)
    const result = sanitizeSubscriptionData({
      ...validSubscription,
      notes: longNotes,
    })
    expect(result.notes).toBe('A'.repeat(500))
  })
})
