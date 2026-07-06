import { fetchWithTimeout } from '@/lib/fetch-client'
import type { BillingCycle, Currency } from '@/lib/types'

export interface CreateSubscriptionPayload {
  name: string
  amount: number
  billingCycle: BillingCycle | string
  category?: string | null
  provider?: string | null
  startDate?: string
  currency?: Currency | string
  autoRenew?: boolean
  notes?: string | null
}

export interface UpdateSubscriptionPayload {
  name?: string
  amount?: number
  billingCycle?: string
  category?: string | null
  provider?: string | null
  startDate?: string
  currency?: string
  autoRenew?: boolean
  notes?: string | null
  status?: 'active' | 'inactive' | 'warning' | 'renewal_passed'
  activeStatus?: boolean
  reminderEnabled?: boolean
  reminderDaysBefore?: 1 | 3 | 7 | 14
}

async function parseApiError(res: Response): Promise<string> {
  try {
    const data = await res.json()
    return data.error || `Request failed (${res.status})`
  } catch {
    return `Request failed (${res.status})`
  }
}

export async function createSubscription(
  payload: CreateSubscriptionPayload,
): Promise<void> {
  const res = await fetchWithTimeout('/api/subscriptions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    timeoutMs: 15_000,
  })
  if (!res.ok) {
    const error = await parseApiError(res)
    const err = new Error(error)
    if (res.status === 403 && error.toLowerCase().includes('limit')) {
      ;(err as Error & { upgrade?: boolean }).upgrade = true
    }
    throw err
  }
}

export async function updateSubscription(
  id: string,
  payload: UpdateSubscriptionPayload,
): Promise<void> {
  const res = await fetchWithTimeout('/api/subscriptions', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...payload }),
    timeoutMs: 15_000,
  })
  if (!res.ok) {
    const error = await parseApiError(res)
    const err = new Error(error)
    if (res.status === 403 && error.toLowerCase().includes('pro')) {
      ;(err as Error & { upgrade?: boolean }).upgrade = true
    }
    throw err
  }
}

export async function deleteSubscription(id: string): Promise<void> {
  const res = await fetchWithTimeout(
    `/api/subscriptions?id=${encodeURIComponent(id)}`,
    { method: 'DELETE', timeoutMs: 15_000 },
  )
  if (!res.ok) {
    throw new Error(await parseApiError(res))
  }
}
