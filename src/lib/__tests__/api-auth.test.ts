import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCreateClient = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}))

function buildMockSupabase(getUserResult: unknown) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue(getUserResult),
    },
  }
}

const verifiedUser = { id: 'user-1', email: 'test@example.com', email_confirmed_at: '2026-01-01T00:00:00Z' }

beforeEach(() => {
  vi.resetModules()
  vi.restoreAllMocks()
  mockCreateClient.mockReset()
})

describe('getAuthenticatedUser', () => {
  it('returns the user on success', async () => {
    mockCreateClient.mockResolvedValue(buildMockSupabase({ data: { user: verifiedUser }, error: null }))

    const { getAuthenticatedUser } = await import('../api-auth')
    const result = await getAuthenticatedUser()

    expect(result.status).toBeNull()
    expect(result.user).toEqual(verifiedUser)
  })

  it('returns 401 when there is no user', async () => {
    mockCreateClient.mockResolvedValue(buildMockSupabase({ data: { user: null }, error: null }))

    const { getAuthenticatedUser } = await import('../api-auth')
    const result = await getAuthenticatedUser()

    expect(result.status).toBe(401)
    expect(result.error).toBe('Unauthorized')
  })

  it('returns 403 when email is not verified', async () => {
    mockCreateClient.mockResolvedValue(
      buildMockSupabase({ data: { user: { ...verifiedUser, email_confirmed_at: null } }, error: null }),
    )

    const { getAuthenticatedUser } = await import('../api-auth')
    const result = await getAuthenticatedUser({ requireVerified: true })

    expect(result.status).toBe(403)
    expect(result.error).toBe('Email verification required')
  })

  it('returns 503 gracefully when Supabase is unreachable', async () => {
    const supabase = buildMockSupabase({ data: { user: null }, error: null })
    supabase.auth.getUser.mockRejectedValue(new Error('network down'))
    mockCreateClient.mockResolvedValue(supabase)

    const { getAuthenticatedUser } = await import('../api-auth')
    const result = await getAuthenticatedUser()

    expect(result.status).toBe(503)
    expect(result.error).toBe('Authentication service unavailable')
  })

  it('returns 503 gracefully when Supabase returns an error', async () => {
    mockCreateClient.mockResolvedValue(buildMockSupabase({ data: { user: null }, error: new Error('auth error') }))

    const { getAuthenticatedUser } = await import('../api-auth')
    const result = await getAuthenticatedUser()

    expect(result.status).toBe(503)
    expect(result.error).toBe('Authentication service unavailable')
  })
})