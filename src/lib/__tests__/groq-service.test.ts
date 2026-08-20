import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  APIError,
  APIConnectionTimeoutError,
  BadRequestError,
  InternalServerError,
  NotFoundError,
  RateLimitError,
} from 'groq-sdk'

const { mockCreate, mockModelList, MockGroq } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockModelList: vi.fn(),
  MockGroq: vi.fn(),
}))

vi.mock('groq-sdk', async (importOriginal) => {
  const actual = await importOriginal<typeof import('groq-sdk')>()
  MockGroq.mockImplementation(() => ({
    chat: { completions: { create: mockCreate } },
    models: { list: mockModelList },
  }))
  return { ...actual, default: MockGroq }
})

const FAST_PREFERENCE = ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'llama3-8b-8192']
const QUALITY_PREFERENCE = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'llama3-70b-8192']
const MODEL_CACHE_TTL_MS = 6 * 60 * 60 * 1000

const autofillContent = JSON.stringify({
  provider: 'Netflix Inc.',
  category: 'Entertainment',
  amount: 15.99,
  currency: 'USD',
  billingCycle: 'monthly',
  autoRenew: true,
})

const successCreate = (content = autofillContent) => ({
  choices: [{ message: { content } }],
})

const headersStub = { get: () => null } as unknown as Headers
const retryAfterHeaders = { get: (name: string) => (name === 'retry-after' ? '1' : null) } as unknown as Headers

function availableModels(models: string[]) {
  mockModelList.mockResolvedValue({ data: models.map((id) => ({ id, created: 0, object: 'model', owned_by: 'groq' })) })
}

async function loadService() {
  return await import('../groq-service')
}

beforeEach(() => {
  vi.resetModules()
  vi.useRealTimers()
  vi.restoreAllMocks()
  mockCreate.mockReset()
  mockModelList.mockReset()
  MockGroq.mockClear()
  MockGroq.mockImplementation(() => ({
    chat: { completions: { create: mockCreate } },
    models: { list: mockModelList },
  }))
  process.env.GROQ_API_KEY = 'test-groq-api-key'
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  delete process.env.GROQ_API_KEY
})

describe('Groq service reliability', () => {
  it('handles a successful normal request', async () => {
    availableModels([FAST_PREFERENCE[0]!, 'text-embedding-3-large'])
    mockCreate.mockResolvedValue(successCreate())
    const service = await loadService()

    const result = await service.autoFillSubscription('Netflix')

    expect(result).toEqual({
      provider: 'Netflix Inc.',
      category: 'Entertainment',
      amount: 15.99,
      currency: 'USD',
      billingCycle: 'monthly',
      autoRenew: true,
    })
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ model: FAST_PREFERENCE[0] }))
  })

  it('discovers models through the Groq API', async () => {
    availableModels([FAST_PREFERENCE[0]!, FAST_PREFERENCE[1]!])
    mockCreate.mockResolvedValue(successCreate())
    const service = await loadService()

    await service.autoFillSubscription('Netflix')

    expect(mockModelList).toHaveBeenCalledTimes(1)
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ model: FAST_PREFERENCE[0] }))
  })

  it('excludes non-chat models from selection', async () => {
    availableModels(['text-embedding-3-large', 'custom-chat-model'])
    mockCreate.mockResolvedValue(successCreate())
    const service = await loadService()

    await service.autoFillSubscription('Netflix')

    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ model: 'custom-chat-model' }))
  })

  it('falls back to the preferred model when discovery fails', async () => {
    mockModelList.mockRejectedValue(new Error('discovery down'))
    mockCreate.mockResolvedValue(successCreate())
    const service = await loadService()

    await service.autoFillSubscription('Netflix')

    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ model: FAST_PREFERENCE[0] }))
  })

  it('caches the model list across requests', async () => {
    availableModels([FAST_PREFERENCE[0]!])
    mockCreate.mockResolvedValue(successCreate())
    const service = await loadService()

    await service.autoFillSubscription('Netflix')
    await service.autoFillSubscription('Spotify')

    expect(mockModelList).toHaveBeenCalledTimes(1)
  })

  it('refreshes the model cache after the TTL expires', async () => {
    vi.useFakeTimers()
    availableModels([FAST_PREFERENCE[0]!])
    mockCreate.mockResolvedValue(successCreate())
    const service = await loadService()

    await service.autoFillSubscription('Netflix')
    expect(mockModelList).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(MODEL_CACHE_TTL_MS + 1)
    await service.autoFillSubscription('Spotify')

    expect(mockModelList).toHaveBeenCalledTimes(2)
  })

  it('falls back to the next model when the selected model is unavailable', async () => {
    availableModels([FAST_PREFERENCE[0]!, FAST_PREFERENCE[1]!])
    mockCreate
      .mockRejectedValueOnce(new NotFoundError(404, { message: 'model not found' }, 'model not found', headersStub))
      .mockResolvedValueOnce(successCreate())
    const service = await loadService()

    const result = await service.autoFillSubscription('Netflix')

    expect(mockCreate.mock.calls[0]![0]).toMatchObject({ model: FAST_PREFERENCE[0] })
    expect(mockCreate.mock.calls[1]![0]).toMatchObject({ model: FAST_PREFERENCE[1] })
    expect(result.provider).toBe('Netflix Inc.')
    expect(mockModelList).toHaveBeenCalledTimes(2)
  })

  it('fails with a controlled error when no fallback model is available', async () => {
    availableModels([FAST_PREFERENCE[0]!])
    mockCreate.mockRejectedValue(new NotFoundError(404, { message: 'model not found' }, 'model not found', headersStub))
    const service = await loadService()

    await expect(service.autoFillSubscription('Netflix')).rejects.toThrow('Groq model unavailable')
    expect(mockCreate).toHaveBeenCalledTimes(1)
  })

  it('respects Retry-After on a 429 response', async () => {
    vi.useFakeTimers()
    availableModels([FAST_PREFERENCE[0]!])
    mockCreate
      .mockRejectedValueOnce(new RateLimitError(429, { message: 'rate limited' }, 'rate limited', retryAfterHeaders))
      .mockResolvedValueOnce(successCreate())
    const service = await loadService()

    const promise = service.autoFillSubscription('Netflix')
    await vi.advanceTimersByTimeAsync(0)
    expect(mockCreate).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(999)
    expect(mockCreate).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(1)
    expect(mockCreate).toHaveBeenCalledTimes(2)

    await expect(promise).resolves.toMatchObject({ provider: 'Netflix Inc.' })
  })

  it('uses bounded exponential backoff with jitter for 429 without Retry-After', async () => {
    vi.useFakeTimers()
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(1)
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout')
    availableModels([FAST_PREFERENCE[0]!])
    mockCreate
      .mockRejectedValueOnce(new RateLimitError(429, { message: 'rate limited' }, 'rate limited', headersStub))
      .mockResolvedValueOnce(successCreate())
    const service = await loadService()

    const promise = service.autoFillSubscription('Netflix')
    await vi.runAllTimersAsync()
    await expect(promise).resolves.toMatchObject({ provider: 'Netflix Inc.' })

    const delays = setTimeoutSpy.mock.calls.map((call) => call[1] as number)
    expect(delays).toHaveLength(1)
    expect(delays[0]!).toBeGreaterThanOrEqual(500)
    expect(delays[0]!).toBeLessThanOrEqual(750)
    randomSpy.mockRestore()
  })

  it('applies jitter so the delay is not always the base backoff', async () => {
    vi.useFakeTimers()
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout')
    availableModels([FAST_PREFERENCE[0]!])
    mockCreate
      .mockRejectedValueOnce(new RateLimitError(429, { message: 'rate limited' }, 'rate limited', headersStub))
      .mockResolvedValueOnce(successCreate())
    const service = await loadService()

    const promise = service.autoFillSubscription('Netflix')
    await vi.runAllTimersAsync()
    await expect(promise).resolves.toMatchObject({ provider: 'Netflix Inc.' })

    const delay = setTimeoutSpy.mock.calls[0]?.[1] as number
    expect(delay).toBeGreaterThan(500)
  })

  it('stops retrying after the maximum retry limit', async () => {
    vi.useFakeTimers()
    availableModels([FAST_PREFERENCE[0]!])
    mockCreate.mockRejectedValue(new RateLimitError(429, { message: 'rate limited' }, 'rate limited', headersStub))
    const service = await loadService()

    const promise = service.autoFillSubscription('Netflix')
    promise.catch(() => {})
    await vi.runAllTimersAsync()

    await expect(promise).rejects.toBeInstanceOf(RateLimitError)
    expect(mockCreate).toHaveBeenCalledTimes(3)
  })

  it('retries transient timeouts', async () => {
    vi.useFakeTimers()
    availableModels([FAST_PREFERENCE[0]!])
    mockCreate
      .mockRejectedValueOnce(new APIConnectionTimeoutError({ message: 'Request timed out.' }))
      .mockResolvedValueOnce(successCreate())
    const service = await loadService()

    const promise = service.autoFillSubscription('Netflix')
    await vi.runAllTimersAsync()
    await expect(promise).resolves.toMatchObject({ provider: 'Netflix Inc.' })
    expect(mockCreate).toHaveBeenCalledTimes(2)
  })

  it('retries transient 5xx and network errors', async () => {
    vi.useFakeTimers()
    availableModels([FAST_PREFERENCE[0]!])
    mockCreate
      .mockRejectedValueOnce(new InternalServerError(500, { message: 'server error' }, 'server error', headersStub))
      .mockResolvedValueOnce(successCreate())
    const service = await loadService()

    const promise = service.autoFillSubscription('Netflix')
    await vi.runAllTimersAsync()
    await expect(promise).resolves.toMatchObject({ provider: 'Netflix Inc.' })
    expect(mockCreate).toHaveBeenCalledTimes(2)
  })

  it('does not retry non-transient provider errors', async () => {
    availableModels([FAST_PREFERENCE[0]!])
    mockCreate.mockRejectedValue(new BadRequestError(400, { message: 'invalid request' }, 'invalid request', headersStub))
    const service = await loadService()

    await expect(service.autoFillSubscription('Netflix')).rejects.toBeInstanceOf(APIError)
    expect(mockCreate).toHaveBeenCalledTimes(1)
  })

  it('does not leak the API key in errors after exhausting retries', async () => {
    vi.useFakeTimers()
    availableModels([FAST_PREFERENCE[0]!])
    mockCreate.mockRejectedValue(new RateLimitError(429, { message: 'rate limited' }, 'rate limited', headersStub))
    const service = await loadService()

    const promise = service.autoFillSubscription('Netflix')
    promise.catch(() => {})
    await vi.runAllTimersAsync()

    await expect(promise).rejects.toMatchObject({
      message: expect.not.stringContaining('test-groq-api-key'),
    })
  })

  it('throws a controlled error when the API key is missing', async () => {
    delete process.env.GROQ_API_KEY
    const service = await loadService()

    await expect(service.autoFillSubscription('Netflix')).rejects.toThrow('GROQ_API_KEY is not set')
    expect(mockCreate).not.toHaveBeenCalled()
    expect(mockModelList).not.toHaveBeenCalled()
  })

  it('uses the quality model preference for spending summaries', async () => {
    availableModels([QUALITY_PREFERENCE[0]!, QUALITY_PREFERENCE[1]!])
    mockCreate.mockResolvedValue({ choices: [{ message: { content: 'A useful summary.' } }] })
    const service = await loadService()

    const summary = await service.summarizeSpending([
      { name: 'Netflix', amount: 15.99, billingCycle: 'monthly', category: 'Entertainment' },
    ])

    expect(summary).toBe('A useful summary.')
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ model: QUALITY_PREFERENCE[0] }))
  })
}, 30_000)