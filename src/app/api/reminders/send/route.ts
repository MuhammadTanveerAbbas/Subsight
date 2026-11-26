import { createClient } from '@supabase/supabase-js'
import { sendCancellationReminder, sendRenewalReminder } from '@/lib/email-service'
import { cancelReminderDue } from '@/lib/reminder-helpers'
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
      .select('*')
      .eq('reminder_enabled', true)
      .not('next_renewal_date', 'is', null)

    if (fetchError) {
      return Response.json({ error: 'Database error', details: fetchError.message }, { status: 500 })
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

    const { data: cancellations, error: cancelFetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('cancel_state', 'planned')
      .not('cancel_by_date', 'is', null)

    if (cancelFetchError) {
      return Response.json({ error: 'Database error', details: cancelFetchError.message }, { status: 500 })
    }

    let cancelSent = 0

    for (const sub of (cancellations ?? []) as any[]) {
      if (!cancelReminderDue({
        cancelByDate: sub.cancel_by_date,
        cancelState: sub.cancel_state,
        reminderDaysBefore: sub.reminder_days_before ?? 3,
        lastReminderSent: sub.last_reminder_sent,
      }, today)) continue

      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(sub.user_id)
      if (userError || !userData.user?.email) {
        failed++
        continue
      }

      const deadline = new Date(`${sub.cancel_by_date}T00:00:00Z`)
      const daysUntil = Math.round((deadline.getTime() - Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) / 86400000)

      try {
        await sendCancellationReminder({
          to: userData.user.email,
          subscriptionName: sub.name,
          cancelByDate: sub.cancel_by_date,
          daysUntilDeadline: daysUntil,
        })
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({ last_reminder_sent: new Date().toISOString() })
          .eq('id', sub.id)
        if (updateError) { failed++ } else { cancelSent++ }
      } catch {
        failed++
      }
    }

    return Response.json({ sent, cancelSent, failed, checked: subscriptions.length, timestamp: new Date().toISOString() })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ error: 'Cron job failed', details: msg }, { status: 500 })
  }
}
