-- Migration: fix schema for existing databases
-- Run this in Supabase SQL Editor if you already have data

-- 1. Rename plan -> subscription_tier
ALTER TABLE profiles RENAME COLUMN plan TO subscription_tier;

-- 2. Normalize billing_cycle to lowercase
UPDATE subscriptions SET billing_cycle = LOWER(billing_cycle)
  WHERE billing_cycle IN ('Daily','Weekly','Monthly','Quarterly','Annually');
UPDATE subscriptions SET billing_cycle = 'annually'
  WHERE billing_cycle = 'yearly';

ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_billing_cycle_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_billing_cycle_check
  CHECK (billing_cycle IN ('daily','weekly','monthly','quarterly','annually','one-time'));

-- 3. Add handle_new_user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, subscription_tier)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'free')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
