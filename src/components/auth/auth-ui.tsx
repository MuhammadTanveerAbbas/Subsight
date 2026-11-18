"use client";

import {
  useId,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Moon,
  RefreshCw,
  Sun,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

/* The project defines --font-display and --font-mono through next/font.
   These helpers keep every auth page on the same two families. */
export const authDisplay = {
  fontFamily: "var(--font-display), system-ui, sans-serif",
} as const;
export const authMono = {
  fontFamily: "var(--font-mono), ui-monospace, monospace",
} as const;

/** Theme switch floats at the top right of the viewport, as on the other pages. */
function AuthThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
      className="fixed right-4 top-4 z-50 flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-200"
      style={{
        background: "var(--surface2)",
        border: "1px solid var(--border2)",
        color: "var(--text2)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--green-border)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border2)";
      }}
    >
      {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  );
}

/** Full page background, dot grid and centred column. No horizontal scroll. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center px-4 py-10 sm:px-6"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      <AuthThemeToggle />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <svg className="h-full w-full">
          <defs>
            <pattern id="auth-dot-grid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="var(--grid)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-dot-grid)" />
        </svg>
      </div>
      <div className="relative z-10 w-full min-w-0 max-w-[420px] animate-[fadeUp_0.5s_ease_both]">
        {children}
      </div>
    </div>
  );
}

/** One card for every auth screen. Brand is centered at the top. */
export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-2xl p-5 sm:p-8"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div
        className="mb-6 flex flex-col items-center gap-2 border-b pb-6"
        style={{ borderColor: "var(--border)" }}
      >
        <Link href="/" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
          <Image src="/icon.svg" alt="" width={28} height={28} className="block rounded-lg" loading="eager" />
          <span className="text-[19px] font-bold tracking-tight" style={{ ...authDisplay, color: "var(--text)" }}>
            Subsight
          </span>
        </Link>
        <p className="text-center text-[11px] leading-snug" style={{ ...authMono, color: "var(--text3)" }}>
          Subscription tracker with AI-powered insights
        </p>
      </div>
      {children}
    </div>
  );
}

/** Left aligned title and helper line used above every form. */
export function FormHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-[24px] font-bold leading-tight tracking-tight" style={{ ...authDisplay, color: "var(--text)" }}>
        {title}
      </h1>
      <p className="mt-1.5 text-[13px] leading-relaxed" style={{ ...authMono, color: "var(--text3)" }}>
        {subtitle}
      </p>
    </div>
  );
}

type FieldProps = {
  label: string;
  Icon: ElementType;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "numeric";
};

/** Labelled input with leading icon, inline error and a real focus ring. */
export function AuthField({
  label,
  Icon,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  autoComplete,
  inputMode,
}: FieldProps) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[12px]" style={{ ...authMono, color: "var(--text2)" }}>
        {label}
      </label>
      <div className="relative">
        <Icon
          size={15}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
          style={{ color: error ? "var(--red)" : "var(--text3)" }}
          aria-hidden="true"
        />
        <input
          id={id}
          type={isPassword ? (show ? "text" : "password") : type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          inputMode={inputMode}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="block w-full rounded-lg py-3 text-base outline-none transition-[border-color,box-shadow] duration-200 sm:text-[14px]"
          style={{
            ...authMono,
            paddingLeft: 40,
            paddingRight: isPassword ? 42 : 14,
            background: "var(--surface2)",
            color: "var(--text)",
            border: `1px solid ${error ? "var(--red)" : "var(--border)"}`,
          }}
          onFocus={(e) => {
            const input = e.currentTarget;
            if (error) {
              input.style.borderColor = "var(--red)";
              input.style.boxShadow = "0 0 0 3px var(--red-dim)";
            }
          }}
          onBlur={(e) => {
            const input = e.currentTarget;
            input.style.borderColor = error ? "var(--red)" : "var(--border)";
            input.style.boxShadow = "none";
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((value) => !value)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md"
            style={{ color: "var(--text3)" }}
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 flex items-center gap-1 text-[12px]" style={{ ...authMono, color: "var(--red)" }}>
          <AlertCircle size={11} className="shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

/** Shared primary button. Disabled only while work is in progress. */
export function PrimaryButton({
  onClick,
  type = "button",
  loading = false,
  disabled = false,
  children,
}: {
  onClick?: () => void;
  type?: "button" | "submit";
  loading?: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  const inactive = loading || disabled;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={inactive}
      className="flex w-full items-center justify-center gap-2 rounded-lg border-none py-3.5 text-[14px] font-bold transition-colors duration-200"
      style={{
        ...authDisplay,
        background: "var(--green)",
        color: "#0a0a0a",
        cursor: inactive ? "not-allowed" : "pointer",
        opacity: inactive ? 0.7 : 1,
      }}
      onMouseEnter={(e) => {
        if (!inactive) e.currentTarget.style.background = "var(--green2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--green)";
      }}
    >
      {loading ? <RefreshCw size={15} className="animate-spin" /> : null}
      {children}
    </button>
  );
}

export function SubmitButton({
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
    <PrimaryButton onClick={onClick} loading={loading} disabled={disabled}>
      {loading ? "Loading…" : label}
      {!loading && <ArrowRight size={15} />}
    </PrimaryButton>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export function GoogleButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2.5 rounded-lg border p-3 text-[13px] font-semibold transition-colors duration-200"
      style={{
        ...authDisplay,
        background: "var(--surface2)",
        color: "var(--text)",
        borderColor: "var(--border2)",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--green-border)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border2)";
      }}
    >
      <GoogleIcon /> Continue with Google
    </button>
  );
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1" style={{ background: "var(--border)" }} />
      <span className="text-[11px]" style={{ ...authMono, color: "var(--text3)" }}>or</span>
      <div className="h-px flex-1" style={{ background: "var(--border)" }} />
    </div>
  );
}

export function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div
      role="alert"
      className="mb-5 flex items-start gap-2 rounded-lg p-2.5 text-[12px]"
      style={{
        ...authMono,
        background: "var(--red-dim)",
        border: "1px solid color-mix(in srgb, var(--red) 27%, transparent)",
        color: "var(--red)",
      }}
    >
      <AlertCircle size={13} className="mt-0.5 shrink-0" /> <span>{msg}</span>
    </div>
  );
}

/** Centered footer with a top rule, used on every auth page. */
export function AuthFooter({ children }: { children: ReactNode }) {
  return (
    <div
      className="mt-6 flex flex-col items-center gap-2 border-t pt-5"
      style={{ borderColor: "var(--border)" }}
    >
      {children}
    </div>
  );
}

/** Centered icon, title and message for success, verification and error states. */
export function StatusView({
  icon: Icon,
  title,
  description,
  tone = "success",
  children,
}: {
  icon: ElementType;
  title: string;
  description: ReactNode;
  tone?: "success" | "error";
  children?: ReactNode;
}) {
  const accent = tone === "error" ? "var(--red)" : "var(--green)";
  const dim = tone === "error" ? "var(--red-dim)" : "var(--green-dim)";
  const outline =
    tone === "error"
      ? "color-mix(in srgb, var(--red) 22%, transparent)"
      : "var(--green-border)";

  return (
    <div className="text-center">
      <div
        className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl"
        style={{ background: dim, border: `1px solid ${outline}` }}
      >
        <Icon size={22} style={{ color: accent }} />
      </div>
      <h1 className="text-[22px] font-bold leading-tight" style={{ ...authDisplay, color: "var(--text)" }}>
        {title}
      </h1>
      <div className="mt-3 text-[13px] leading-relaxed" style={{ ...authMono, color: "var(--text2)" }}>
        {description}
      </div>
      {children}
    </div>
  );
}

/** Primary action that is a link, used after a status view. */
export function PrimaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="mt-6 inline-flex items-center justify-center gap-1.5 rounded-lg px-6 py-3 text-[13px] font-bold"
      style={{ ...authDisplay, background: "var(--green)", color: "#0a0a0a" }}
    >
      {children}
    </Link>
  );
}

/** Legal line shared by every auth footer. */
export function AuthLegal({ prefix }: { prefix?: ReactNode }) {
  return (
    <p className="text-center text-[11px] leading-relaxed" style={{ ...authMono, color: "var(--text3)" }}>
      {prefix && <span className="block">{prefix}</span>}
      <span className="block">
        <Link href="/privacy" className="underline underline-offset-2">Privacy</Link>
        {" · "}
        <Link href="/terms" className="underline underline-offset-2">Terms</Link>
        {" · © 2026 Subsight"}
      </span>
    </p>
  );
}
