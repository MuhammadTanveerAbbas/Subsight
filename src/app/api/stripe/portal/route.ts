import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'
import { NextRequest } from 'next/server'

const rateLimitMap = new Map<string, { count: number; reset: number }>()

export async function POST(req: NextRequest) {
  const stripe = getStripe()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const now = Date.now()
  const record = rateLimitMap.get(user.id)
  if (record && now < record.reset && record.count >= 10) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  if (!record || now > record.reset) {
    rateLimitMap.set(user.id, { count: 1, reset: now + 60000 })
  } else {
    record.count++
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, subscription_tier')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_customer_id || profile.subscription_tier !== 'pro') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    })
    return Response.json({ url: session.url })
  } catch (err) {
    console.error('[Stripe Portal]', err instanceof Error ? err.message : 'Unknown error')
    return Response.json({ error: 'Failed to create portal session' }, { status: 500 })
  }
}
