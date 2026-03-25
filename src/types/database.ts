export type Theme    = 'dark' | 'light';
export type Plan     = 'free' | 'pro';
export type SubStatus = 'active' | 'inactive' | 'warning' | 'renewal_passed';
export type BillingCycle = 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annually';
export type ExportFormat = 'json' | 'csv' | 'pdf';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: Plan;
  theme: Theme;
  currency: string;
  onboarding_done: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  billing_cycle: BillingCycle;
  category: string | null;
  provider: string | null;
  start_date: string | null;
  next_renewal_date: string | null;
  status: SubStatus;
  auto_renew: boolean;
  currency: string;
  notes: string | null;
  icon_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  color: string;
  is_system: boolean;
  created_at: string;
}

export interface SpendingGoal {
  id: string;
  user_id: string;
  period: 'Monthly' | 'Annual';
  amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface AISummary {
  id: string;
  user_id: string;
  content: string;
  model: string;
  total_monthly: number | null;
  generated_at: string;
  expires_at: string;
}

export interface NotificationSettings {
  user_id: string;
  renewal_alerts: boolean;
  weekly_summary: boolean;
  budget_warnings: boolean;
  alert_days_before: number;
  updated_at: string;
}

export interface ExportLog {
  id: string;
  user_id: string;
  format: ExportFormat;
  row_count: number | null;
  created_at: string;
}
