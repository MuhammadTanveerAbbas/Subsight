import Groq from 'groq-sdk'
import { escapeHtml, sanitizeText } from './validation'

// Valid Groq model IDs — https://console.groq.com/docs/models
const MODELS = {
  fast: 'llama-3.1-8b-instant',
  quality: 'llama-3.3-70b-versatile',
} as const

function parseAIJson(text: string): Record<string, unknown> {
  const trimmed = text.trim()
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  const jsonStr = fenceMatch?.[1]?.trim() ?? trimmed
  return JSON.parse(jsonStr) as Record<string, unknown>
}

function getGroq() {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set')
  }
  return new Groq({ apiKey })
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
  const response = await groq.chat.completions.create({
    model: MODELS.fast,
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
    max_tokens: 256,
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
  const response = await groq.chat.completions.create({
    model: MODELS.quality,
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
    max_tokens: 512,
    temperature: 0.7,
  })
  const raw = response.choices[0]?.message?.content || 'Unable to generate summary.'
  return sanitizeText(raw).slice(0, 5000)
}

