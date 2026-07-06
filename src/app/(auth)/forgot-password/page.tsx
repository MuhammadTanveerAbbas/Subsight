"use client";
import { useState } from "react";
import {
  ArrowRight,
  RefreshCw,
  PieChart,
  Mail,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
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
      <style>{`
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        a{color:inherit;text-decoration:none}
        input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus{-webkit-text-fill-color:inherit;transition:background-color 5000s ease-in-out 0s}
      `}</style>
      <div className="pointer-events-none absolute inset-0">
        <svg className="absolute inset-0 h-full w-full">
          <defs>
            <pattern id="dp3" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="var(--grid)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dp3)" />
        </svg>
      </div>
      <div
        className="pointer-events-none absolute"
        style={{
          top: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 560,
          height: 560,
          background: "radial-gradient(circle, var(--green-border) 0%, transparent 65%)",
        }}
      />
      <Link href="/" className="relative z-10 mb-8 flex items-center gap-2.5 no-underline">
        <img
          src="/icon.svg"
          alt="Subsight"
          width={32}
          height={32}
          className="block rounded-lg"
        />
        <span className="font-display text-xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>
          Subsight
        </span>
      </Link>
      <div className="relative z-10 animate-[fadeUp_0.6s_ease_both]">{children}</div>
      <p className="relative z-10 mt-7 text-center font-mono text-[11px]" style={{ color: "var(--text3)" }}>
        © 2025 Subsight ·{" "}
        <Link href="/privacy" className="transition-colors duration-200" style={{ color: "var(--text3)" }}>
          Privacy
        </Link>{" "}
        ·{" "}
        <Link href="/terms" className="transition-colors duration-200" style={{ color: "var(--text3)" }}>
          Terms
        </Link>
      </p>
    </div>
  );
}

function ErrBanner({ msg }: { msg: string }) {
  return (
    <div
      className="mb-5 flex items-center gap-2 rounded-lg p-2.5 font-mono text-[12px]"
      style={{
        background: "var(--red-dim)",
        border: "1px solid color-mix(in srgb, var(--red) 27%, transparent)",
        color: "var(--red)",
      }}
    >
      <AlertCircle size={13} className="shrink-0" /> {msg}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-9"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        width: 520,
        maxWidth: "calc(100vw - 32px)",
        boxShadow: "0 32px 80px var(--shadow)",
      }}
    >
      {children}
    </div>
  );
}

export default function ForgotPasswordPage() {
  const t = useT();
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
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        },
      );
      if (resetError) throw resetError;
      setSent(true);
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : "Failed to send reset email.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <Card>
        {sent ? (
          <div className="text-center">
            <div
              className="mx-auto mb-5 flex items-center justify-center"
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: "var(--green-dim)",
                border: "1px solid var(--green-border)",
              }}
            >
              <Mail size={22} style={{ color: "var(--green)" }} />
            </div>
            <h2
              className="font-display text-[22px] font-extrabold mb-2.5"
              style={{ color: "var(--text)" }}
            >
              Check your inbox
            </h2>
            <p
              className="font-mono text-[13px] leading-relaxed mb-6"
              style={{ color: "var(--text2)" }}
            >
              We sent a reset link to{" "}
              <strong style={{ color: "var(--text)" }}>{email}</strong>. Check your
              spam folder if you don&apos;t see it within a few minutes.
            </p>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-1.5 rounded-lg px-6 py-3 font-display text-[13px] font-bold"
              style={{
                background: "var(--green)",
                color: "#000",
              }}
            >
              Back to Sign In <ArrowRight size={12} />
            </Link>
          </div>
        ) : (
          <>
            <h1
              className="font-display text-[26px] font-extrabold tracking-tight mb-1.5"
              style={{ color: "var(--text)" }}
            >
              Forgot password?
            </h1>
            <p
              className="font-mono text-[13px] mb-7 leading-relaxed"
              style={{ color: "var(--text3)" }}
            >
              Enter your email and we&apos;ll send you a link to reset your
              password.
            </p>
            {error && <ErrBanner msg={error} />}
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Mail
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text3)" }}
                />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className="w-full rounded-lg py-3 font-mono text-[13.5px] outline-none transition-[border-color] duration-200"
                  style={{
                    paddingLeft: 38,
                    paddingRight: 14,
                    background: "var(--surface2)",
                    border: `1px solid ${error ? "var(--red)" : "var(--border)"}`,
                    color: "var(--text)",
                  }}
                  onFocus={(e) =>
                    ((e.target as HTMLInputElement).style.borderColor =
                      "var(--green-border)")
                  }
                  onBlur={(e) =>
                    ((e.target as HTMLInputElement).style.borderColor =
                      "var(--border)")
                  }
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-none p-3.5 font-display text-[14px] font-bold transition-all duration-200"
                style={{
                  background: "var(--green)",
                  color: "#000",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.75 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading)
                    (e.currentTarget as HTMLElement).style.background =
                      "var(--green2)";
                }}
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background = "var(--green)")
                }
              >
                {loading ? (
                  <>
                    <RefreshCw
                      size={14}
                      className="animate-spin"
                    />{" "}
                    Sending…
                  </>
                ) : (
                  <>
                    Send Reset Link <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
            <p
              className="mt-6 text-center font-mono text-[12.5px]"
              style={{ color: "var(--text3)" }}
            >
              Remember your password?{" "}
              <Link href="/sign-in" className="font-semibold" style={{ color: "var(--green)" }}>
                Sign in
              </Link>
            </p>
          </>
        )}
      </Card>
    </AuthShell>
  );
}
