import Groq, {
  APIError,
  APIConnectionError,
  APIConnectionTimeoutError,
  InternalServerError,
  RateLimitError,
} from 'groq-sdk'
import type { ChatCompletionMessageParam } from 'groq-sdk/resources/chat'
import { escapeHtml, sanitizeText } from './validation'
import { logError } from './error-logger'

// Preferred model IDs are tried in order. The first model in each list is the
// one the app intentionally uses today; the remaining entries are compatibility
// fallbacks selected from the models Groq reports as available.
const MODEL_PREFERENCES = {
  fast: ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'llama3-8b-8192'],
  quality: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'llama3-70b-8192'],
} as const

type ModelKey = keyof typeof MODEL_PREFERENCES

// Model IDs that are not usable for chat completions.
const NON_CHAT_MODELS = new Set([
  'text-embedding-3-large',
  'text-embedding-3-small',
  'whisper-large-v3',
  'whisper-large-v3-turbo',
])

const MODEL_CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6 hours
const GROQ_TIMEOUT_MS = 30_000
const MAX_RETRIES = 2
const MAX_BACKOFF_MS = 8_000

interface ChatCompletionRequest {
  modelKey: ModelKey
  messages: ChatCompletionMessageParam[]
  maxTokens: number
  temperature: number
}

let modelsCache: { models: string[]; fetchedAt: number } | null = null
let inflightModelsFetch: Promise<string[]> | null = null

function parseAIJson(text: string): Record<string, unknown> {
  const trimmed = text.trim()
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  const jsonStr = fenceMatch?.[1]?.trim() ?? trimmed
  return JSON.parse(jsonStr) as Record<string, unknown>
}

function getGroq(): Groq {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set')
  }
  // Retries are handled here with explicit backoff/jitter so behavior is
  // deterministic and testable. The SDK's own retry loop is disabled.
  return new Groq({ apiKey, maxRetries: 0, timeout: GROQ_TIMEOUT_MS })
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function backoffDelay(attempt: number, retryAfterMs?: number): number {
  if (retryAfterMs != null) return retryAfterMs
  const exponential = 500 * 2 ** attempt
  const jitter = Math.round(Math.random() * 250)
  return Math.min(exponential + jitter, MAX_BACKOFF_MS)
}

function parseRetryAfter(headers?: Headers): number | undefined {
  const value = headers?.get('retry-after')
  if (!value) return undefined
  const seconds = Number(value)
  if (!Number.isFinite(seconds) || seconds < 0) return undefined
  return Math.min(seconds * 1000, MAX_BACKOFF_MS)
}

function isRateLimitError(err: unknown): err is RateLimitError {
  return err instanceof RateLimitError
}

function isTransientError(err: unknown): boolean {
  return (
    err instanceof APIConnectionError ||
    err instanceof APIConnectionTimeoutError ||
    err instanceof InternalServerError
  )
}

function isModelUnavailableError(err: unknown): boolean {
  if (!(err instanceof APIError)) return false
  if (err.status === 404) return true
  if (err.status !== 400) return false
  const message = err.message.toLowerCase()
  return message.includes('model_not_found') || message.includes('model not found')
}

async function fetchModelIds(groq: Groq): Promise<string[]> {
  const response = await groq.models.list()
  return (response.data ?? []).map((model) => model.id).filter((id) => !NON_CHAT_MODELS.has(id))
}

async function getModels(groq: Groq, options: { force?: boolean } = {}): Promise<string[]> {
  const now = Date.now()
  if (!options.force && modelsCache && now - modelsCache.fetchedAt < MODEL_CACHE_TTL_MS) {
    return modelsCache.models
  }
  if (!inflightModelsFetch) {
    inflightModelsFetch = fetchModelIds(groq)
      .then((models) => {
        modelsCache = { models, fetchedAt: Date.now() }
        return models
      })
      .finally(() => {
        inflightModelsFetch = null
      })
  }
  try {
    return await inflightModelsFetch
  } catch (err) {
    // Serve a stale list rather than failing the request when discovery fails.
    if (modelsCache) return modelsCache.models
    throw err
  }
}

function selectModel(models: string[], preference: readonly string[], exclude: Set<string>): string | null {
  for (const id of preference) {
    if (!exclude.has(id) && models.includes(id)) return id
  }
  return models.find((id) => !exclude.has(id)) ?? null
}

async function chatCompletion(groq: Groq, request: ChatCompletionRequest) {
  const preference = MODEL_PREFERENCES[request.modelKey]
  const triedModels = new Set<string>()

  let models: string[] = []
  try {
    models = await getModels(groq)
  } catch (err) {
    logError(err, { context: 'groq-model-discovery' })
  }

  let model =
    selectModel(models, preference, triedModels) ??
    preference.find((id) => !triedModels.has(id)) ??
    null
  if (!model) {
    throw new Error('No suitable Groq model available')
  }

  let attempt = 0

  for (;;) {
    triedModels.add(model)
    try {
      return await groq.chat.completions.create({
        model,
        messages: request.messages,
        max_tokens: request.maxTokens,
        temperature: request.temperature,
      })
    } catch (err) {
      if (isModelUnavailableError(err)) {
        // The selected model was rejected: refresh the list and pick another.
        let refreshed = models
        try {
          refreshed = await getModels(groq, { force: true })
        } catch (refreshErr) {
          logError(refreshErr, { context: 'groq-model-refresh' })
          refreshed = [...preference]
        }
        const next = selectModel(refreshed, preference, triedModels)
        if (!next) {
          logError(err, { context: 'groq-model-fallback', model })
          throw new Error('Groq model unavailable')
        }
        model = next
        continue
      }

      const shouldRetry = isRateLimitError(err) || isTransientError(err)
      if (!shouldRetry || attempt >= MAX_RETRIES) {
        throw err
      }
      const retryAfterMs = isRateLimitError(err) ? parseRetryAfter(err.headers) : undefined
      await sleep(backoffDelay(attempt, retryAfterMs))
      attempt += 1
    }
  }
}

export async function autoFillSubscription(name: string): Promise<{
  provider: string
  category: string
  amount: number
  currency: string
  billingCycle: string
  autoRenew: boolean
}> {
  const groq = getGroq()
  const response = await chatCompletion(groq, {
    modelKey: 'fast',
    messages: [
      {
        role: 'system',
        content: `You are a subscription database assistant. 
        Given a subscription service name, return accurate details.
        Return ONLY valid JSON, no markdown, no explanation.
        JSON shape: {
          "provider": string,
          "category": one of [
            "Entertainment","Productivity","Development",
            "Design","Marketing","Finance","Health",
            "Education","Cloud","Communication","Other"
          ],
          "amount": number (USD, most common plan price),
          "currency": "USD",
          "billingCycle": "monthly" | "yearly" | "one-time",
          "autoRenew": boolean
        }`,
      },
      {
        role: 'user',
        content: `Subscription name: ${name}`,
      },
    ],
    maxTokens: 256,
    temperature: 0.1,
  })

  const text = response.choices[0]?.message?.content || '{}'
  try {
    const parsed = parseAIJson(text)
    const aiBillingCycle = String(parsed.billingCycle || 'monthly').toLowerCase()
    const normalizedBillingCycle = aiBillingCycle === 'yearly' ? 'annually' : aiBillingCycle
    return {
      provider: escapeHtml(String(parsed.provider || '')).slice(0, 100),
      category: escapeHtml(String(parsed.category || '')).slice(0, 50),
      amount: Math.min(Math.abs(Number(parsed.amount) || 0), 999999),
      currency: escapeHtml(String(parsed.currency || 'USD')).slice(0, 10),
      billingCycle: escapeHtml(normalizedBillingCycle).slice(0, 20),
      autoRenew: Boolean(parsed.autoRenew),
    }
  } catch {
    throw new Error('Failed to parse AI response')
  }
}

export async function summarizeSpending(subscriptions: {
  name: string
  amount: number
  billingCycle: string
  category: string
}[]): Promise<string> {
  const groq = getGroq()
  const response = await chatCompletion(groq, {
    modelKey: 'quality',
    messages: [
      {
        role: 'system',
        content: `You are a personal finance assistant specializing in 
        subscription optimization. Analyze the user's subscriptions and 
        give practical, specific advice. Be direct and actionable.
        Format: 3-4 short paragraphs. No bullet points. No markdown headers.`,
      },
      {
        role: 'user',
        content: `Analyze my subscriptions: ${JSON.stringify(subscriptions)}`,
      },
    ],
    maxTokens: 512,
    temperature: 0.7,
  })
  const raw = response.choices[0]?.message?.content || 'Unable to generate summary.'
  return sanitizeText(raw).slice(0, 5000)
}
