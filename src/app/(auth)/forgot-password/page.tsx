"use client";

import { useState } from "react";
import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  AuthCard,
  AuthField,
  AuthFooter,
  AuthLegal,
  AuthShell,
  ErrorBanner,
  FormHeading,
  PrimaryButton,
  PrimaryLink,
  StatusView,
  authMono,
} from "@/components/auth/auth-ui";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
      });
      if (resetError) throw resetError;
      setSent(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <AuthCard>
        {sent ? (
          <StatusView
            icon={Mail}
            title="Check your inbox"
            description={
              <>
                We sent a reset link to <strong style={{ color: "var(--text)" }}>{email}</strong>.
                Check your spam folder if you don&apos;t see it within a few minutes.
              </>
            }
          >
            <PrimaryLink href="/sign-in">Back to Sign In <ArrowRight size={12} /></PrimaryLink>
          </StatusView>
        ) : (
          <>
            <FormHeading
              title="Forgot password?"
              subtitle="Enter your email to reset your password."
            />
            {error && <ErrorBanner msg={error} />}
            <div className="flex flex-col gap-4">
              <AuthField
                label="Email address"
                Icon={Mail}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(value) => {
                  setEmail(value);
                  setError("");
                }}
                error={error}
                autoComplete="email"
                inputMode="email"
              />
              <PrimaryButton onClick={handleSubmit} loading={loading}>
                {loading ? "Sending…" : "Send Reset Link"}
                {!loading && <ArrowRight size={15} />}
              </PrimaryButton>
            </div>
            <AuthFooter>
              <p className="text-center text-[12.5px]" style={{ ...authMono, color: "var(--text3)" }}>
                Remember your password?{" "}
                <Link href="/sign-in" className="font-bold" style={{ color: "var(--green)" }}>
                  Sign in
                </Link>
              </p>
              <AuthLegal />
            </AuthFooter>
          </>
        )}
      </AuthCard>
    </AuthShell>
  );
}
