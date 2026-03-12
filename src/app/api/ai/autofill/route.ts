import { createClient } from '@/lib/supabase/server'
import { autoFillSubscription } from '@/lib/groq-service'
import { NextRequest } from 'next/server'

const rateLimitMap = new Map<string, { count: number; reset: number }>()

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Rate limit: 10 per minute per user
  const now = Date.now()
  const record = rateLimitMap.get(user.id)
  if (record && now < record.reset && record.count >= 10) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  if (!record || now > record.reset) {
    rateLimitMap.set(user.id, { count: 1, reset: now + 60000 })
  } else {
    record.count++
  }

  const { name } = await req.json()
  if (!name || typeof name !== 'string' || name.length > 100) {
    return Response.json({ error: 'Invalid name' }, { status: 400 })
  }

  try {
    const result = await autoFillSubscription(name)
    return Response.json(result)
  } catch {
    return Response.json({ error: 'AI service unavailable' }, { status: 500 })
  }
}

