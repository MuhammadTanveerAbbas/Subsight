import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient, User } from '@supabase/supabase-js'

type AuthResult =
  | { supabase: SupabaseClient; user: User; error: null; status: null }
  | { supabase: SupabaseClient; user: null; error: string; status: 401 | 403 }

export async function getAuthenticatedUser(options?: {
  requireVerified?: boolean
}): Promise<AuthResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { supabase, user: null, error: 'Unauthorized', status: 401 }
  }

  if (options?.requireVerified && !user.email_confirmed_at) {
    return {
      supabase,
      user: null,
      error: 'Email verification required',
      status: 403,
    }
  }

  return { supabase, user, error: null, status: null }
}
