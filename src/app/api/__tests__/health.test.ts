import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCreateClient = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}))

beforeEach(() => {
  vi.clearAllMocks()
})

function buildMockSupabase(overrides: Record<string, unknown> = {}) {
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ error: null, data: [{ id: 'test' }], ...overrides }),
      }),
    }),
  }
}

describe('Health endpoint', () => {
  it('returns 200 with status ok when DB is connected', async () => {
    const mockSupabase = buildMockSupabase()
    mockCreateClient.mockResolvedValue(mockSupabase)

    const { GET } = await import('../health/route')
    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.status).toBe('ok')
    expect(body.database).toBe('connected')
  })

  it('returns 503 when DB is unreachable', async () => {
    const mockSupabase = buildMockSupabase()
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ error: new Error('Connection failed'), data: null }),
      }),
    })
    mockCreateClient.mockResolvedValue(mockSupabase)

    const { GET } = await import('../health/route')
    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(503)
    expect(body.status).toBe('degraded')
    expect(body.database).toBe('unreachable')
  })

  it('has correct response shape', async () => {
    const mockSupabase = buildMockSupabase()
    mockCreateClient.mockResolvedValue(mockSupabase)

    const { GET } = await import('../health/route')
    const response = await GET()
    const body = await response.json()

    expect(body).toHaveProperty('status')
    expect(body).toHaveProperty('database')
    expect(body).toHaveProperty('timestamp')
    expect(body).toHaveProperty('version', '3.0.0')
  })

  it('has valid ISO timestamp', async () => {
    const mockSupabase = buildMockSupabase()
    mockCreateClient.mockResolvedValue(mockSupabase)

    const { GET } = await import('../health/route')
    const response = await GET()
    const body = await response.json()

    expect(() => new Date(body.timestamp)).not.toThrow()
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp)
  })

  it('returns 500 when createClient throws', async () => {
    mockCreateClient.mockRejectedValue(new Error('Unexpected error'))

    const { GET } = await import('../health/route')
    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.status).toBe('error')
    expect(body.timestamp).toBeDefined()
  })

  it('returns 503 with correct status when error has no data', async () => {
    const mockSupabase = buildMockSupabase()
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ error: { message: 'timeout' }, data: null }),
      }),
    })
    mockCreateClient.mockResolvedValue(mockSupabase)

    const { GET } = await import('../health/route')
    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(503)
    expect(body.status).toBe('degraded')
    expect(body.database).toBe('unreachable')
    expect(body.timestamp).toBeDefined()
  })
})
