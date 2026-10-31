import { getAuthenticatedUser } from '@/lib/api-auth'
import { autoFillSubscription } from '@/lib/groq-service'
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { RateLimitError } from 'groq-sdk'

const autofillRequestSchema = z.object({
  name: z.string().min(1).max(100),
})

export async function POST(req: NextRequest) {
  const auth = await getAuthenticatedUser({ requireVerified: true })
  if (!auth.user) return Response.json({ error: auth.error }, { status: auth.status })

  let name: string
  try {
    const body = autofillRequestSchema.parse(await req.json())
    name = body.name
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  try {
    const result = await autoFillSubscription(name)
    return Response.json(result)
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
