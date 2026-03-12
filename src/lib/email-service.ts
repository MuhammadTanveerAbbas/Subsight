import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // Always use TLS/SSL encryption
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

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

  return colors[category.toLowerCase()] || '#1a1a1a'
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

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

  const emoji = getEmojiByCategoryOrName(category, subscriptionName)
  const accentColor = getColorByCategory(category)
  const isUrgent = daysUntilRenewal === 1

  const subject = isUrgent
    ? `${emoji} ${subscriptionName} renews TOMORROW`
    : `${emoji} ${subscriptionName} renews in ${daysUntilRenewal} days`

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
          <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 8px;">${subscriptionName}</h1>
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
                <p style="font-size: 16px; font-weight: 600; margin: 0; color: #1a1a1a;">${renewalDate}</p>
              </div>
              <div>
                <p style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px;">Amount</p>
                <p style="font-size: 16px; font-weight: 600; margin: 0; color: ${accentColor};">${currency} ${amount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <!-- Action Message -->
          <div style="background: ${accentColor}11; border-radius: 8px; padding: 16px; margin-bottom: 24px; border: 1px solid ${accentColor}33;">
            <p style="margin: 0; color: #1a1a1a; font-size: 14px;">
              ${isUrgent 
                ? `<strong>⚠️ Action needed:</strong> Your ${subscriptionName} subscription will renew tomorrow. Make sure you have sufficient funds or cancel if you no longer need it.`
                : `Your ${subscriptionName} subscription will renew on ${renewalDate}. Review your subscription to ensure it's still needed.`
              }
            </p>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
               style="background: ${accentColor}; color: white; padding: 14px 32px; 
                      border-radius: 8px; text-decoration: none; font-weight: 600; 
                      display: inline-block; font-size: 16px; transition: opacity 0.2s;">
              Manage Subscription →
            </a>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              You're receiving this reminder because you enabled notifications for ${subscriptionName}.
            </p>
          </div>
        </div>

        <!-- Subsight Branding -->
        <div style="text-align: center; padding: 16px;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            <strong>Subsight</strong> • Subscription Tracker
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    await transporter.sendMail({
      from: `"Subsight" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      html,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown SMTP error'
    console.error(`[Email] Failed to send to ${to}:`, errorMessage)
    throw error
  }
}
