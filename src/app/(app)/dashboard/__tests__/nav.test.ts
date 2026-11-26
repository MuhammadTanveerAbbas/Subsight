import { describe, it, expect } from 'vitest'
import { NAV_ALL, MOBILE_MORE_IDS } from '../dashboard-constants'

describe('dashboard navigation', () => {
  it('contains Plan and Calendar in the sidebar', () => {
    const ids = NAV_ALL.map((item) => item.id)
    expect(ids).toContain('plan')
    expect(ids).toContain('calendar')
  })

  it('puts Plan and Calendar in the mobile More sheet', () => {
    expect(MOBILE_MORE_IDS).toContain('plan')
    expect(MOBILE_MORE_IDS).toContain('calendar')
  })

  it('uses sentence case labels with no trailing periods', () => {
    for (const item of NAV_ALL) {
      expect(item.label.endsWith('.')).toBe(false)
      expect(item.label[0]).toBe(item.label[0]?.toUpperCase())
    }
  })
})
