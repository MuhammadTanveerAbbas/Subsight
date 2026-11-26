import type { Sub } from '@/app/(app)/dashboard/dashboard-types'

export interface CalendarCell {
  day: number
  date: string
  inMonth: boolean
  renewals: Sub[]
}

const iso = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

/** Six-week month grid, Sunday first, with renewals grouped by date. */
export function buildMonthGrid(subs: Sub[], year: number, month: number): CalendarCell[] {
  const first = new Date(year, month, 1)
  const start = new Date(year, month, 1 - first.getDay())

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index)
    const key = iso(date)
    return {
      day: date.getDate(),
      date: key,
      inMonth: date.getMonth() === month && date.getFullYear() === year,
      renewals: subs
        .filter((sub) => sub.nextDate === key)
        .sort((a, b) => a.name.localeCompare(b.name)),
    }
  })
}
