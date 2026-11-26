import { describe, it, expect } from 'vitest'
import { cancelReminderDue, type CancelReminderRow } from '../reminder-helpers'

const row = (over: Partial<CancelReminderRow> = {}): CancelReminderRow => ({
  cancelByDate: '2026-12-10',
  cancelState: 'planned',
  reminderDaysBefore: 3,
  lastReminderSent: null,
  ...over,
})

const today = new Date('2026-12-07T12:00:00Z')

describe('cancelReminderDue', () => {
  it('is false without a cancel-by date', () => {
    expect(cancelReminderDue(row({ cancelByDate: null }), today)).toBe(false)
  })

  it('is false when cancellation is not planned', () => {
    expect(cancelReminderDue(row({ cancelState: 'none' }), today)).toBe(false)
    expect(cancelReminderDue(row({ cancelState: 'canceled' }), today)).toBe(false)
  })

  it('is false when the deadline is further away than the reminder window', () => {
    expect(cancelReminderDue(row({ cancelByDate: '2026-12-11' }), today)).toBe(false)
  })

  it('is true exactly at the reminder window', () => {
    expect(cancelReminderDue(row(), today)).toBe(true)
  })

  it('is false when a reminder was already sent today', () => {
    expect(cancelReminderDue(row({ lastReminderSent: '2026-12-07T08:00:00Z' }), today)).toBe(false)
  })
})
