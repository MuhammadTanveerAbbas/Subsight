import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { checkRateLimit } from '../rate-limit'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('checkRateLimit', () => {
  it('allows requests under the limit', async () => {
    for (let i = 0; i < 5; i++) {
      const result = await checkRateLimit('test-a', 5, 60000)
      expect(result.success).toBe(true)
    }
  })

  it('allows requests up to the limit', async () => {
    for (let i = 0; i < 5; i++) {
      const result = await checkRateLimit('test-b', 5, 60000)
      expect(result.success).toBe(true)
    }
  })

  it('blocks requests over the limit', async () => {
    for (let i = 0; i < 5; i++) {
      await checkRateLimit('test-c', 5, 60000)
    }
    const result = await checkRateLimit('test-c', 5, 60000)
    expect(result.success).toBe(false)
  })

  it('resets after window expires', async () => {
    for (let i = 0; i < 5; i++) {
      await checkRateLimit('test-d', 5, 60000)
    }
    const blocked = await checkRateLimit('test-d', 5, 60000)
    expect(blocked.success).toBe(false)

    vi.advanceTimersByTime(60001)
    const allowed = await checkRateLimit('test-d', 5, 60000)
    expect(allowed.success).toBe(true)
  })

  it('tracks different keys independently', async () => {
    for (let i = 0; i < 5; i++) {
      await checkRateLimit('key-a', 5, 60000)
    }
    const aBlocked = await checkRateLimit('key-a', 5, 60000)
    expect(aBlocked.success).toBe(false)

    for (let i = 0; i < 5; i++) {
      const result = await checkRateLimit('key-b', 5, 60000)
      expect(result.success).toBe(true)
    }
    const bBlocked = await checkRateLimit('key-b', 5, 60000)
    expect(bBlocked.success).toBe(false)
  })

  it('uses default limit of 5 when not specified', async () => {
    for (let i = 0; i < 5; i++) {
      const result = await checkRateLimit('default-limit')
      expect(result.success).toBe(true)
    }
    const blocked = await checkRateLimit('default-limit')
    expect(blocked.success).toBe(false)
  })

  it('uses default window of 60000ms when not specified', async () => {
    for (let i = 0; i < 5; i++) {
      await checkRateLimit('default-window')
    }
    const blocked = await checkRateLimit('default-window')
    expect(blocked.success).toBe(false)

    vi.advanceTimersByTime(60001)
    const allowed = await checkRateLimit('default-window')
    expect(allowed.success).toBe(true)
  })

  it('accepts custom limit parameter', async () => {
    for (let i = 0; i < 3; i++) {
      const result = await checkRateLimit('custom-limit', 3, 60000)
      expect(result.success).toBe(true)
    }
    const blocked = await checkRateLimit('custom-limit', 3, 60000)
    expect(blocked.success).toBe(false)
  })

  it('accepts custom window parameter', async () => {
    for (let i = 0; i < 5; i++) {
      await checkRateLimit('custom-window', 5, 10000)
    }
    const blocked = await checkRateLimit('custom-window', 5, 10000)
    expect(blocked.success).toBe(false)

    vi.advanceTimersByTime(10001)
    const allowed = await checkRateLimit('custom-window', 5, 10000)
    expect(allowed.success).toBe(true)
  })

  it('allows request again after partial window expiry', async () => {
    await checkRateLimit('partial-key', 2, 60000)
    await checkRateLimit('partial-key', 2, 60000)
    const blocked = await checkRateLimit('partial-key', 2, 60000)
    expect(blocked.success).toBe(false)

    vi.advanceTimersByTime(30000)
    const stillBlocked = await checkRateLimit('partial-key', 2, 60000)
    expect(stillBlocked.success).toBe(false)

    vi.advanceTimersByTime(30001)
    const allowed = await checkRateLimit('partial-key', 2, 60000)
    expect(allowed.success).toBe(true)
  })

  it('handles rapid consecutive calls correctly', async () => {
    const results = await Promise.all(
      Array.from({ length: 7 }, () => checkRateLimit('rapid-key', 5, 60000))
    )
    expect(results.filter((r) => r.success)).toHaveLength(5)
    expect(results.filter((r) => !r.success)).toHaveLength(2)
  })
})
