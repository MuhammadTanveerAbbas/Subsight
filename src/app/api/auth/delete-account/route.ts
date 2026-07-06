import { getAuthenticatedUser } from '@/lib/api-auth'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const auth = await getAuthenticatedUser({ requireVerified: true })
  if (!auth.user) return Response.json({ error: auth.error }, { status: auth.status })

  const { user } = auth

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return Response.json({ error: 'Server configuration error' }, { status: 500 })

  const adminClient = createAdminClient(url, key)

  const { error } = await adminClient.auth.admin.deleteUser(user.id)
  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ success: true })
}
