import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockCreateClient = vi.fn()
const mockGetStripe = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}))

vi.mock('@/lib/stripe', () => ({
  getStripe: mockGetStripe,
}))

beforeEach(() => {
  vi.resetModules()
  vi.restoreAllMocks()
  process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'
  process.env.STRIPE_PRICE_ID = 'price_test123'
})

afterEach(() => {
  delete process.env.NEXT_PUBLIC_APP_URL
  delete process.env.STRIPE_PRICE_ID
})

function buildMockSupabase(authResult: { data: { user: { id: string; email: string; email_confirmed_at?: string } | null } }) {
  const queryBuilder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    update: vi.fn().mockReturnThis(),
  }
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue(authResult),
    },
    from: vi.fn().mockReturnValue(queryBuilder),
    queryBuilder,
  }
}

function buildMockStripeInstance(mockSessionUrl: string) {
  return {
    customers: {
      create: vi.fn(),
    },
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
    mockSessionUrl,
  }
}

describe('Checkout endpoint', () => {
  it('returns 401 when user is not authenticated', async () => {
    const supabase = buildMockSupabase({ data: { user: null } })
    mockCreateClient.mockResolvedValue(supabase)
    mockGetStripe.mockReturnValue(buildMockStripeInstance('https://checkout.stripe.com/test'))

    const { POST } = await import('../stripe/checkout/route')
    const req = new Request('https://example.com/api/stripe/checkout', { method: 'POST' })
    const response = await POST(req as any)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error).toBe('Unauthorized')
  })

  it('returns rate limit error when exceeded', async () => {
    const user = { id: 'user-1', email: 'test@example.com', email_confirmed_at: '2026-01-01T00:00:00Z' }
    const supabase = buildMockSupabase({ data: { user } })
    supabase.queryBuilder.single.mockResolvedValue({
      data: { stripe_customer_id: 'cus_existing' },
    })
    supabase.from.mockReturnValue(supabase.queryBuilder)

    const mockStripeInstance = buildMockStripeInstance('https://checkout.stripe.com/test')
    mockStripeInstance.checkout.sessions.create.mockResolvedValue({
      url: 'https://checkout.stripe.com/test',
    })
    mockCreateClient.mockResolvedValue(supabase)
    mockGetStripe.mockReturnValue(mockStripeInstance)

    const { POST } = await import('../stripe/checkout/route')
    const req = new Request('https://example.com/api/stripe/checkout', { method: 'POST' })

    for (let i = 0; i < 10; i++) {
      await POST(req as any)
    }

    const response = await POST(req as any)
    const body = await response.json()

    expect(response.status).toBe(429)
    expect(body.error).toBe('Rate limit exceeded')
  })

  it('creates checkout session with new customer', async () => {
    const user = { id: 'user-new', email: 'new@example.com', email_confirmed_at: '2026-01-01T00:00:00Z' }
    const supabase = buildMockSupabase({ data: { user } })
    supabase.queryBuilder.single.mockResolvedValue({
      data: { stripe_customer_id: null },
    })

    const mockFrom = vi.fn().mockReturnValue(supabase.queryBuilder)
    supabase.from = mockFrom

    const mockUpdateChain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    }
    supabase.queryBuilder.single.mockResolvedValue({
      data: { stripe_customer_id: null },
    })

    const mockStripeInstance = buildMockStripeInstance('https://checkout.stripe.com/session_123')
    mockStripeInstance.customers.create.mockResolvedValue({ id: 'cus_new123' })
    mockStripeInstance.checkout.sessions.create.mockResolvedValue({
      url: 'https://checkout.stripe.com/session_123',
    })

    mockCreateClient.mockResolvedValue(supabase)
    mockGetStripe.mockReturnValue(mockStripeInstance)

    const { POST } = await import('../stripe/checkout/route')
    const req = new Request('https://example.com/api/stripe/checkout', { method: 'POST' })
    const response = await POST(req as any)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.url).toBe('https://checkout.stripe.com/session_123')
    expect(mockStripeInstance.customers.create).toHaveBeenCalledWith({
      email: 'new@example.com',
      metadata: { supabase_user_id: 'user-new' },
    })
    expect(mockStripeInstance.checkout.sessions.create).toHaveBeenCalled()
  })

  it('creates checkout session with existing customer', async () => {
    const user = { id: 'user-existing', email: 'existing@example.com', email_confirmed_at: '2026-01-01T00:00:00Z' }
    const supabase = buildMockSupabase({ data: { user } })

    const queryBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { stripe_customer_id: 'cus_existing' },
      }),
    }
    supabase.from = vi.fn().mockReturnValue(queryBuilder)
    supabase.auth.getUser = vi.fn().mockResolvedValue({ data: { user } })

    const mockStripeInstance = buildMockStripeInstance('https://checkout.stripe.com/session_456')
    mockStripeInstance.checkout.sessions.create.mockResolvedValue({
      url: 'https://checkout.stripe.com/session_456',
    })

    mockCreateClient.mockResolvedValue(supabase)
    mockGetStripe.mockReturnValue(mockStripeInstance)

    const { POST } = await import('../stripe/checkout/route')
    const req = new Request('https://example.com/api/stripe/checkout', { method: 'POST' })
    const response = await POST(req as any)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.url).toBe('https://checkout.stripe.com/session_456')
    expect(mockStripeInstance.customers.create).not.toHaveBeenCalled()
    expect(mockStripeInstance.checkout.sessions.create).toHaveBeenCalledWith({
      customer: 'cus_existing',
      mode: 'subscription',
      line_items: [{ price: 'price_test123', quantity: 1 }],
      client_reference_id: 'user-existing',
      success_url: 'https://example.com/dashboard?upgraded=true',
      cancel_url: 'https://example.com/pricing?canceled=true',
      metadata: { user_id: 'user-existing' },
    })
  })

  it('returns 500 when Stripe session creation fails', async () => {
    const user = { id: 'user-fail', email: 'fail@example.com', email_confirmed_at: '2026-01-01T00:00:00Z' }
    const supabase = buildMockSupabase({ data: { user } })

    const queryBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { stripe_customer_id: 'cus_fail' },
      }),
    }
    supabase.from = vi.fn().mockReturnValue(queryBuilder)
    supabase.auth.getUser = vi.fn().mockResolvedValue({ data: { user } })

    const mockStripeInstance = buildMockStripeInstance('')
    mockStripeInstance.checkout.sessions.create.mockRejectedValue(
      new Error('Stripe API error'),
    )

    mockCreateClient.mockResolvedValue(supabase)
    mockGetStripe.mockReturnValue(mockStripeInstance)

    const { POST } = await import('../stripe/checkout/route')
    const req = new Request('https://example.com/api/stripe/checkout', { method: 'POST' })
    const response = await POST(req as any)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toBe('Failed to create checkout session')
  })

  it('throws error when NEXT_PUBLIC_APP_URL is not set', async () => {
    delete process.env.NEXT_PUBLIC_APP_URL

    const user = { id: 'user-no-url', email: 'nourl@example.com', email_confirmed_at: '2026-01-01T00:00:00Z' }
    const supabase = buildMockSupabase({ data: { user } })

    const queryBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { stripe_customer_id: 'cus_nourl' },
      }),
    }
    supabase.from = vi.fn().mockReturnValue(queryBuilder)
    supabase.auth.getUser = vi.fn().mockResolvedValue({ data: { user } })

    const mockStripeInstance = buildMockStripeInstance('')
    mockCreateClient.mockResolvedValue(supabase)
    mockGetStripe.mockReturnValue(mockStripeInstance)

    const { POST } = await import('../stripe/checkout/route')
    const req = new Request('https://example.com/api/stripe/checkout', { method: 'POST' })
    const response = await POST(req as any)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toBe('Failed to create checkout session')
  })

  it('rate limit resets after window expires', async () => {
    vi.useFakeTimers()

    const user = { id: 'user-rate-reset', email: 'reset@example.com', email_confirmed_at: '2026-01-01T00:00:00Z' }
    const supabase = buildMockSupabase({ data: { user } })
    supabase.queryBuilder.single.mockResolvedValue({
      data: { stripe_customer_id: 'cus_reset' },
    })
    supabase.from.mockReturnValue(supabase.queryBuilder)

    const mockStripeInstance = buildMockStripeInstance('https://checkout.stripe.com/reset')
    mockStripeInstance.checkout.sessions.create.mockResolvedValue({
      url: 'https://checkout.stripe.com/reset',
    })
    mockCreateClient.mockResolvedValue(supabase)
    mockGetStripe.mockReturnValue(mockStripeInstance)

    const { POST } = await import('../stripe/checkout/route')
    const req = new Request('https://example.com/api/stripe/checkout', { method: 'POST' })

    for (let i = 0; i < 10; i++) {
      await POST(req as any)
    }

    let response = await POST(req as any)
    expect(response.status).toBe(429)

    vi.advanceTimersByTime(60001)

    response = await POST(req as any)
    const body = await response.json()
    expect(response.status).toBe(200)
    expect(body.url).toBe('https://checkout.stripe.com/reset')

    vi.useRealTimers()
  })
})
