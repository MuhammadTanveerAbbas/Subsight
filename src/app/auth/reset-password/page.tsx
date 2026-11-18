"use client";

import { useState } from "react";
import { ArrowRight, Check, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  AuthCard,
  AuthField,
  AuthShell,
  ErrorBanner,
  FormHeading,
  PrimaryLink,
  StatusView,
  SubmitButton,
} from "@/components/auth/auth-ui";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const onSubmit = async () => {
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <AuthCard>
        {done ? (
          <StatusView
            icon={Check}
            title="Password updated"
            description="Your password has been changed. Use it the next time you sign in."
          >
            <PrimaryLink href="/dashboard">Go to Dashboard <ArrowRight size={12} /></PrimaryLink>
          </StatusView>
        ) : (
          <>
            <FormHeading
              title="Set a new password"
              subtitle="Choose a strong password with at least 8 characters."
            />
            {error && <ErrorBanner msg={error} />}
            <div className="flex flex-col gap-4">
              <AuthField
                label="New password"
                Icon={Lock}
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={setPassword}
                autoComplete="new-password"
              />
              <AuthField
                label="Confirm password"
                Icon={Lock}
                type="password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                autoComplete="new-password"
              />
              <SubmitButton label="Update password" loading={loading} onClick={onSubmit} />
            </div>
          </>
        )}
      </AuthCard>
    </AuthShell>
  );
}
