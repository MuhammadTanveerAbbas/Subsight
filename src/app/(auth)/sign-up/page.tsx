"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Eye,
  EyeOff,
  ArrowRight,
  RefreshCw,
  PieChart,
  Check,
  Mail,
  Lock,
  User,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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
      <style>{`
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        a{color:inherit;text-decoration:none}
        input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus{-webkit-text-fill-color:inherit;transition:background-color 5000s ease-in-out 0s}
      `}</style>
      <div className="pointer-events-none absolute inset-0">
        <svg className="absolute inset-0 h-full w-full">
          <defs>
            <pattern id="dp2" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="var(--grid)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dp2)" />
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
        <Image src="/icon.svg" alt="Subsight" width={32} height={32} className="block rounded-lg" />
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

function Field({
  Icon,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
}: {
  Icon: React.ElementType;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <div>
      <div className="relative">
        <Icon
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: error ? "var(--red)" : "var(--text3)" }}
        />
        <input
          type={isPass ? (show ? "text" : "password") : type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg py-3 font-mono text-[13.5px] outline-none transition-[border-color] duration-200"
          style={{
            paddingLeft: 38,
            paddingRight: isPass ? 42 : 14,
            background: "var(--surface2)",
            border: `1px solid ${error ? "var(--red)" : "var(--border)"}`,
            color: "var(--text)",
          }}
          onFocus={(e) =>
            ((e.target as HTMLInputElement).style.borderColor = error
              ? "var(--red)"
              : "var(--green-border)")
          }
          onBlur={(e) =>
            ((e.target as HTMLInputElement).style.borderColor = error
              ? "var(--red)"
              : "var(--border)")
          }
        />
        {isPass && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 flex cursor-pointer border-none bg-transparent p-1"
            style={{ color: "var(--text3)" }}
          >
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 flex items-center gap-1 font-mono text-[11px]" style={{ color: "var(--red)" }}>
          <AlertCircle size={10} /> {error}
        </p>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
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

function Card({ children, width = 520 }: { children: React.ReactNode; width?: number }) {
  return (
    <div
      className="rounded-2xl p-9"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        width,
        maxWidth: "calc(100vw - 32px)",
        boxShadow: "0 32px 80px var(--shadow)",
      }}
    >
      {children}
    </div>
  );
}

function OrDivider() {
  return (
    <div className="flex items-center gap-3 my-1.5">
      <div className="h-px flex-1" style={{ background: "var(--border)" }} />
      <span className="font-mono text-[11px]" style={{ color: "var(--text3)" }}>or</span>
      <div className="h-px flex-1" style={{ background: "var(--border)" }} />
    </div>
  );
}

function SubmitBtn({
  label,
  loading,
  onClick,
}: {
  label: string;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
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
          (e.currentTarget as HTMLElement).style.background = "var(--green2)";
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
          Loading…
        </>
      ) : (
        <>
          {label} <ArrowRight size={14} />
        </>
      )}
    </button>
  );
}

function GoogleBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-lg border p-3 font-display text-[13px] font-semibold transition-colors duration-200"
      style={{
        background: "var(--surface2)",
        color: "var(--text)",
        borderColor: "var(--border2)",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLElement).style.borderColor = "var(--border2)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLElement).style.borderColor = "var(--border)")
      }
    >
      <GoogleIcon /> Continue with Google
    </button>
  );
}

export default function SignUpPage() {
  const t = useT();
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

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: unknown } }) => {
      if (user) router.replace("/dashboard");
    });
  }, [supabase, router]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Invalid email address";
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "Minimum 8 characters required";
    else if (!/(?=.*[A-Z])(?=.*[0-9])/.test(password))
      e.password = "Include at least one uppercase letter and one number";
    if (password !== confirm) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
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
      const msg = e instanceof Error ? e.message : "Sign up failed. Please try again.";
      setGlobal(msg);
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
        <Card>
          <div className="text-center">
            <div
              className="mx-auto mb-5 flex items-center justify-center"
              style={{
                width: 60,
                height: 60,
                borderRadius: 15,
                background: "var(--green-dim)",
                border: "1px solid var(--green-border)",
              }}
            >
              <Check size={26} style={{ color: "var(--green)" }} />
            </div>
            <h2
              className="font-display text-[22px] font-extrabold mb-2.5"
              style={{ color: "var(--text)" }}
            >
              Check your email
            </h2>
            <p
              className="font-mono text-[13px] leading-relaxed mb-6"
              style={{ color: "var(--text2)" }}
            >
              We sent a confirmation link to{" "}
              <strong style={{ color: "var(--text)" }}>{email}</strong>. Click it to
              activate your account.
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
        </Card>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <Card>
        <h1
          className="font-display text-[26px] font-extrabold tracking-tight mb-1.5"
          style={{ color: "var(--text)" }}
        >
          Create account
        </h1>
        <p
          className="font-mono text-[13px] mb-7"
          style={{ color: "var(--text3)" }}
        >
          Start tracking your subscriptions for free
        </p>
        {globalErr && <ErrBanner msg={globalErr} />}
        <div className="flex flex-col gap-3.5">
          <Field
            Icon={User}
            type="text"
            placeholder="Full name"
            value={name}
            onChange={setName}
            error={errors.name}
          />
          <Field
            Icon={Mail}
            type="email"
            placeholder="Email address"
            value={email}
            onChange={setEmail}
            error={errors.email}
          />
          <div>
            <Field
              Icon={Lock}
              type="password"
              placeholder="Password"
              value={password}
              onChange={setPassword}
              error={errors.password}
            />
            {password && (
              <div className="mt-2">
                <div className="flex gap-0.5 mb-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-0.5 flex-1 rounded-sm"
                      style={{
                        background: i <= strength ? strengthColor : "var(--surface3)",
                        transition: "background 0.3s",
                      }}
                    />
                  ))}
                </div>
                <span
                  className="font-mono text-[10px]"
                  style={{ color: strengthColor }}
                >
                  {strengthLabel}
                </span>
              </div>
            )}
          </div>
          <Field
            Icon={Lock}
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={setConfirm}
            error={errors.confirm}
          />
          <SubmitBtn
            label="Create Account"
            loading={loading}
            onClick={handleSubmit}
          />
          <OrDivider />
          <GoogleBtn onClick={handleGoogle} />
          <p
            className="text-center font-mono text-[11px] leading-relaxed"
            style={{ color: "var(--text3)" }}
          >
            By signing up you agree to our{" "}
            <Link href="/terms" style={{ color: "var(--green)" }}>
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" style={{ color: "var(--green)" }}>
              Privacy Policy
            </Link>
          </p>
        </div>
        <p
          className="mt-5.5 text-center font-mono text-[12.5px]"
          style={{ color: "var(--text3)" }}
        >
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold" style={{ color: "var(--green)" }}>
            Sign in
          </Link>
        </p>
      </Card>
    </AuthShell>
  );
}
