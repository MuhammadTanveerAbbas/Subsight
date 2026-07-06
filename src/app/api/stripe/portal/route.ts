import { getAuthenticatedUser } from '@/lib/api-auth'
import { getStripe } from '@/lib/stripe'
import { checkRateLimit } from '@/lib/rate-limit'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const stripe = getStripe()
  const auth = await getAuthenticatedUser({ requireVerified: true })
  if (!auth.user) return Response.json({ error: auth.error }, { status: auth.status })

  const { supabase, user } = auth

  const rateCheck = await checkRateLimit(`portal:${user.id}`, 10, 60000)
  if (!rateCheck.success) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })
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
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?tab=billing`,
    })
    return Response.json({ url: session.url })
  } catch (err) {
    console.error('[Stripe Portal]', err instanceof Error ? err.message : 'Unknown error')
    return Response.json({ error: 'Failed to create portal session' }, { status: 500 })
  }
}
