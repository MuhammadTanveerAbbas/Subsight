"use client";
import { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  ArrowRight,
  RefreshCw,
  Mail,
  Lock,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { createClient } from "@/lib/supabase/client";
import { DARK_TOKENS, LIGHT_TOKENS } from "@/lib/design-tokens";

type T = Record<string, string>;

function useT(): T {
  const { theme } = useTheme();
  return theme === "dark" ? DARK_TOKENS : LIGHT_TOKENS;
}

function AuthShell({ t, children }: { t: T; children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
      <div className="pointer-events-none absolute inset-0">
        <svg className="absolute inset-0 h-full w-full">
          <defs>
            <pattern id="dp" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="var(--grid)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dp)" />
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
          background: `radial-gradient(circle, var(--green-border) 0%, transparent 65%)`,
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
        <Link href="/privacy" className="transition-colors duration-200 hover:opacity-75" style={{ color: "var(--text3)" }}>
          Privacy
        </Link>{" "}
        ·{" "}
        <Link href="/terms" className="transition-colors duration-200 hover:opacity-75" style={{ color: "var(--text3)" }}>
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
          className="w-full rounded-lg py-3 pr-3.5 font-mono text-[13.5px] outline-none transition-[border-color] duration-200"
          style={{
            paddingLeft: 38,
            paddingRight: isPass ? 42 : 14,
            background: "var(--surface2)",
            border: `1px solid ${error ? "var(--red)" : "var(--border)"}`,
            color: "var(--text)",
          }}
          onFocus={(e) => {
            (e.target as HTMLInputElement).style.borderColor = error ? "var(--red)" : "var(--green-border)";
          }}
          onBlur={(e) => {
            (e.target as HTMLInputElement).style.borderColor = error ? "var(--red)" : "var(--border)";
          }}
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
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
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
  disabled,
  onClick,
}: {
  label: string;
  loading: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className="flex w-full items-center justify-center gap-2 rounded-lg border-none p-3.5 font-display text-[14px] font-bold transition-all duration-200"
      style={{
        background: "var(--green)",
        color: "#000",
        cursor: loading || disabled ? "not-allowed" : "pointer",
        opacity: loading || disabled ? 0.75 : 1,
      }}
      onMouseEnter={(e) => {
        if (!loading && !disabled) (e.currentTarget as HTMLElement).style.background = "var(--green2)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "var(--green)";
      }}
    >
      {loading ? (
        <><RefreshCw size={14} className="animate-spin" /> Loading…</>
      ) : (
        <>{label} <ArrowRight size={14} /></>
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
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border2)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
      }}
    >
      <GoogleIcon /> Continue with Google
    </button>
  );
}

export default function SignInPage() {
  const t = useT();
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
  }, []);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Invalid email address";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "At least 6 characters required";
    setErrors(e);
    return Object.keys(e).length === 0;
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
    <AuthShell t={t}>
      <Card>
        <h1
          className="font-display text-[26px] font-extrabold tracking-tight mb-1.5"
          style={{ color: "var(--text)" }}
        >
          Welcome back
        </h1>
        <p className="font-mono text-[13px] mb-7" style={{ color: "var(--text3)" }}>
          Sign in to your Subsight account
        </p>
        {globalErr && <ErrBanner msg={globalErr} />}
        <div className="flex flex-col gap-3.5">
          <Field Icon={Mail} type="email" placeholder="Email address" value={email} onChange={setEmail} error={errors.email} />
          <Field Icon={Lock} type="password" placeholder="Password" value={password} onChange={setPassword} error={errors.password} />
          <div className="text-right -mt-1">
            <Link href="/forgot-password" className="font-mono text-[12px] transition-opacity duration-200 hover:opacity-75" style={{ color: "var(--green)" }}>
              Forgot password?
            </Link>
          </div>
          <SubmitBtn label="Sign In" loading={loading} onClick={handleSubmit} />
          <OrDivider />
          <GoogleBtn onClick={handleGoogle} />
        </div>
        <p className="mt-6 text-center font-mono text-[12.5px]" style={{ color: "var(--text3)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-semibold hover:opacity-75" style={{ color: "var(--green)" }}>
            Sign up free
          </Link>
        </p>
      </Card>
    </AuthShell>
  );
}
