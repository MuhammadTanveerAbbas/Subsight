import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

beforeEach(() => {
  vi.resetModules()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('rateLimit', () => {
  it('allows requests under the limit', async () => {
    const { rateLimit } = await import('../rate-limit')
    for (let i = 0; i < 5; i++) {
      expect(rateLimit('test-key')).toBe(true)
    }
  })

  it('allows requests up to the limit', async () => {
    const { rateLimit } = await import('../rate-limit')
    for (let i = 0; i < 5; i++) {
      expect(rateLimit('test-key', 5, 60000)).toBe(true)
    }
  })

  it('blocks requests over the limit', async () => {
    const { rateLimit } = await import('../rate-limit')
    for (let i = 0; i < 5; i++) {
      rateLimit('test-key', 5, 60000)
    }
    expect(rateLimit('test-key', 5, 60000)).toBe(false)
  })

  it('resets after window expires', async () => {
    const { rateLimit } = await import('../rate-limit')

    for (let i = 0; i < 5; i++) {
      rateLimit('test-key', 5, 60000)
    }
    expect(rateLimit('test-key', 5, 60000)).toBe(false)

    vi.advanceTimersByTime(60001)
    expect(rateLimit('test-key', 5, 60000)).toBe(true)
  })

  it('tracks different keys independently', async () => {
    const { rateLimit } = await import('../rate-limit')

    for (let i = 0; i < 5; i++) {
      rateLimit('key-a', 5, 60000)
    }
    expect(rateLimit('key-a', 5, 60000)).toBe(false)

    for (let i = 0; i < 5; i++) {
      expect(rateLimit('key-b', 5, 60000)).toBe(true)
    }
    expect(rateLimit('key-b', 5, 60000)).toBe(false)
  })

  it('uses default limit of 5 when not specified', async () => {
    const { rateLimit } = await import('../rate-limit')

    for (let i = 0; i < 5; i++) {
      rateLimit('default-key')
    }
    expect(rateLimit('default-key')).toBe(false)
  })

  it('uses default window of 60000ms when not specified', async () => {
    const { rateLimit } = await import('../rate-limit')

    for (let i = 0; i < 5; i++) {
      rateLimit('window-key')
    }
    expect(rateLimit('window-key')).toBe(false)

    vi.advanceTimersByTime(60001)
    expect(rateLimit('window-key')).toBe(true)
  })

  it('accepts custom limit parameter', async () => {
    const { rateLimit } = await import('../rate-limit')

    for (let i = 0; i < 3; i++) {
      expect(rateLimit('custom-limit', 3, 60000)).toBe(true)
    }
    expect(rateLimit('custom-limit', 3, 60000)).toBe(false)
  })

  it('accepts custom window parameter', async () => {
    const { rateLimit } = await import('../rate-limit')

    for (let i = 0; i < 5; i++) {
      rateLimit('custom-window', 5, 10000)
    }
    expect(rateLimit('custom-window', 5, 10000)).toBe(false)

    vi.advanceTimersByTime(10001)
    expect(rateLimit('custom-window', 5, 10000)).toBe(true)
  })

  it('allows request again after partial window expiry', async () => {
    const { rateLimit } = await import('../rate-limit')

    rateLimit('partial-key', 2, 60000)
    rateLimit('partial-key', 2, 60000)
    expect(rateLimit('partial-key', 2, 60000)).toBe(false)

    vi.advanceTimersByTime(30000)
    expect(rateLimit('partial-key', 2, 60000)).toBe(false)

    vi.advanceTimersByTime(30001)
    expect(rateLimit('partial-key', 2, 60000)).toBe(true)
  })

  it('handles rapid consecutive calls correctly', async () => {
    const { rateLimit } = await import('../rate-limit')
    const results = Array.from({ length: 7 }, () => rateLimit('rapid-key', 5, 60000))
    expect(results.filter(Boolean)).toHaveLength(5)
    expect(results.filter((r) => !r)).toHaveLength(2)
  })
})
