import { getAuthenticatedUser } from '@/lib/api-auth'
import { summarizeSpending } from '@/lib/groq-service'
import { checkRateLimit } from '@/lib/rate-limit'
import { NextRequest } from 'next/server'
import { z } from 'zod'

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

  const { supabase, user } = auth

  const rateCheck = await checkRateLimit(`summary:${user.id}`, 5, 60000)
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
  } catch {
    return Response.json({ error: 'AI service unavailable' }, { status: 500 })
  }
}

