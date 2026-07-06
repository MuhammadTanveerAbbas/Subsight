import { getAuthenticatedUser } from '@/lib/api-auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { calculateNextRenewalDate } from '@/lib/renewal-calculator'
import { BILLING_CYCLES, CURRENCIES } from '@/lib/types'
import { NextRequest } from 'next/server'
import { z } from 'zod'

const SUB_STATUSES = ['active', 'inactive', 'warning', 'renewal_passed'] as const

const createSchema = z.object({
  name: z.string().min(1).max(100),
  amount: z.number().positive().max(999999),
  billingCycle: z.enum(BILLING_CYCLES),
  category: z.string().max(50).nullable().optional().default(null),
  provider: z.string().max(100).nullable().optional().default(null),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  currency: z.enum(CURRENCIES).default('USD'),
  autoRenew: z.boolean().default(true),
  notes: z.string().max(500).nullable().optional().default(null),
})

const updateSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(1).max(100).optional(),
    amount: z.number().positive().max(999999).optional(),
    billingCycle: z.enum(BILLING_CYCLES).optional(),
    category: z.string().max(50).nullable().optional(),
    provider: z.string().max(100).nullable().optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    currency: z.enum(CURRENCIES).optional(),
    autoRenew: z.boolean().optional(),
    notes: z.string().max(500).nullable().optional(),
    status: z.enum(SUB_STATUSES).optional(),
    activeStatus: z.boolean().optional(),
    reminderEnabled: z.boolean().optional(),
    reminderDaysBefore: z.union([z.literal(1), z.literal(3), z.literal(7), z.literal(14)]).optional(),
  })
  .refine(
    (data) =>
      Object.keys(data).some(
        (key) => key !== 'id' && data[key as keyof typeof data] !== undefined,
      ),
    { message: 'At least one field to update is required' },
  )

function trimOrNull(value: string | null | undefined, max: number): string | null {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed ? trimmed.slice(0, max) : null
}

async function ensureProfile(supabase: Awaited<ReturnType<typeof getAuthenticatedUser>>['supabase'], userId: string) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single()

  if (error?.code === 'PGRST116') {
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        subscription_tier: 'free',
        subscription_status: 'inactive',
      })
      .select('subscription_tier')
      .single()

    if (createError) throw new Error(`Failed to create profile: ${createError.message}`)
    return newProfile
  }

  if (error) throw new Error(`Failed to fetch profile: ${error.message}`)
  return profile
}

export async function POST(req: NextRequest) {
  const auth = await getAuthenticatedUser({ requireVerified: true })
  if (!auth.user) {
    return Response.json({ error: auth.error }, { status: auth.status })
  }

  const { supabase, user } = auth

  const rateCheck = await checkRateLimit(`create:${user.id}`, 10, 60000)
  if (!rateCheck.success) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  let body: z.infer<typeof createSchema>
  try {
    body = createSchema.parse(await req.json())
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({ error: err.errors.map((e) => e.message).join(', ') }, { status: 400 })
    }
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const startDate = body.startDate || new Date().toISOString().split('T')[0]!
  const nextRenewal = calculateNextRenewalDate(startDate, body.billingCycle)
  const nextRenewalDate = nextRenewal ? nextRenewal.toISOString().split('T')[0] : null

  let profile
  try {
    profile = await ensureProfile(supabase, user.id)
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Profile error' },
      { status: 500 },
    )
  }

  if (profile?.subscription_tier !== 'pro') {
    const { count } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    if (count != null && count >= 5) {
      return Response.json(
        { error: 'Free plan limit reached (max 5 subscriptions). Upgrade to Pro for unlimited.' },
        { status: 403 },
      )
    }
  }

  const { error: dbError } = await supabase.from('subscriptions').insert({
    user_id: user.id,
    name: body.name.trim().slice(0, 100),
    amount: body.amount,
    billing_cycle: body.billingCycle,
    category: trimOrNull(body.category, 50),
    provider: trimOrNull(body.provider, 100),
    start_date: startDate,
    next_renewal_date: nextRenewalDate,
    currency: body.currency,
    auto_renew: body.autoRenew,
    status: 'active',
    notes: trimOrNull(body.notes, 500),
    active_status: true,
    icon: 'default',
  })

  if (dbError) {
    return Response.json({ error: dbError.message }, { status: 500 })
  }

  return Response.json({ success: true })
}

export async function PATCH(req: NextRequest) {
  const auth = await getAuthenticatedUser({ requireVerified: true })
  if (!auth.user) {
    return Response.json({ error: auth.error }, { status: auth.status })
  }

  const { supabase, user } = auth

  const rateCheck = await checkRateLimit(`update:${user.id}`, 30, 60000)
  if (!rateCheck.success) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  let body: z.infer<typeof updateSchema>
  try {
    body = updateSchema.parse(await req.json())
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({ error: err.errors.map((e) => e.message).join(', ') }, { status: 400 })
    }
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { id, ...updates } = body

  if (
    updates.reminderEnabled === true ||
    updates.reminderDaysBefore !== undefined
  ) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    if (profile?.subscription_tier !== 'pro') {
      return Response.json(
        { error: 'Email reminders are available on the Pro plan.' },
        { status: 403 },
      )
    }
  }

  const { data: existing, error: fetchError } = await supabase
    .from('subscriptions')
    .select('start_date, billing_cycle')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !existing) {
    return Response.json({ error: 'Subscription not found' }, { status: 404 })
  }

  const dbUpdates: Record<string, unknown> = {}

  if (updates.name !== undefined) dbUpdates.name = updates.name.trim().slice(0, 100)
  if (updates.provider !== undefined) dbUpdates.provider = trimOrNull(updates.provider, 100)
  if (updates.category !== undefined) dbUpdates.category = trimOrNull(updates.category, 50)
  if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate
  if (updates.billingCycle !== undefined) dbUpdates.billing_cycle = updates.billingCycle
  if (updates.amount !== undefined) dbUpdates.amount = updates.amount
  if (updates.currency !== undefined) dbUpdates.currency = updates.currency
  if (updates.notes !== undefined) dbUpdates.notes = trimOrNull(updates.notes, 500)
  if (updates.autoRenew !== undefined) dbUpdates.auto_renew = updates.autoRenew
  if (updates.reminderEnabled !== undefined) dbUpdates.reminder_enabled = updates.reminderEnabled
  if (updates.reminderDaysBefore !== undefined) {
    dbUpdates.reminder_days_before = updates.reminderDaysBefore
  }

  if (updates.activeStatus !== undefined) {
    dbUpdates.active_status = updates.activeStatus
    dbUpdates.status = updates.activeStatus ? 'active' : 'inactive'
  } else if (updates.status !== undefined) {
    dbUpdates.status = updates.status
    dbUpdates.active_status = updates.status === 'active'
  }

  const startDate = (updates.startDate ?? existing.start_date) as string | null
  const billingCycle = (updates.billingCycle ?? existing.billing_cycle) as string | null
  if (startDate && billingCycle && (updates.startDate !== undefined || updates.billingCycle !== undefined)) {
    const nextRenewal = calculateNextRenewalDate(startDate, billingCycle)
    dbUpdates.next_renewal_date = nextRenewal
      ? nextRenewal.toISOString().split('T')[0]
      : null
  }

  const { error: dbError } = await supabase
    .from('subscriptions')
    .update(dbUpdates)
    .eq('id', id)
    .eq('user_id', user.id)

  if (dbError) {
    return Response.json({ error: dbError.message }, { status: 500 })
  }

  return Response.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const auth = await getAuthenticatedUser({ requireVerified: true })
  if (!auth.user) {
    return Response.json({ error: auth.error }, { status: auth.status })
  }

  const { supabase, user } = auth

  const rateCheck = await checkRateLimit(`delete:${user.id}`, 20, 60000)
  if (!rateCheck.success) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const id = (req.nextUrl ?? new URL(req.url)).searchParams.get('id')
  if (!id) {
    return Response.json({ error: 'Subscription id is required' }, { status: 400 })
  }

  const parsedId = z.string().uuid().safeParse(id)
  if (!parsedId.success) {
    return Response.json({ error: 'Invalid subscription id' }, { status: 400 })
  }

  const { error: dbError, count } = await supabase
    .from('subscriptions')
    .delete({ count: 'exact' })
    .eq('id', parsedId.data)
    .eq('user_id', user.id)

  if (dbError) {
    return Response.json({ error: dbError.message }, { status: 500 })
  }

  if (!count) {
    return Response.json({ error: 'Subscription not found' }, { status: 404 })
  }

  return Response.json({ success: true })
}
