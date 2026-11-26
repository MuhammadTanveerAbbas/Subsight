"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";
import {
  AuthCard,
  AuthField,
  AuthFooter,
  AuthLegal,
  AuthShell,
  ErrorBanner,
  FormHeading,
  GoogleButton,
  OrDivider,
  PrimaryLink,
  StatusView,
  SubmitButton,
  authMono,
} from "@/components/auth/auth-ui";

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [globalErr, setGlobal] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace("/dashboard");
    });
  }, [supabase, router]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Name is required";
    if (!email) next.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = "Invalid email address";
    if (!password) next.password = "Password is required";
    else if (password.length < 8) next.password = "Minimum 8 characters required";
    else if (!/(?=.*[A-Z])(?=.*[0-9])/.test(password))
      next.password = "Include at least one uppercase letter and one number";
    if (password !== confirm) next.confirm = "Passwords do not match";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const strength = (() => {
    if (!password) return 0;
    if (password.length < 6) return 1;
    if (password.length < 10) return 2;
    if (/(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/.test(password)) return 4;
    return 3;
  })();
  const strengthColor = ["", "#ef4444", "#f59e0b", "#22c55e", "#22c55e"][strength];
  const strengthLabel = ["", "Too short", "Fair", "Good", "Strong"][strength];

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setGlobal("");
    try {
      await signUp(email, password, name);
      setDone(true);
    } catch (e: unknown) {
      setGlobal(e instanceof Error ? e.message : "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  if (done) {
    return (
      <AuthShell>
        <AuthCard>
          <StatusView
            icon={Check}
            title="Check your email"
            description={
              <>
                We sent a confirmation link to <strong style={{ color: "var(--text)" }}>{email}</strong>.
                Open it to activate your account.
              </>
            }
          >
            <PrimaryLink href="/sign-in">Back to sign in <ArrowRight size={12} /></PrimaryLink>
          </StatusView>
        </AuthCard>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <AuthCard>
        <FormHeading title="Create account" subtitle="Start tracking your subscriptions for free" />
        {globalErr && <ErrorBanner msg={globalErr} />}
        <div className="flex flex-col gap-4">
          <AuthField
            label="Full name"
            Icon={User}
            placeholder="Your name"
            value={name}
            onChange={setName}
            error={errors.name}
            autoComplete="name"
          />
          <AuthField
            label="Email address"
            Icon={Mail}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={setEmail}
            error={errors.email}
            autoComplete="email"
            inputMode="email"
          />
          <div>
            <AuthField
              label="Password"
              Icon={Lock}
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={setPassword}
              error={errors.password}
              autoComplete="new-password"
            />
            {password && (
              <div className="mt-2">
                <div className="flex gap-1" aria-hidden="true">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-sm"
                      style={{
                        background: i <= strength ? strengthColor : "var(--surface3)",
                        transition: "background 0.3s",
                      }}
                    />
                  ))}
                </div>
                <span className="mt-1 block text-[11px]" style={{ ...authMono, color: strengthColor }}>
                  Password strength: {strengthLabel}
                </span>
              </div>
            )}
          </div>
          <AuthField
            label="Confirm password"
            Icon={Lock}
            type="password"
            placeholder="Repeat your password"
            value={confirm}
            onChange={setConfirm}
            error={errors.confirm}
            autoComplete="new-password"
          />
          <SubmitButton label="Create Account" loading={loading} onClick={handleSubmit} />
          <OrDivider />
          <GoogleButton onClick={handleGoogle} />
        </div>
        <AuthFooter>
          <p className="text-center text-[12.5px]" style={{ ...authMono, color: "var(--text3)" }}>
            Already have an account?{" "}
            <Link href="/sign-in" className="font-medium" style={{ color: "var(--green-ink)" }}>
              Sign in
            </Link>
          </p>
          <AuthLegal prefix="By signing up you agree to our" />
        </AuthFooter>
      </AuthCard>
    </AuthShell>
  );
}
