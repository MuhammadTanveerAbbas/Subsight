import { getAuthenticatedUser } from '@/lib/api-auth'
import { autoFillSubscription } from '@/lib/groq-service'
import { checkRateLimit } from '@/lib/rate-limit'
import { NextRequest } from 'next/server'
import { z } from 'zod'

const autofillRequestSchema = z.object({
  name: z.string().min(1).max(100),
})

export async function POST(req: NextRequest) {
  const auth = await getAuthenticatedUser({ requireVerified: true })
  if (!auth.user) return Response.json({ error: auth.error }, { status: auth.status })

  const { supabase, user } = auth

  const rateCheck = await checkRateLimit(`autofill:${user.id}`, 10, 60000)
  if (!rateCheck.success) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()
  if (profile?.subscription_tier !== 'pro') {
    return Response.json({ error: 'Pro subscription required' }, { status: 403 })
  }

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
  } catch {
    return Response.json({ error: 'AI service unavailable' }, { status: 500 })
  }
}

