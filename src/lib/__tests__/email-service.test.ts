import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock nodemailer before importing the module under test
const sendMailMock = vi.fn()
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({ sendMail: sendMailMock })),
  },
}))

import { sendRenewalReminder } from '../email-service'

const BASE = {
  to: 'user@example.com',
  subscriptionName: 'Netflix',
  amount: 15.99,
  currency: 'USD',
  renewalDate: 'Monday, June 2, 2025',
  daysUntilRenewal: 3,
  category: 'entertainment',
}

beforeEach(() => {
  sendMailMock.mockReset()
  process.env.SMTP_HOST = 'smtp.example.com'
  process.env.SMTP_USER = 'user@example.com'
  process.env.SMTP_PASS = 'secret'
  process.env.SMTP_FROM = 'noreply@subsight.app'
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
})

describe('sendRenewalReminder', () => {
  it('calls sendMail with correct to/subject', async () => {
    sendMailMock.mockResolvedValue({})
    await sendRenewalReminder(BASE)

    expect(sendMailMock).toHaveBeenCalledOnce()
    const call = sendMailMock.mock.calls[0]![0]!
    expect(call.to).toBe('user@example.com')
    expect(call.subject).toContain('Netflix')
    expect(call.subject).toContain('3 days')
    expect(call.html).toContain('Netflix')
    expect(call.html).toContain('15.99')
  })

  it('uses "TOMORROW" subject when daysUntilRenewal is 1', async () => {
    sendMailMock.mockResolvedValue({})
    await sendRenewalReminder({ ...BASE, daysUntilRenewal: 1 })

    const subject = sendMailMock.mock.calls[0]![0]!.subject
    expect(subject).toContain('TOMORROW')
  })

  it('throws on invalid email', async () => {
    await expect(
      sendRenewalReminder({ ...BASE, to: 'not-an-email' }),
    ).rejects.toThrow('Invalid email address')
  })

  it('throws on negative amount', async () => {
    await expect(
      sendRenewalReminder({ ...BASE, amount: -5 }),
    ).rejects.toThrow('Amount cannot be negative')
  })

  it('throws when SMTP env vars are missing', async () => {
    delete process.env.SMTP_HOST
    await expect(sendRenewalReminder(BASE)).rejects.toThrow('SMTP environment variables')
  })

  it('re-throws SMTP transport errors', async () => {
    sendMailMock.mockRejectedValue(new Error('Connection refused'))
    await expect(sendRenewalReminder(BASE)).rejects.toThrow('Connection refused')
  })

  it('escapes HTML in subscription name', async () => {
    sendMailMock.mockResolvedValue({})
    await sendRenewalReminder({ ...BASE, subscriptionName: '<script>xss</script>' })

    const html = sendMailMock.mock.calls[0]![0]!.html
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })
})
