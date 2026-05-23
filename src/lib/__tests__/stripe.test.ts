import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockStripeConstructor = vi.fn()

vi.mock('stripe', () => ({
  default: mockStripeConstructor,
}))

beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
  delete process.env.STRIPE_SECRET_KEY
})

afterEach(() => {
  delete process.env.STRIPE_SECRET_KEY
})

describe('getStripe', () => {
  it('returns a Stripe instance with valid key', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_abc123'
    mockStripeConstructor.mockReturnValue({ test: 'stripe-instance' })

    const { getStripe } = await import('../stripe')
    const stripe = getStripe()

    expect(stripe).toEqual({ test: 'stripe-instance' })
    expect(mockStripeConstructor).toHaveBeenCalledWith('sk_test_abc123', {
      apiVersion: '2025-02-24.acacia',
    })
  })

  it('throws if STRIPE_SECRET_KEY is not set', async () => {
    const { getStripe } = await import('../stripe')

    expect(() => getStripe()).toThrow('STRIPE_SECRET_KEY is not set')
  })

  it('throws if STRIPE_SECRET_KEY is empty string', async () => {
    process.env.STRIPE_SECRET_KEY = ''
    const { getStripe } = await import('../stripe')

    expect(() => getStripe()).toThrow('STRIPE_SECRET_KEY is not set')
  })

  it('returns singleton instance on second call', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_abc123'
    mockStripeConstructor.mockReturnValue({ singleton: true })

    const { getStripe } = await import('../stripe')
    const first = getStripe()
    const second = getStripe()

    expect(first).toBe(second)
    expect(mockStripeConstructor).toHaveBeenCalledTimes(1)
  })

  it('passes correct apiVersion to Stripe constructor', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_xyz'
    mockStripeConstructor.mockReturnValue({})

    const { getStripe } = await import('../stripe')
    getStripe()

    expect(mockStripeConstructor).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ apiVersion: '2025-02-24.acacia' }),
    )
  })
})
