"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Mail, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";
import {
  AuthCard,
  AuthShell,
  ErrorBanner,
  PrimaryButton,
  StatusView,
  authMono,
} from "@/components/auth/auth-ui";

export default function VerifyEmailPage() {
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send verification email");
    } finally {
      setSending(false);
    }
  };

  if (loading || !user) {
    return (
      <AuthShell>
        <AuthCard>
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <RefreshCw size={22} className="animate-spin" style={{ color: "var(--green)" }} />
            <p className="text-[13px]" style={{ ...authMono, color: "var(--text2)" }}>
              Checking your account…
            </p>
          </div>
        </AuthCard>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <AuthCard>
        <StatusView
          icon={Mail}
          title="Verify your email"
          description={
            <>
              We sent a confirmation link to <strong style={{ color: "var(--text)" }}>{user.email}</strong>.
              Open it to access your dashboard.
            </>
          }
        >
          {error && <div className="mt-5"><ErrorBanner msg={error} /></div>}
          {sent && (
            <div
              role="status"
              className="mt-5 flex items-center justify-center gap-2 rounded-lg p-2.5 text-[12px]"
              style={{
                ...authMono,
                background: "var(--green-dim)",
                border: "1px solid var(--green-border)",
                color: "var(--green)",
              }}
            >
              <CheckCircle2 size={13} /> Verification email sent. Check your inbox.
            </div>
          )}
          <div className="mt-6">
            <PrimaryButton onClick={resend} loading={sending} disabled={sent}>
              {sending ? "Sending…" : sent ? "Email sent" : "Resend verification email"}
              {!sending && !sent && <ArrowRight size={15} />}
            </PrimaryButton>
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            className="mt-4 text-[12px] underline underline-offset-2"
            style={{ ...authMono, color: "var(--text3)", background: "none", border: "none", cursor: "pointer" }}
          >
            Sign out and use a different account
          </button>
        </StatusView>
      </AuthCard>
    </AuthShell>
  );
}
