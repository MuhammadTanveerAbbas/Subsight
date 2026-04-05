-- ============================================================
-- Subsight  Full Database Schema
-- Last updated: 2026-03-24
-- ============================================================
-- Run this file only on a fresh database.
-- For existing databases, run only the [APPLY] ALTER statements
-- in schema.md via the Supabase SQL Editor.
-- ============================================================

-- Drop existing tables (fresh install only)
DROP TABLE IF EXISTS notification_settings CASCADE;
DROP TABLE IF EXISTS export_logs CASCADE;
DROP TABLE IF EXISTS ai_summaries CASCADE;
DROP TABLE IF EXISTS spending_goals CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS processed_webhook_events CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================================
-- profiles
-- ============================================================
CREATE TABLE profiles (
  id                  UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email               TEXT,
  full_name           TEXT,
  avatar_url          TEXT,
  plan                TEXT        DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  theme               TEXT        DEFAULT 'dark',
  currency            TEXT        DEFAULT 'USD',
  onboarding_done     BOOLEAN     DEFAULT false,
  stripe_customer_id      TEXT    UNIQUE,
  stripe_subscription_id  TEXT    UNIQUE,
  subscription_status     TEXT    DEFAULT 'inactive',
  current_period_end      TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- subscriptions
-- ============================================================
CREATE TABLE subscriptions (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name                TEXT        NOT NULL,
  provider            TEXT,
  category            TEXT,
  icon                TEXT        DEFAULT 'default',
  icon_url            TEXT,
  start_date          DATE,
  next_renewal_date   DATE,
  billing_cycle       TEXT        NOT NULL CHECK (billing_cycle IN ('Daily','Weekly','Monthly','Quarterly','Annually','monthly','yearly','one-time')),
  amount              NUMERIC(10,2) NOT NULL,
  currency            TEXT        DEFAULT 'USD',
  notes               TEXT,
  status              TEXT        DEFAULT 'active' CHECK (status IN ('active','inactive','warning','renewal_passed')),
  active_status       BOOLEAN     DEFAULT true,
  auto_renew          BOOLEAN     DEFAULT true,
  usage_count         INTEGER     DEFAULT 0,
  last_used           TIMESTAMPTZ,
  reminder_enabled    BOOLEAN     DEFAULT false,
  reminder_days_before INTEGER    DEFAULT 3 CHECK (reminder_days_before IN (1,3,7,14)),
  last_reminder_sent  TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- categories
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  color       TEXT        DEFAULT '#22c55e',
  is_system   BOOLEAN     DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- ============================================================
-- spending_goals
-- ============================================================
CREATE TABLE IF NOT EXISTS spending_goals (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  period      TEXT        NOT NULL DEFAULT 'Monthly' CHECK (period IN ('Monthly','Annual')),
  amount      NUMERIC(10,2) NOT NULL,
  currency    TEXT        NOT NULL DEFAULT 'USD',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ai_summaries
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_summaries (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content       TEXT        NOT NULL,
  model         TEXT        DEFAULT 'openai/gpt-oss-120b',
  total_monthly NUMERIC(10,2),
  generated_at  TIMESTAMPTZ DEFAULT NOW(),
  expires_at    TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

-- ============================================================
-- export_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS export_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  format      TEXT        NOT NULL CHECK (format IN ('json','csv','pdf')),
  row_count   INT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- notification_settings
-- ============================================================
CREATE TABLE IF NOT EXISTS notification_settings (
  user_id             UUID    PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  renewal_alerts      BOOLEAN DEFAULT true,
  weekly_summary      BOOLEAN DEFAULT true,
  budget_warnings     BOOLEAN DEFAULT true,
  alert_days_before   INT     DEFAULT 3,
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- processed_webhook_events
-- ============================================================
CREATE TABLE processed_webhook_events (
  id            TEXT        PRIMARY KEY,
  processed_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE profiles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories              ENABLE ROW LEVEL SECURITY;
ALTER TABLE spending_goals          ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_summaries            ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_logs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_webhook_events ENABLE ROW LEVEL SECURITY;

-- profiles policies
CREATE POLICY "Users can view own profile"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- subscriptions policies
CREATE POLICY "Users can view own subscriptions"   ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own subscriptions" ON subscriptions FOR DELETE USING (auth.uid() = user_id);

-- categories policy
CREATE POLICY "Users manage own categories" ON categories FOR ALL USING (auth.uid() = user_id);

-- spending_goals policy
CREATE POLICY "Users manage own goals" ON spending_goals FOR ALL USING (auth.uid() = user_id);

-- ai_summaries policy
CREATE POLICY "Users access own summaries" ON ai_summaries FOR ALL USING (auth.uid() = user_id);

-- export_logs policy
CREATE POLICY "Users access own export logs" ON export_logs FOR ALL USING (auth.uid() = user_id);

-- notification_settings policy
CREATE POLICY "Users manage own notifications" ON notification_settings FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- Functions & Triggers
-- ============================================================
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_spending_goals_updated_at
  BEFORE UPDATE ON spending_goals
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_notification_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_subscriptions_user_id       ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status        ON subscriptions(user_id, status);
CREATE INDEX idx_subscriptions_created_at    ON subscriptions(created_at);
CREATE INDEX idx_subscriptions_active_status ON subscriptions(active_status);
CREATE INDEX idx_subscriptions_category      ON subscriptions(category);
CREATE INDEX idx_subscriptions_renewal_date  ON subscriptions(next_renewal_date);
CREATE INDEX idx_ai_summaries_user_expires   ON ai_summaries(user_id, expires_at DESC);

-- ============================================================
-- Seed: system categories
-- ============================================================
INSERT INTO categories (user_id, name, color, is_system) VALUES
  (NULL, 'Entertainment',           '#ef4444', true),
  (NULL, 'Productivity & Software', '#3b82f6', true),
  (NULL, 'Cloud & Infrastructure',  '#f59e0b', true),
  (NULL, 'Design',                  '#8b5cf6', true),
  (NULL, 'Development',             '#22c55e', true),
  (NULL, 'Music',                   '#ec4899', true),
  (NULL, 'Finance & Business',      '#14b8a6', true),
  (NULL, 'Lifestyle & Health',      '#f97316', true),
  (NULL, 'Education',               '#06b6d4', true),
  (NULL, 'Other',                   '#6b7280', true)
ON CONFLICT DO NOTHING;
