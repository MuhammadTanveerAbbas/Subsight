export type Theme = 'dark' | 'light'
export type Plan = 'free' | 'pro'
export type SubscriptionTier = 'free' | 'pro'
export type SubStatus = 'active' | 'inactive' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete'
export type BillingCycle = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'one-time'
export type ExportFormat = 'json' | 'csv' | 'pdf'

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  subscription_tier: SubscriptionTier | null
  theme: string | null
  currency: string | null
  onboarding_done: boolean
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: string | null
  current_period_end: string | null
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  name: string
  provider: string | null
  category: string | null
  icon: string | null
  icon_url: string | null
  start_date: string | null
  next_renewal_date: string | null
  billing_cycle: BillingCycle
  amount: number
  currency: string | null
  notes: string | null
  status: string | null
  active_status: boolean
  auto_renew: boolean
  usage_count: number | null
  last_used: string | null
  reminder_enabled: boolean
  reminder_days_before: number
  last_reminder_sent: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string | null
  name: string
  color: string
  is_system: boolean
  created_at: string
}

export interface SpendingGoal {
  id: string
  user_id: string
  period: 'Monthly' | 'Annual'
  amount: number
  currency: string
  created_at: string
  updated_at: string
}

export interface AISummary {
  id: string
  user_id: string
  content: string
  model: string
  total_monthly: number | null
  generated_at: string
  expires_at: string
}

export interface NotificationSettings {
  user_id: string
  renewal_alerts: boolean
  weekly_summary: boolean
  budget_warnings: boolean
  alert_days_before: number
  updated_at: string
}

export interface ExportLog {
  id: string
  user_id: string
  format: ExportFormat
  row_count: number | null
  created_at: string
}

export interface ProcessedWebhookEvent {
  id: string
  processed_at: string
}
