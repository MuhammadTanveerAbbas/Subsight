import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportSubscriptionsJSON, exportSubscriptionsCSV } from '../export'
import type { Sub } from '@/app/(app)/dashboard/dashboard-types'

/* ── mock browser APIs ──────────────────────────────────────────────── */

const createObjectURLMock = vi.fn(() => 'blob:mock')
const revokeObjectURLMock = vi.fn()
const appendChildMock = vi.fn()
const removeChildMock = vi.fn()
const clickMock = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()

  global.URL.createObjectURL = createObjectURLMock
  global.URL.revokeObjectURL = revokeObjectURLMock

  const anchor = { href: '', download: '', click: clickMock } as unknown as HTMLAnchorElement
  vi.spyOn(document, 'createElement').mockImplementation((tag: string) =>
    tag === 'a' ? anchor : document.createElement(tag),
  )
  vi.spyOn(document.body, 'appendChild').mockImplementation(appendChildMock)
  vi.spyOn(document.body, 'removeChild').mockImplementation(removeChildMock)
})

/* ── fixtures ───────────────────────────────────────────────────────── */

const subs: Sub[] = [
  {
    id: '1',
    name: 'Netflix',
    category: 'Streaming',
    amount: 15.99,
    currency: 'USD',
    cycle: 'monthly',
    nextDate: '2026-08-01',
    status: 'active',
    autoRenew: true,
    provider: 'Netflix Inc.',
    notes: '',
  },
  {
    id: '2',
    name: 'Service, "Special"',
    category: 'Other',
    amount: 9,
    currency: 'USD',
    cycle: 'yearly',
    nextDate: '',
    status: 'inactive',
    autoRenew: false,
    provider: 'Acme\nCorp',
    notes: 'some note',
  },
]

/* ── JSON tests ─────────────────────────────────────────────────────── */

describe('exportSubscriptionsJSON', () => {
  it('creates a blob and triggers download', () => {
    exportSubscriptionsJSON(subs)
    expect(createObjectURLMock).toHaveBeenCalledOnce()
    expect(clickMock).toHaveBeenCalledOnce()
    expect(revokeObjectURLMock).toHaveBeenCalledOnce()
  })

  it('produces valid JSON with metadata and all subscription fields', () => {
    let captured = ''
    global.Blob = class {
      constructor(parts: BlobPart[]) { captured = parts[0] as string }
    } as unknown as typeof Blob

    exportSubscriptionsJSON(subs)

    const parsed = JSON.parse(captured)
    expect(parsed).toHaveProperty('exportedAt')
    expect(parsed.totalCount).toBe(2)
    expect(parsed.activeCount).toBe(1)
    expect(parsed.subscriptions).toHaveLength(2)

    const first = parsed.subscriptions[0]
    expect(first.id).toBe('1')
    expect(first.name).toBe('Netflix')
    expect(first.notes).toBe('')
  })
})

/* ── CSV tests ──────────────────────────────────────────────────────── */

describe('exportSubscriptionsCSV', () => {
  it('creates a blob and triggers download', () => {
    exportSubscriptionsCSV(subs)
    expect(createObjectURLMock).toHaveBeenCalledOnce()
    expect(clickMock).toHaveBeenCalledOnce()
  })

  it('starts with BOM and contains expected headers', () => {
    let captured = ''
    global.Blob = class {
      constructor(parts: BlobPart[]) { captured = parts[0] as string }
    } as unknown as typeof Blob

    exportSubscriptionsCSV(subs)

    expect(captured.startsWith('\uFEFF')).toBe(true)
    expect(captured).toContain('Name')
    expect(captured).toContain('Billing Cycle')
    expect(captured).toContain('Notes')
  })

  it('escapes cells with commas, quotes, and newlines', () => {
    let captured = ''
    global.Blob = class {
      constructor(parts: BlobPart[]) { captured = parts[0] as string }
    } as unknown as typeof Blob

    exportSubscriptionsCSV(subs)

    expect(captured).toContain('"Service, ""Special"""')
    expect(captured).toContain('"Acme\nCorp"')
  })

  it('renders autoRenew as Yes/No', () => {
    let captured = ''
    global.Blob = class {
      constructor(parts: BlobPart[]) { captured = parts[0] as string }
    } as unknown as typeof Blob

    exportSubscriptionsCSV(subs)
    expect(captured).toContain('Yes')
    expect(captured).toContain('No')
  })
})
