export function calculateNextRenewalDate(
  startDate: string,
  billingCycle: 'monthly' | 'yearly' | 'one-time'
): Date | null {
  if (billingCycle === 'one-time') return null

  const start = new Date(startDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let next = new Date(start)

  if (billingCycle === 'monthly') {
    while (next <= today) {
      next.setMonth(next.getMonth() + 1)
    }
  } else if (billingCycle === 'yearly') {
    while (next <= today) {
      next.setFullYear(next.getFullYear() + 1)
    }
  }

  return next
}

export function getDaysUntilRenewal(renewalDate: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

