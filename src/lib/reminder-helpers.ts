export interface CancelReminderRow {
  cancelByDate: string | null
  cancelState: string
  reminderDaysBefore: number
  lastReminderSent: string | null
}

const dayNumber = (date: Date): number =>
  Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())

/** True only when a planned cancellation reaches its reminder window today. */
export function cancelReminderDue(row: CancelReminderRow, today: Date): boolean {
  if (row.cancelState !== 'planned' || !row.cancelByDate) return false

  const deadline = new Date(`${row.cancelByDate}T00:00:00Z`)
  if (Number.isNaN(deadline.getTime())) return false

  const daysUntil = Math.round((dayNumber(deadline) - dayNumber(today)) / 86400000)
  if (daysUntil !== row.reminderDaysBefore) return false

  if (row.lastReminderSent) {
    const sent = new Date(row.lastReminderSent)
    if (!Number.isNaN(sent.getTime()) && dayNumber(sent) === dayNumber(today)) return false
  }

  return true
}
