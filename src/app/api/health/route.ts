import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('profiles').select('id').limit(1)
    if (error) {
      return NextResponse.json({
        status: 'degraded',
        database: 'unreachable',
        timestamp: new Date().toISOString(),
      }, { status: 503 })
    }
    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
      version: '3.0.0',
    })
  } catch {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}
