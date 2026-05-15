import { createClient } from '@supabase/supabase-js'
import { sendRenewalReminder } from '@/lib/email-service'
import { NextRequest } from 'next/server'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase admin credentials are not set')
  return createClient(url, key)
}

export async function GET(req: NextRequest) {
  const supabase = getSupabaseAdmin()

  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  try {
    const { data: subscriptions, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*, profiles!inner(subscription_tier)')
      .eq('reminder_enabled', true)
      .eq('profiles.subscription_tier', 'pro')
      .not('next_renewal_date', 'is', null)

    if (fetchError) {
      return Response.json({ error: 'Database error', details: fetchError.message }, { status: 500 })
    }

    if (!subscriptions || subscriptions.length === 0) {
      return Response.json({ sent: 0, checked: 0, message: 'No reminders to send' })
    }

    let sent = 0
    let failed = 0

    for (const sub of subscriptions as any[]) {
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(sub.user_id)

      if (userError || !userData.user?.email) {
        failed++
        continue
      }

      const userEmail = userData.user.email
      const renewalDate = new Date(sub.next_renewal_date)
      const daysUntil = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntil !== sub.reminder_days_before) continue

      if (sub.last_reminder_sent) {
        const lastSent = new Date(sub.last_reminder_sent)
        if (lastSent.toDateString() === today.toDateString()) continue
      }

      try {
        await sendRenewalReminder({
          to: userEmail,
          subscriptionName: sub.name,
          amount: sub.amount,
          currency: sub.currency,
          renewalDate: renewalDate.toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          }),
          daysUntilRenewal: daysUntil,
          category: sub.category,
        })

        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({ last_reminder_sent: new Date().toISOString() })
          .eq('id', sub.id)

        if (updateError) { failed++ } else { sent++ }
      } catch {
        failed++
      }
    }

    return Response.json({ sent, failed, checked: subscriptions.length, timestamp: new Date().toISOString() })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ error: 'Cron job failed', details: msg }, { status: 500 })
  }
}
