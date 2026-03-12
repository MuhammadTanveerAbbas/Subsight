import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Supabase admin credentials are not set')
  }
  return createClient(url, key)
}

export async function POST(req: NextRequest) {
  const stripe = getStripe()
  const supabase = getSupabaseAdmin()

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Idempotency check
  const { data: existing } = await supabase
    .from('processed_webhook_events')
    .select('id')
    .eq('id', event.id)
    .single()
  if (existing) return Response.json({ received: true })
  await supabase.from('processed_webhook_events').insert({ id: event.id })

  const session = event.data.object as Stripe.Checkout.Session

  switch (event.type) {
    case 'checkout.session.completed': {
      const subRes = await stripe.subscriptions.retrieve(session.subscription as string)
      const sub: any = (subRes as any)?.data ?? subRes
      await supabase
        .from('profiles')
        .update({
          subscription_tier: 'pro',
          subscription_status: 'active',
          stripe_subscription_id: sub.id,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        })
        .eq('stripe_customer_id', session.customer as string)
      console.log(`[Stripe] Pro activated for customer: ${session.customer}`)
      break
    }
    case 'customer.subscription.deleted': {
      await supabase
        .from('profiles')
        .update({
          subscription_tier: 'free',
          subscription_status: 'inactive',
          stripe_subscription_id: null,
        })
        .eq('stripe_customer_id', session.customer as string)
      console.log(`[Stripe] Downgraded to free: ${session.customer}`)
      break
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object as any
      await supabase
        .from('profiles')
        .update({
          subscription_status: sub.status,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        })
        .eq('stripe_subscription_id', sub.id)
      break
    }
  }

  return Response.json({ received: true })
}

