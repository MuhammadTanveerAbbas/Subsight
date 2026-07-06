"use client";

import { useEffect, useState } from "react";
import { Mail, RefreshCw, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";
import { DARK_TOKENS, LIGHT_TOKENS } from "@/lib/design-tokens";

type T = Record<string, string>;

function useT(): T {
  const { theme } = useTheme();
  return theme === "dark" ? DARK_TOKENS : LIGHT_TOKENS;
}

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
      <div className="pointer-events-none absolute inset-0">
        <svg className="absolute inset-0 h-full w-full">
          <defs>
            <pattern id="dp-verify" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="var(--grid)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dp-verify)" />
        </svg>
      </div>
      <Link href="/" className="relative z-10 mb-8 flex items-center gap-2.5 no-underline">
        <img src="/icon.svg" alt="Subsight" width={32} height={32} className="block rounded-lg" />
        <span className="font-display text-xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>
          Subsight
        </span>
      </Link>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default function VerifyEmailPage() {
  const t = useT();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!loading && user?.emailConfirmed) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  const resend = async () => {
    if (!user?.email) return;
    setSending(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (resendError) throw resendError;
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send verification email");
    } finally {
      setSending(false);
    }
  };

  if (loading || !user) {
    return (
      <AuthShell>
        <RefreshCw size={24} className="animate-spin" style={{ color: t.green }} />
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div
        className="rounded-2xl p-9 text-center"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          width: 480,
          maxWidth: "calc(100vw - 32px)",
          boxShadow: "0 32px 80px var(--shadow)",
        }}
      >
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl"
          style={{
            background: "var(--green-dim)",
            border: "1px solid var(--green-border)",
          }}
        >
          <Mail size={22} style={{ color: "var(--green)" }} />
        </div>
        <h1 className="font-display text-[22px] font-extrabold tracking-tight" style={{ color: "var(--text)" }}>
          Verify your email
        </h1>
        <p className="mt-3 font-mono text-[13px] leading-relaxed" style={{ color: "var(--text2)" }}>
          We sent a confirmation link to{" "}
          <strong style={{ color: "var(--text)" }}>{user.email}</strong>.
          Click the link in your inbox to unlock your dashboard.
        </p>

        {error && (
          <div
            className="mt-5 flex items-center justify-center gap-2 rounded-lg p-2.5 font-mono text-[12px]"
            style={{
              background: "var(--red-dim)",
              border: "1px solid color-mix(in srgb, var(--red) 27%, transparent)",
              color: "var(--red)",
            }}
          >
            <AlertCircle size={13} /> {error}
          </div>
        )}

        {sent && (
          <div
            className="mt-5 flex items-center justify-center gap-2 rounded-lg p-2.5 font-mono text-[12px]"
            style={{
              background: "var(--green-dim)",
              border: "1px solid var(--green-border)",
              color: "var(--green)",
            }}
          >
            <CheckCircle2 size={13} /> Verification email sent — check your inbox.
          </div>
        )}

        <button
          onClick={resend}
          disabled={sending || sent}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg py-3 font-display text-[14px] font-bold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60"
          style={{ background: "var(--green)", color: "#000" }}
        >
          {sending ? (
            <>
              <RefreshCw size={14} className="animate-spin" /> Sending…
            </>
          ) : sent ? (
            "Email sent"
          ) : (
            <>
              Resend verification email <ArrowRight size={14} />
            </>
          )}
        </button>

        <button
          onClick={() => signOut()}
          className="mt-4 font-mono text-[12px] underline"
          style={{ color: "var(--text3)", background: "none", border: "none", cursor: "pointer" }}
        >
          Sign out and use a different account
        </button>
      </div>
    </AuthShell>
  );
}
