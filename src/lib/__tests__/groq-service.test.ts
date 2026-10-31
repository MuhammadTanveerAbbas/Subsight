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

// Current live models configured in MODEL_PREFERENCES (from AGENTS.md / groq-service.ts)
const FAST_PREFERENCE = ['openai/gpt-oss-20b', 'qwen/qwen3.8-27b', 'allam-2-7b']
const QUALITY_PREFERENCE = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.8-27b']
const MODEL_CACHE_TTL_MS = 6 * 60 * 60 * 1000

// Use a service name NOT in KNOWN_SUBSCRIPTIONS to force the AI path.
// "CustomTestService" is not in the knowledge base, so the AI mock will be called.
const TEST_SERVICE = 'CustomTestService'

const autofillContent = JSON.stringify({
  provider: 'CustomTest Inc.',
  category: 'Other',
  amount: 9.99,
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

    const result = await service.autoFillSubscription(TEST_SERVICE)

    expect(result).toEqual({
      provider: 'CustomTest Inc.',
      category: 'Other',
      amount: 9.99,
      currency: 'USD',
      billingCycle: 'monthly',
      autoRenew: true,
      description: '',
    })
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ model: FAST_PREFERENCE[0] }))
  })

  it('discovers models through the Groq API', async () => {
    availableModels([FAST_PREFERENCE[0]!, FAST_PREFERENCE[1]!])
    mockCreate.mockResolvedValue(successCreate())
    const service = await loadService()

    await service.autoFillSubscription(TEST_SERVICE)

    expect(mockModelList).toHaveBeenCalledTimes(1)
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ model: FAST_PREFERENCE[0] }))
  })

  it('excludes non-chat models from selection', async () => {
    availableModels(['text-embedding-3-large', 'custom-chat-model'])
    mockCreate.mockResolvedValue(successCreate())
    const service = await loadService()

    await service.autoFillSubscription(TEST_SERVICE)

    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ model: 'custom-chat-model' }))
  })

  it('falls back to the preferred model when discovery fails', async () => {
    mockModelList.mockRejectedValue(new Error('discovery down'))
    mockCreate.mockResolvedValue(successCreate())
    const service = await loadService()

    await service.autoFillSubscription(TEST_SERVICE)

    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ model: FAST_PREFERENCE[0] }))
  })

  it('caches the model list across requests', async () => {
    availableModels([FAST_PREFERENCE[0]!])
    mockCreate.mockResolvedValue(successCreate())
    const service = await loadService()

    await service.autoFillSubscription(TEST_SERVICE)
    await service.autoFillSubscription(TEST_SERVICE)

    expect(mockModelList).toHaveBeenCalledTimes(1)
  })

  it('refreshes the model cache after the TTL expires', async () => {
    vi.useFakeTimers()
    availableModels([FAST_PREFERENCE[0]!])
    mockCreate.mockResolvedValue(successCreate())
    const service = await loadService()

    await service.autoFillSubscription(TEST_SERVICE)
    expect(mockModelList).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(MODEL_CACHE_TTL_MS + 1)
    await service.autoFillSubscription(TEST_SERVICE)

    expect(mockModelList).toHaveBeenCalledTimes(2)
  })

  it('falls back to the next model when the selected model is unavailable', async () => {
    availableModels([FAST_PREFERENCE[0]!, FAST_PREFERENCE[1]!])
    mockCreate
      .mockRejectedValueOnce(new NotFoundError(404, { message: 'model not found' }, 'model not found', headersStub))
      .mockResolvedValueOnce(successCreate())
    const service = await loadService()

    const result = await service.autoFillSubscription(TEST_SERVICE)

    expect(mockCreate.mock.calls[0]![0]).toMatchObject({ model: FAST_PREFERENCE[0] })
    expect(mockCreate.mock.calls[1]![0]).toMatchObject({ model: FAST_PREFERENCE[1] })
    expect(result.provider).toBe('CustomTest Inc.')
    expect(mockModelList).toHaveBeenCalledTimes(2)
  })

  it('fails with a controlled error when no fallback model is available', async () => {
    availableModels([FAST_PREFERENCE[0]!])
    mockCreate.mockRejectedValue(new NotFoundError(404, { message: 'model not found' }, 'model not found', headersStub))
    const service = await loadService()

    await expect(service.autoFillSubscription(TEST_SERVICE)).rejects.toThrow('Groq model unavailable')
    expect(mockCreate).toHaveBeenCalledTimes(1)
  })

  it('respects Retry-After on a 429 response', async () => {
    vi.useFakeTimers()
    availableModels([FAST_PREFERENCE[0]!])
    mockCreate
      .mockRejectedValueOnce(new RateLimitError(429, { message: 'rate limited' }, 'rate limited', retryAfterHeaders))
      .mockResolvedValueOnce(successCreate())
    const service = await loadService()

    const promise = service.autoFillSubscription(TEST_SERVICE)
    await vi.advanceTimersByTimeAsync(0)
    expect(mockCreate).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(999)
    expect(mockCreate).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(1)
    expect(mockCreate).toHaveBeenCalledTimes(2)

    await expect(promise).resolves.toMatchObject({ provider: 'CustomTest Inc.' })
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

    const promise = service.autoFillSubscription(TEST_SERVICE)
    await vi.runAllTimersAsync()
    await expect(promise).resolves.toMatchObject({ provider: 'CustomTest Inc.' })

    // backoffDelay(attempt=0) = Math.min(600 * 2^0 + Math.round(random()*300), 10000)
    // With random()=1: 600 + 300 = 900
    const delays = setTimeoutSpy.mock.calls.map((call) => call[1] as number)
    expect(delays).toHaveLength(1)
    expect(delays[0]!).toBeGreaterThanOrEqual(600) // base at attempt 0
    expect(delays[0]!).toBeLessThanOrEqual(900)    // base + max jitter (300)
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

    const promise = service.autoFillSubscription(TEST_SERVICE)
    await vi.runAllTimersAsync()
    await expect(promise).resolves.toMatchObject({ provider: 'CustomTest Inc.' })

    const delay = setTimeoutSpy.mock.calls[0]?.[1] as number
    expect(delay).toBeGreaterThan(500)
  })

  it('stops retrying after the maximum retry limit', async () => {
    vi.useFakeTimers()
    availableModels([FAST_PREFERENCE[0]!])
    mockCreate.mockRejectedValue(new RateLimitError(429, { message: 'rate limited' }, 'rate limited', headersStub))
    const service = await loadService()

    const promise = service.autoFillSubscription(TEST_SERVICE)
    promise.catch(() => {})
    await vi.runAllTimersAsync()

    await expect(promise).rejects.toBeInstanceOf(RateLimitError)
    // MAX_RETRIES = 3: initial attempt + 3 retries = 4 total calls
    expect(mockCreate).toHaveBeenCalledTimes(4)
  })

  it('retries transient timeouts', async () => {
    vi.useFakeTimers()
    availableModels([FAST_PREFERENCE[0]!])
    mockCreate
      .mockRejectedValueOnce(new APIConnectionTimeoutError({ message: 'Request timed out.' }))
      .mockResolvedValueOnce(successCreate())
    const service = await loadService()

    const promise = service.autoFillSubscription(TEST_SERVICE)
    await vi.runAllTimersAsync()
    await expect(promise).resolves.toMatchObject({ provider: 'CustomTest Inc.' })
    expect(mockCreate).toHaveBeenCalledTimes(2)
  })

  it('retries transient 5xx and network errors', async () => {
    vi.useFakeTimers()
    availableModels([FAST_PREFERENCE[0]!])
    mockCreate
      .mockRejectedValueOnce(new InternalServerError(500, { message: 'server error' }, 'server error', headersStub))
      .mockResolvedValueOnce(successCreate())
    const service = await loadService()

    const promise = service.autoFillSubscription(TEST_SERVICE)
    await vi.runAllTimersAsync()
    await expect(promise).resolves.toMatchObject({ provider: 'CustomTest Inc.' })
    expect(mockCreate).toHaveBeenCalledTimes(2)
  })

  it('does not retry non-transient provider errors', async () => {
    availableModels([FAST_PREFERENCE[0]!])
    mockCreate.mockRejectedValue(new BadRequestError(400, { message: 'invalid request' }, 'invalid request', headersStub))
    const service = await loadService()

    await expect(service.autoFillSubscription(TEST_SERVICE)).rejects.toBeInstanceOf(APIError)
    expect(mockCreate).toHaveBeenCalledTimes(1)
  })

  it('does not leak the API key in errors after exhausting retries', async () => {
    vi.useFakeTimers()
    availableModels([FAST_PREFERENCE[0]!])
    mockCreate.mockRejectedValue(new RateLimitError(429, { message: 'rate limited' }, 'rate limited', headersStub))
    const service = await loadService()

    const promise = service.autoFillSubscription(TEST_SERVICE)
    promise.catch(() => {})
    await vi.runAllTimersAsync()

    await expect(promise).rejects.toMatchObject({
      message: expect.not.stringContaining('test-groq-api-key'),
    })
  })

  it('throws a controlled error when the API key is missing', async () => {
    delete process.env.GROQ_API_KEY
    const service = await loadService()

    await expect(service.autoFillSubscription(TEST_SERVICE)).rejects.toThrow('GROQ_API_KEY is not set')
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

  it('returns from knowledge base without calling AI for known services', async () => {
    // Netflix is in KNOWN_SUBSCRIPTIONS, The service should return immediately
    // without making any Groq API calls.
    const service = await loadService()

    const result = await service.autoFillSubscription('Netflix')

    expect(result.provider).toBe('Netflix')
    expect(result.category).toBe('Entertainment')
    expect(mockCreate).not.toHaveBeenCalled()
    expect(mockModelList).not.toHaveBeenCalled()
  })
}, 30_000)
