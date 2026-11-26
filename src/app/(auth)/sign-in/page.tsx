"use client";

import { useEffect, useState } from "react";
import { Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  SubmitButton,
  authMono,
} from "@/components/auth/auth-ui";

export default function SignInPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [globalErr, setGlobal] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace("/dashboard");
    });
  }, [supabase, router]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!email) next.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = "Invalid email address";
    if (!password) next.password = "Password is required";
    else if (password.length < 6) next.password = "At least 6 characters required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setGlobal("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/dashboard");
    } catch (e: unknown) {
      setGlobal(e instanceof Error ? e.message : "Sign in failed. Check your credentials.");
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

  return (
    <AuthShell>
      <AuthCard>
        <FormHeading title="Sign in" subtitle="Sign in to your Subsight account" />
        {globalErr && <ErrorBanner msg={globalErr} />}
        <div className="flex flex-col gap-4">
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
          <AuthField
            label="Password"
            Icon={Lock}
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={setPassword}
            error={errors.password}
            autoComplete="current-password"
          />
          <div className="-mt-1 text-right">
            <Link
              href="/forgot-password"
              className="text-[12px] underline-offset-2 hover:underline"
              style={{ ...authMono, color: "var(--green-ink)" }}
            >
              Forgot password?
            </Link>
          </div>
          <SubmitButton label="Sign in" loading={loading} onClick={handleSubmit} />
          <OrDivider />
          <GoogleButton onClick={handleGoogle} />
        </div>
        <AuthFooter>
          <p className="text-center text-[12.5px]" style={{ ...authMono, color: "var(--text3)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="font-medium" style={{ color: "var(--green-ink)" }}>
              Sign up free
            </Link>
          </p>
          <AuthLegal />
        </AuthFooter>
      </AuthCard>
    </AuthShell>
  );
}
