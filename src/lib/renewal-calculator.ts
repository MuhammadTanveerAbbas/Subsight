const MAX_ITERATIONS = 500

export function calculateNextRenewalDate(
  startDate: string,
  billingCycle: string,
): Date | null {
  const c = billingCycle.toLowerCase()
  if (c === 'one-time') return null

  const start = new Date(startDate)
  if (isNaN(start.getTime())) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let next = new Date(start)
  let iterations = 0

  // Advance `next` until it is strictly in the future (after today)
  while (next <= today && iterations < MAX_ITERATIONS) {
    iterations++
    switch (c) {
      case 'daily':
        next.setDate(next.getDate() + 1)
        break
      case 'weekly':
        next.setDate(next.getDate() + 7)
        break
      case 'monthly':
        next.setMonth(next.getMonth() + 1)
        break
      case 'quarterly':
        next.setMonth(next.getMonth() + 3)
        break
      case 'annually':
      case 'yearly':
        next.setFullYear(next.getFullYear() + 1)
        break
      default:
        return null
    }
  }

  if (iterations >= MAX_ITERATIONS) return null
  return next
}

export function getDaysUntilRenewal(renewalDate: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const renewal = new Date(renewalDate)
  renewal.setHours(0, 0, 0, 0)
  return Math.ceil(
    (renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  )
}
