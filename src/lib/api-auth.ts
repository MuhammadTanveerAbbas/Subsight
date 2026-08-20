import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient, User } from '@supabase/supabase-js'

type AuthResult =
  | { supabase: SupabaseClient; user: User; error: null; status: null }
  | { supabase: SupabaseClient; user: null; error: string; status: 401 | 403 | 503 }

export async function getAuthenticatedUser(options?: {
  requireVerified?: boolean
}): Promise<AuthResult> {
  const supabase = await createClient()

  let result
  try {
    result = await supabase.auth.getUser()
  } catch {
    return { supabase, user: null, error: 'Authentication service unavailable', status: 503 }
  }

  const { data, error } = result

  if (error) {
    return { supabase, user: null, error: 'Authentication service unavailable', status: 503 }
  }

  const user = data.user

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
