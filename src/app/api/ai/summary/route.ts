import { getAuthenticatedUser } from '@/lib/api-auth'
import { summarizeSpending } from '@/lib/groq-service'
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { RateLimitError } from 'groq-sdk'

const summaryRequestSchema = z.object({
  subscriptions: z.array(z.object({
    name: z.string().max(200),
    amount: z.number().positive().max(999999),
    billingCycle: z.string().max(20),
    category: z.string().max(50),
  })).min(1).max(50),
})

export async function POST(req: NextRequest) {
  const auth = await getAuthenticatedUser({ requireVerified: true })
  if (!auth.user) return Response.json({ error: auth.error }, { status: auth.status })

  let subscriptions: z.infer<typeof summaryRequestSchema>['subscriptions']
  try {
    const body = summaryRequestSchema.parse(await req.json())
    subscriptions = body.subscriptions
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  try {
    const summary = await summarizeSpending(subscriptions)
    return Response.json({ summary })
  } catch (err) {
    // Groq provider rate limit tell the client to back off
    if (err instanceof RateLimitError) {
      const retryAfter = err.headers?.get('retry-after')
      return Response.json(
        { error: 'AI provider rate limit reached. Please wait a moment and try again.' },
        {
          status: 429,
          headers: retryAfter ? { 'Retry-After': retryAfter } : {},
        },
      )
    }
    return Response.json({ error: 'AI service unavailable. Please try again shortly.' }, { status: 503 })
  }
}
