import { getAuthenticatedUser } from '@/lib/api-auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { VAULT_CATEGORIES, CURRENCIES } from '@/lib/types'
import { NextRequest } from 'next/server'
import { z } from 'zod'

const createItemSchema = z.object({
  name: z.string().min(1).max(120),
  category: z.enum(VAULT_CATEGORIES).default('Other'),
  amount: z.number().nonnegative().max(9_999_999),
  currency: z.enum(CURRENCIES).default('USD'),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().max(500).nullable().optional().default(null),
})

const updateItemSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(1).max(120).optional(),
    category: z.enum(VAULT_CATEGORIES).optional(),
    amount: z.number().nonnegative().max(9_999_999).optional(),
    currency: z.enum(CURRENCIES).optional(),
    purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    notes: z.string().max(500).nullable().optional(),
  })
  .refine(
    (data) =>
      Object.keys(data).some(
        (key) => key !== 'id' && data[key as keyof typeof data] !== undefined,
      ),
    { message: 'At least one field to update is required' },
  )

const settingsSchema = z.object({
  monthlyBudget: z.number().nonnegative().max(9_999_999),
  currency: z.enum(CURRENCIES).default('USD'),
})

type Supabase = Awaited<ReturnType<typeof getAuthenticatedUser>>['supabase']

async function ensureProfile(supabase: Supabase, userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single()

  if (error?.code === 'PGRST116') {
    const { error: createError } = await supabase
      .from('profiles')
      .insert({ id: userId, subscription_tier: 'free', subscription_status: 'inactive' })
    if (createError) throw new Error(`Failed to create profile: ${createError.message}`)
    return
  }

  if (error) throw new Error(`Failed to fetch profile: ${error.message}`)
  if (!data) throw new Error('Profile not found')
}

function trimOrNull(value: string | null | undefined, max: number): string | null {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed ? trimmed.slice(0, max) : null
}

function badRequest(err: unknown) {
  if (err instanceof z.ZodError) {
    return Response.json(
      { error: err.errors.map((e) => e.message).join(', ') },
      { status: 400 },
    )
  }
  return Response.json({ error: 'Invalid request body' }, { status: 400 })
}

/** Fetch all vault data for the signed-in user. */
export async function GET() {
  const auth = await getAuthenticatedUser()
  if (!auth.user) {
    return Response.json({ error: auth.error }, { status: auth.status })
  }

  const { supabase, user } = auth

  const [{ data: items, error: itemsError }, { data: settingsRow, error: settingsError }] =
    await Promise.all([
      supabase
        .from('vault_items')
        .select('id, name, category, amount, currency, purchase_date, notes, created_at')
        .eq('user_id', user.id)
        .order('purchase_date', { ascending: false })
        .order('created_at', { ascending: false }),
      supabase
        .from('vault_settings')
        .select('monthly_budget, currency')
        .eq('user_id', user.id)
        .maybeSingle(),
    ])

  if (itemsError) {
    return Response.json({ error: itemsError.message }, { status: 500 })
  }
  if (settingsError) {
    return Response.json({ error: settingsError.message }, { status: 500 })
  }

  return Response.json({
    items: (items ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      amount: Number(item.amount),
      currency: item.currency ?? 'USD',
      purchaseDate: item.purchase_date,
      notes: item.notes ?? '',
      createdAt: item.created_at,
    })),
    settings: {
      monthlyBudget: Number(settingsRow?.monthly_budget ?? 0),
      currency: settingsRow?.currency ?? 'USD',
    },
  })
}

/** Add a personal expense item. */
export async function POST(req: NextRequest) {
  const auth = await getAuthenticatedUser({ requireVerified: true })
  if (!auth.user) {
    return Response.json({ error: auth.error }, { status: auth.status })
  }

  const { supabase, user } = auth

  const rateCheck = await checkRateLimit(`vault-create:${user.id}`, 30, 60_000)
  if (!rateCheck.success) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  let body: z.infer<typeof createItemSchema>
  try {
    body = createItemSchema.parse(await req.json())
  } catch (err) {
    return badRequest(err)
  }

  try {
    await ensureProfile(supabase, user.id)
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Profile error' },
      { status: 500 },
    )
  }

  const { error: dbError } = await supabase.from('vault_items').insert({
    user_id: user.id,
    name: body.name.trim().slice(0, 120),
    category: body.category,
    amount: body.amount,
    currency: body.currency,
    purchase_date: body.purchaseDate,
    notes: trimOrNull(body.notes, 500),
  })

  if (dbError) {
    return Response.json({ error: dbError.message }, { status: 500 })
  }

  return Response.json({ success: true })
}

/** Edit an existing personal expense item. */
export async function PATCH(req: NextRequest) {
  const auth = await getAuthenticatedUser({ requireVerified: true })
  if (!auth.user) {
    return Response.json({ error: auth.error }, { status: auth.status })
  }

  const { supabase, user } = auth

  const rateCheck = await checkRateLimit(`vault-update:${user.id}`, 40, 60_000)
  if (!rateCheck.success) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  let body: z.infer<typeof updateItemSchema>
  try {
    body = updateItemSchema.parse(await req.json())
  } catch (err) {
    return badRequest(err)
  }

  const { id, ...updates } = body
  const dbUpdates: Record<string, unknown> = {}
  if (updates.name !== undefined) dbUpdates.name = updates.name.trim().slice(0, 120)
  if (updates.category !== undefined) dbUpdates.category = updates.category
  if (updates.amount !== undefined) dbUpdates.amount = updates.amount
  if (updates.currency !== undefined) dbUpdates.currency = updates.currency
  if (updates.purchaseDate !== undefined) dbUpdates.purchase_date = updates.purchaseDate
  if (updates.notes !== undefined) dbUpdates.notes = trimOrNull(updates.notes, 500)

  const { data: updated, error: dbError } = await supabase
    .from('vault_items')
    .update(dbUpdates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id')

  if (dbError) {
    return Response.json({ error: dbError.message }, { status: 500 })
  }
  if (!updated?.length) {
    return Response.json({ error: 'Vault item not found' }, { status: 404 })
  }

  return Response.json({ success: true })
}

/** Remove a personal expense item. */
export async function DELETE(req: NextRequest) {
  const auth = await getAuthenticatedUser({ requireVerified: true })
  if (!auth.user) {
    return Response.json({ error: auth.error }, { status: auth.status })
  }

  const { supabase, user } = auth

  const rateCheck = await checkRateLimit(`vault-delete:${user.id}`, 30, 60_000)
  if (!rateCheck.success) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const id = new URL(req.url).searchParams.get('id')
  const parsed = z.string().uuid().safeParse(id)
  if (!parsed.success) {
    return Response.json({ error: 'Valid vault item id is required' }, { status: 400 })
  }

  const { data: deleted, error: dbError } = await supabase
    .from('vault_items')
    .delete()
    .eq('id', parsed.data)
    .eq('user_id', user.id)
    .select('id')

  if (dbError) {
    return Response.json({ error: dbError.message }, { status: 500 })
  }
  if (!deleted?.length) {
    return Response.json({ error: 'Vault item not found' }, { status: 404 })
  }

  return Response.json({ success: true })
}

/** Save vault preferences (monthly budget and currency). */
export async function PUT(req: NextRequest) {
  const auth = await getAuthenticatedUser({ requireVerified: true })
  if (!auth.user) {
    return Response.json({ error: auth.error }, { status: auth.status })
  }

  const { supabase, user } = auth

  let body: z.infer<typeof settingsSchema>
  try {
    body = settingsSchema.parse(await req.json())
  } catch (err) {
    return badRequest(err)
  }

  try {
    await ensureProfile(supabase, user.id)
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Profile error' },
      { status: 500 },
    )
  }

  const { error: dbError } = await supabase
    .from('vault_settings')
    .upsert(
      {
        user_id: user.id,
        monthly_budget: body.monthlyBudget,
        currency: body.currency,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )

  if (dbError) {
    return Response.json({ error: dbError.message }, { status: 500 })
  }

  return Response.json({ success: true })
}
