import { createClient } from '@/lib/supabase/server'
import { summarizeSpending } from '@/lib/groq-service'
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

const rateLimitMap = new Map<string, { count: number; reset: number }>()

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()
  if (profile?.subscription_tier !== 'pro') {
    return Response.json({ error: 'Pro subscription required' }, { status: 403 })
  }

  // Rate limit: 5 per minute per user
  const now = Date.now()
  const record = rateLimitMap.get(user.id)
  if (record && now < record.reset && record.count >= 5) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  if (!record || now > record.reset) {
    rateLimitMap.set(user.id, { count: 1, reset: now + 60000 })
  } else {
    record.count++
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

