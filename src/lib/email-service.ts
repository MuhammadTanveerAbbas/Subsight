import nodemailer from 'nodemailer'

// ─── Configuration validation ─────────────────────────────────────────────────
interface SmtpConfig {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  from: string
}

function getSmtpConfig(): SmtpConfig {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host) throw new Error('SMTP environment variables incomplete: SMTP_HOST is not configured')
  if (!user) throw new Error('SMTP environment variables incomplete: SMTP_USER is not configured')
  if (!pass) throw new Error('SMTP environment variables incomplete: SMTP_PASS is not configured')

  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`SMTP_PORT is invalid: "${process.env.SMTP_PORT}". Must be a number between 1 and 65535.`)
  }

  // SMTP_SECURE can be set explicitly; otherwise infer from port:
  // port 465 → TLS (implicit), port 587 → STARTTLS (explicit), everything else → STARTTLS
  const secureEnv = process.env.SMTP_SECURE
  let secure: boolean
  if (secureEnv !== undefined) {
    secure = secureEnv === 'true' || secureEnv === '1'
  } else {
    secure = port === 465
  }

  // FROM address: fall back to SMTP_USER if SMTP_FROM is not set
  const from = process.env.SMTP_FROM || user

  return { host, port, secure, user, pass, from }
}

function buildTransporter(cfg: SmtpConfig) {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    // requireTLS forces STARTTLS on non-secure ports (587, 25)
    requireTLS: !cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
    // Connection and socket timeouts
    connectionTimeout: 10_000,
    socketTimeout: 20_000,
  })
}

// ─── SMTP connection test (used by settings UI) ───────────────────────────────
export async function testSmtpConnection(): Promise<{ ok: boolean; message: string }> {
  try {
    const cfg = getSmtpConfig()
    const transporter = buildTransporter(cfg)
    await transporter.verify()
    return {
      ok: true,
      message: `Connected to ${cfg.host}:${cfg.port} as ${cfg.user}`,
    }
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err)
    // Surface actionable diagnostics without exposing credentials
    const message = diagnoseSmtpError(raw)
    return { ok: false, message }
  }
}

function diagnoseSmtpError(raw: string): string {
  const lower = raw.toLowerCase()
  if (lower.includes('invalid login') || lower.includes('authentication failed') || lower.includes('535')) {
    return 'Authentication failed. Check your SMTP_USER and SMTP_PASS. For Gmail, use an App Password (not your account password).'
  }
  if (lower.includes('econnrefused')) {
    return 'Connection refused. Check that SMTP_HOST and SMTP_PORT are correct and the server is reachable.'
  }
  if (lower.includes('etimedout') || lower.includes('esockettimedout')) {
    return 'Connection timed out. The SMTP host may be unreachable or blocked by a firewall.'
  }
  if (lower.includes('enotfound')) {
    return 'Host not found. Check that SMTP_HOST is a valid hostname.'
  }
  if (lower.includes('self signed certificate') || lower.includes('certificate')) {
    return 'TLS certificate error. Try setting SMTP_SECURE=false or SMTP_PORT=587 for STARTTLS.'
  }
  if (lower.includes('starttls') || lower.includes('must issue a starttls')) {
    return 'The server requires STARTTLS. Set SMTP_PORT=587 and ensure SMTP_SECURE is not set to "true".'
  }
  if (lower.includes('missing') || lower.includes('not configured')) {
    return raw // Configuration errors are already descriptive
  }
  return `SMTP error: ${raw}`
}

// ─── Emoji and colour helpers ──────────────────────────────────────────────────
function getEmojiByCategoryOrName(category: string, name: string): string {
  const categoryEmojis: Record<string, string> = {
    entertainment: '🎬',
    streaming: '📺',
    music: '🎵',
    productivity: '📊',
    cloud: '☁️',
    storage: '💾',
    security: '🔒',
    vpn: '🛡️',
    fitness: '💪',
    education: '📚',
    design: '🎨',
    development: '💻',
    social: '👥',
    news: '📰',
    gaming: '🎮',
    shopping: '🛍️',
    travel: '✈️',
    food: '🍔',
    health: '⚕️',
    finance: '💰',
  }

  const nameEmojis: Record<string, string> = {
    netflix: '🎬',
    spotify: '🎵',
    youtube: '📺',
    adobe: '🎨',
    microsoft: '💻',
    google: '🔍',
    dropbox: '💾',
    slack: '💬',
    github: '🐙',
    figma: '🎨',
    notion: '📝',
    canva: '🎨',
    chatgpt: '🤖',
    claude: '🤖',
    grammarly: '✍️',
    zoom: '📹',
    discord: '💬',
    twitch: '🎮',
    hulu: '📺',
    disney: '🎭',
    amazon: '📦',
    apple: '🍎',
    aws: '☁️',
    heroku: '☁️',
    vercel: '▲',
    asana: '✅',
    monday: '📅',
    jira: '🐛',
    linear: '📋',
  }

  const lowerName = name.toLowerCase()
  const lowerCategory = category.toLowerCase()

  return nameEmojis[lowerName] || categoryEmojis[lowerCategory] || '📦'
}

function getColorByCategory(category: string): string {
  const colors: Record<string, string> = {
    entertainment: '#ef4444',
    streaming: '#f97316',
    music: '#ec4899',
    productivity: '#3b82f6',
    cloud: '#06b6d4',
    storage: '#8b5cf6',
    security: '#10b981',
    vpn: '#14b8a6',
    fitness: '#f59e0b',
    education: '#6366f1',
    design: '#d946ef',
    development: '#0ea5e9',
    social: '#f43f5e',
    news: '#64748b',
    gaming: '#a855f7',
    shopping: '#ec4899',
    travel: '#f59e0b',
    food: '#f97316',
    health: '#10b981',
    finance: '#06b6d4',
  }

  return colors[category.toLowerCase()] || '#22c55e'
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// ─── Renewal reminder ──────────────────────────────────────────────────────────
export async function sendRenewalReminder({
  to,
  subscriptionName,
  amount,
  currency,
  renewalDate,
  daysUntilRenewal,
  category = 'other',
}: {
  to: string
  subscriptionName: string
  amount: number
  currency: string
  renewalDate: string
  daysUntilRenewal: number
  category?: string
}) {
  if (!isValidEmail(to)) {
    throw new Error(`Invalid email address: ${to}`)
  }

  if (amount < 0) {
    throw new Error('Amount cannot be negative')
  }

  const safeSubName = escapeHtml(subscriptionName)
  const safeRenewalDate = escapeHtml(renewalDate)
  const safeCurrency = escapeHtml(currency)
  const emoji = getEmojiByCategoryOrName(category, subscriptionName)
  const accentColor = getColorByCategory(category)
  const isUrgent = daysUntilRenewal === 1

  const subject = isUrgent
    ? `${emoji} ${safeSubName} renews TOMORROW`
    : `${emoji} ${safeSubName} renews in ${daysUntilRenewal} days`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                 margin: 0; padding: 0; background: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%);
                    border-radius: 12px 12px 0 0; padding: 32px 24px; text-align: center; color: white;">
          <div style="font-size: 48px; margin-bottom: 12px;">${emoji}</div>
          <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 8px;">${safeSubName}</h1>
          <p style="font-size: 16px; margin: 0; opacity: 0.9;">
            ${isUrgent ? 'Renews Tomorrow!' : `Renews in ${daysUntilRenewal} days`}
          </p>
        </div>

        <!-- Main Content -->
        <div style="background: white; border-radius: 0 0 12px 12px; padding: 32px 24px; margin-bottom: 20px;">
          <!-- Renewal Details -->
          <div style="background: #f9fafb; border-left: 4px solid ${accentColor}; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <p style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px;">Renewal Date</p>
                <p style="font-size: 16px; font-weight: 600; margin: 0; color: #1a1a1a;">${safeRenewalDate}</p>
              </div>
              <div>
                <p style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px;">Amount</p>
                <p style="font-size: 16px; font-weight: 600; margin: 0; color: ${accentColor};">${safeCurrency} ${amount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <!-- Action Message -->
          <div style="background: ${accentColor}11; border-radius: 8px; padding: 16px; margin-bottom: 24px; border: 1px solid ${accentColor}33;">
            <p style="margin: 0; color: #1a1a1a; font-size: 14px;">
              ${isUrgent
                ? `<strong>⚠️ Action needed:</strong> Your ${safeSubName} subscription renews tomorrow. Make sure you have sufficient funds or cancel if you no longer need it.`
                : `Your ${safeSubName} subscription will renew on ${safeRenewalDate}. Review your subscription to ensure it is still needed.`
              }
            </p>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://subsight-tracker.vercel.app'}/dashboard"
               style="background: ${accentColor}; color: white; padding: 14px 32px;
                      border-radius: 8px; text-decoration: none; font-weight: 600;
                      display: inline-block; font-size: 16px;">
              Manage Subscription →
            </a>
          </div>

          <!-- Footer note -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              You are receiving this reminder because you enabled renewal notifications for ${safeSubName}.
            </p>
          </div>
        </div>

        <!-- Subsight Branding -->
        <div style="text-align: center; padding: 16px;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            <strong>Subsight</strong> · Subscription Tracker
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    const cfg = getSmtpConfig()
    const transporter = buildTransporter(cfg)
    await transporter.sendMail({
      from: `"Subsight" <${cfg.from}>`,
      to,
      subject,
      html,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown SMTP error'
    // Log without exposing credentials
    console.error(`[Email] Failed to send renewal reminder to ${to}: ${diagnoseSmtpError(errorMessage)}`)
    throw error
  }
}
