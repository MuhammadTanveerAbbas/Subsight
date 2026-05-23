import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase admin credentials are not set')
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
  } catch (err) {
    console.error('[Stripe Webhook] Invalid signature', err instanceof Error ? err.message : 'Unknown error')
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.info('[Stripe Webhook] Received event', { type: event.type, id: event.id })

  // Idempotency check
  const { data: existing } = await supabase
    .from('processed_webhook_events')
    .select('id')
    .eq('id', event.id)
    .single()
  if (existing) {
    console.info('[Stripe Webhook] Duplicate event skipped', { id: event.id })
    return Response.json({ received: true })
  }
  await supabase.from('processed_webhook_events').insert({ id: event.id })

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (!session.subscription || !session.customer) {
        console.warn('[Stripe Webhook] checkout.session.completed missing subscription or customer', { id: event.id })
        break
      }
      try {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string)
        const periodEnd = sub.items.data[0]?.current_period_end
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            subscription_tier: 'pro',
            subscription_status: 'active',
            stripe_subscription_id: sub.id,
            current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
          })
          .eq('stripe_customer_id', session.customer as string)
        if (updateError) {
          console.error('[Stripe Webhook] Failed to update profile on checkout.completed', { id: event.id, error: updateError.message })
        }
      } catch (err) {
        console.error('[Stripe Webhook] Error processing checkout.session.completed', { id: event.id, error: err instanceof Error ? err.message : 'Unknown' })
      }
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          subscription_tier: 'free',
          subscription_status: 'inactive',
          stripe_subscription_id: null,
        })
        .eq('stripe_customer_id', sub.customer as string)
      if (updateError) {
        console.error('[Stripe Webhook] Failed to update profile on subscription.deleted', { id: event.id, error: updateError.message })
      }
      break
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const periodEnd = sub.items.data[0]?.current_period_end
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          subscription_status: sub.status,
          current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        })
        .eq('stripe_subscription_id', sub.id)
      if (updateError) {
        console.error('[Stripe Webhook] Failed to update profile on subscription.updated', { id: event.id, error: updateError.message })
      }
      break
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice & { subscription: string | null }
      if (invoice.subscription) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ subscription_status: 'past_due' })
          .eq('stripe_subscription_id', invoice.subscription)
        if (updateError) {
          console.error('[Stripe Webhook] Failed to update profile on invoice.payment_failed', { id: event.id, error: updateError.message })
        }
      }
      break
    }
    case 'customer.subscription.trial_will_end': {
      console.info('[Stripe Webhook] Trial will end', { id: event.id })
      break
    }
  }

  return Response.json({ received: true })
}
