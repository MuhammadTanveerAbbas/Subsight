import { getAuthenticatedUser } from '@/lib/api-auth'
import { getStripe } from '@/lib/stripe'
import { checkRateLimit } from '@/lib/rate-limit'
import { NextRequest } from 'next/server'

function isValidRedirectUrl(url: string, baseUrl: string): boolean {
  try {
    const parsed = new URL(url, baseUrl)
    return parsed.origin === baseUrl
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const stripe = getStripe()
  const auth = await getAuthenticatedUser({ requireVerified: true })
  if (!auth.user) return Response.json({ error: auth.error }, { status: auth.status })

  const { supabase, user } = auth

  const rateCheck = await checkRateLimit(`checkout:${user.id}`, 10, 60000)
  if (!rateCheck.success) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  try {
    let customerId = profile?.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
      await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    if (!appUrl) throw new Error('NEXT_PUBLIC_APP_URL is not set')

    const successUrl = `${appUrl}/dashboard?upgraded=true`
    const cancelUrl = `${appUrl}/pricing?canceled=true`
    if (!isValidRedirectUrl(successUrl, appUrl) || !isValidRedirectUrl(cancelUrl, appUrl)) {
      throw new Error('Invalid redirect URL configuration')
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      client_reference_id: user.id,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { user_id: user.id },
    })

    return Response.json({ url: session.url })
  } catch (err) {
    console.error('[Stripe Checkout]', err instanceof Error ? err.message : 'Unknown error')
    return Response.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
