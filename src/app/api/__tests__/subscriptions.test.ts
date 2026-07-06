import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockCreateClient = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}))

beforeEach(() => {
  vi.resetModules()
  vi.restoreAllMocks()
})

afterEach(() => {
  vi.clearAllMocks()
})

function verifiedUser(id = 'user-1') {
  return { id, email: 'test@example.com', email_confirmed_at: '2026-01-01T00:00:00Z' }
}

function buildMockSupabase(options: {
  user: { id: string; email_confirmed_at?: string | null } | null
  profileTier?: string
  subscriptionCount?: number
  insertError?: { message: string } | null
  existingSubscription?: { start_date: string; billing_cycle: string } | null
  deleteCount?: number
}) {
  const insert = vi.fn().mockResolvedValue({ error: options.insertError ?? null })
  const update = vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    }),
  })
  const deleteFn = vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null, count: options.deleteCount ?? 1 }),
    }),
  })

  const subscriptionsFrom = {
    select: vi.fn().mockImplementation((_: string, opts?: { count?: string; head?: boolean }) => {
      if (opts?.count === 'exact') {
        return {
          eq: vi.fn().mockResolvedValue({
            count: options.subscriptionCount ?? 0,
            error: null,
          }),
        }
      }
      return {
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: options.existingSubscription ?? { start_date: '2026-01-01', billing_cycle: 'monthly' },
              error: options.existingSubscription === null ? { code: 'PGRST116' } : null,
            }),
          }),
        }),
      }
    }),
    insert,
    update,
    delete: deleteFn,
  }

  const profilesFrom = {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { subscription_tier: options.profileTier ?? 'free' },
          error: null,
        }),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { subscription_tier: 'free' },
          error: null,
        }),
      }),
    }),
  }

  const from = vi.fn((table: string) => {
    if (table === 'profiles') return profilesFrom
    if (table === 'subscriptions') return subscriptionsFrom
    throw new Error(`Unexpected table: ${table}`)
  })

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: options.user } }),
    },
    from,
    insert,
    update,
    deleteFn,
  }
}

describe('Subscriptions API', () => {
  it('returns 401 when user is not authenticated', async () => {
    const supabase = buildMockSupabase({ user: null })
    mockCreateClient.mockResolvedValue(supabase)

    const { POST } = await import('../subscriptions/route')
    const req = new Request('https://example.com/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Netflix',
        amount: 15.99,
        billingCycle: 'monthly',
      }),
    })
    const response = await POST(req as any)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 403 when email is not verified', async () => {
    const supabase = buildMockSupabase({ user: { id: 'user-1', email_confirmed_at: null } })
    mockCreateClient.mockResolvedValue(supabase)

    const { POST } = await import('../subscriptions/route')
    const req = new Request('https://example.com/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Netflix',
        amount: 15.99,
        billingCycle: 'monthly',
      }),
    })
    const response = await POST(req as any)
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body.error).toBe('Email verification required')
  })

  it('returns 400 for invalid billing cycle', async () => {
    const supabase = buildMockSupabase({ user: verifiedUser() })
    mockCreateClient.mockResolvedValue(supabase)

    const { POST } = await import('../subscriptions/route')
    const req = new Request('https://example.com/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Netflix',
        amount: 15.99,
        billingCycle: 'invalid-cycle',
      }),
    })
    const response = await POST(req as any)

    expect(response.status).toBe(400)
  })

  it('returns 403 when free plan limit is reached', async () => {
    const supabase = buildMockSupabase({
      user: verifiedUser(),
      profileTier: 'free',
      subscriptionCount: 5,
    })
    mockCreateClient.mockResolvedValue(supabase)

    const { POST } = await import('../subscriptions/route')
    const req = new Request('https://example.com/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Spotify',
        amount: 9.99,
        billingCycle: 'monthly',
      }),
    })
    const response = await POST(req as any)
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body.error).toContain('Free plan limit reached')
  })

  it('creates subscription for authenticated user', async () => {
    const supabase = buildMockSupabase({
      user: verifiedUser(),
      profileTier: 'free',
      subscriptionCount: 2,
    })
    mockCreateClient.mockResolvedValue(supabase)

    const { POST } = await import('../subscriptions/route')
    const req = new Request('https://example.com/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Netflix',
        amount: 15.99,
        billingCycle: 'monthly',
        category: 'Streaming',
        provider: 'Netflix Inc.',
        currency: 'USD',
        autoRenew: true,
      }),
    })
    const response = await POST(req as any)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(supabase.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        name: 'Netflix',
        amount: 15.99,
        billing_cycle: 'monthly',
        active_status: true,
        status: 'active',
      }),
    )
  })

  it('updates subscription via PATCH', async () => {
    const supabase = buildMockSupabase({ user: verifiedUser() })
    mockCreateClient.mockResolvedValue(supabase)

    const { PATCH } = await import('../subscriptions/route')
    const req = new Request('https://example.com/api/subscriptions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: '00000000-0000-4000-8000-000000000001',
        name: 'Netflix Premium',
        activeStatus: false,
      }),
    })
    const response = await PATCH(req as any)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(supabase.update).toHaveBeenCalled()
  })

  it('deletes subscription via DELETE', async () => {
    const supabase = buildMockSupabase({ user: verifiedUser(), deleteCount: 1 })
    mockCreateClient.mockResolvedValue(supabase)

    const { DELETE } = await import('../subscriptions/route')
    const req = new Request(
      'https://example.com/api/subscriptions?id=00000000-0000-4000-8000-000000000001',
      { method: 'DELETE' },
    )
    const response = await DELETE(req as any)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(supabase.deleteFn).toHaveBeenCalled()
  })
})
