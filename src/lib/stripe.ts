import Stripe from 'stripe'

let stripeSingleton: Stripe | null = null

export function getStripe() {
  if (stripeSingleton) return stripeSingleton
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  stripeSingleton = new Stripe(key, {
    apiVersion: '2026-02-25.clover',
  })
  return stripeSingleton
}

