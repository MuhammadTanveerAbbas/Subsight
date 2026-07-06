export function calculateNextRenewalDate(
  startDate: string,
  billingCycle: string
): Date | null {
  const c = billingCycle.toLowerCase()
  if (c === 'one-time') return null

  const start = new Date(startDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let next = new Date(start)

  switch (c) {
    case 'daily':
      while (next <= today) {
        next.setDate(next.getDate() + 1)
      }
      break
    case 'weekly':
      while (next <= today) {
        next.setDate(next.getDate() + 7)
      }
      break
    case 'monthly':
      while (next <= today) {
        next.setMonth(next.getMonth() + 1)
      }
      break
    case 'quarterly':
      while (next <= today) {
        next.setMonth(next.getMonth() + 3)
      }
      break
    case 'annually':
    case 'yearly':
      while (next <= today) {
        next.setFullYear(next.getFullYear() + 1)
      }
      break
  }

  return next
}

export function getDaysUntilRenewal(renewalDate: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}
