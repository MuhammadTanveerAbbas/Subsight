"use client";
import { useState } from "react";
import { ArrowRight, RefreshCw, PieChart, Mail, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { createClient } from "@/lib/supabase/client";

const DARK = {
  bg:"#080808", surface:"#111111", surface2:"#181818",
  border:"#1f1f1f", border2:"#2a2a2a",
  text:"#f0f0f0", text2:"#a0a0a0", text3:"#585858",
  green:"#22c55e", green2:"#16a34a",
  greenDim:"rgba(34,197,94,0.08)", greenBorder:"rgba(34,197,94,0.22)",
  red:"#ef4444", redDim:"rgba(239,68,68,0.10)",
  grid:"rgba(255,255,255,0.025)", shadow:"rgba(0,0,0,0.7)",
  onGreen:"#000000",
} as const;
const LIGHT = {
  bg:"#f8f8f6", surface:"#ffffff", surface2:"#f2f2ef",
  border:"#e4e4e0", border2:"#d0d0ca",
  text:"#111111", text2:"#545450", text3:"#888880",
  green:"#16a34a", green2:"#15803d",
  greenDim:"rgba(22,163,74,0.08)", greenBorder:"rgba(22,163,74,0.22)",
  red:"#dc2626", redDim:"rgba(220,38,38,0.10)",
  grid:"rgba(0,0,0,0.04)", shadow:"rgba(0,0,0,0.12)",
  onGreen:"#000000",
} as const;
type T = typeof DARK | typeof LIGHT;

function AuthShell({ t, children }: { t: T; children: React.ReactNode }) {
  return (
    <div style={{ minHeight:"100vh", background:t.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 16px", position:"relative", overflow:"hidden", transition:"background 0.4s" }}>
      <style>{`
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        a{color:inherit;text-decoration:none}
        input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus{-webkit-text-fill-color:inherit;transition:background-color 5000s ease-in-out 0s}
      `}</style>
      <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
        <svg width="100%" height="100%" style={{ position:"absolute", inset:0 }}>
          <defs><pattern id="dp3" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill={t.grid}/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#dp3)"/>
        </svg>
      </div>
      <div style={{ position:"absolute", top:"-20%", left:"50%", transform:"translateX(-50%)", width:560, height:560, background:`radial-gradient(circle, ${t.greenBorder} 0%, transparent 65%)`, pointerEvents:"none" }}/>
      <Link href="/" style={{ display:"flex", alignItems:"center", gap:9, marginBottom:32, position:"relative", zIndex:1, textDecoration:"none" }}>
        <img src="/icon.svg" alt="Subsight" width={32} height={32} style={{ borderRadius:8, display:"block" }} />
        <span style={{ fontFamily:"var(--font-display)", fontSize:20, fontWeight:800, color:t.text, letterSpacing:-0.5 }}>Subsight</span>
      </Link>
      <div style={{ position:"relative", zIndex:1, animation:"fadeUp 0.6s ease both" }}>{children}</div>
      <p style={{ fontSize:11, color:t.text3, fontFamily:"var(--font-mono)", marginTop:28, textAlign:"center", position:"relative", zIndex:1 }}>
        © 2025 Subsight ·{" "}
        <Link href="/privacy" style={{ color:t.text3, transition:"color 0.2s" }} onMouseEnter={e=>(e.currentTarget.style.color=t.green)} onMouseLeave={e=>(e.currentTarget.style.color=t.text3)}>Privacy</Link>
        {" "}·{" "}
        <Link href="/terms" style={{ color:t.text3, transition:"color 0.2s" }} onMouseEnter={e=>(e.currentTarget.style.color=t.green)} onMouseLeave={e=>(e.currentTarget.style.color=t.text3)}>Terms</Link>
      </p>
    </div>
  );
}

function ErrBanner({ msg, t }: { msg: string; t: T }) {
  return (
    <div style={{ background:t.redDim, border:`1px solid ${t.red}44`, borderRadius:8, padding:"11px 14px", fontSize:12, color:t.red, fontFamily:"var(--font-mono)", marginBottom:20, display:"flex", alignItems:"center", gap:8 }}>
      <AlertCircle size={13} style={{ flexShrink:0 }}/> {msg}
    </div>
  );
}

function Card({ t, children }: { t: T; children: React.ReactNode }) {
  return (
    <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:16, padding:"36px 32px", width:"100%", maxWidth:480, boxShadow:`0 32px 80px ${t.shadow}` }}>
      {children}
    </div>
  );
}

export default function ForgotPasswordPage() {
  const { theme } = useTheme();
  const t = theme === "dark" ? DARK : LIGHT;
  const supabase = createClient();

  const [email,   setEmail]   = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) { setError("Enter a valid email address"); return; }
    setLoading(true); setError("");
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      if (resetError) throw resetError;
      setSent(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to send reset email.";
      setError(msg);
    } finally { setLoading(false); }
  };

  return (
    <AuthShell t={t}>
      <Card t={t}>
        {sent ? (
          <div style={{ textAlign:"center" }}>
            <div style={{ width:56, height:56, borderRadius:14, background:t.greenDim, border:`1px solid ${t.greenBorder}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
              <Mail size={22} color={t.green}/>
            </div>
            <h2 style={{ fontFamily:"var(--font-display)", fontSize:22, fontWeight:800, color:t.text, marginBottom:10 }}>Check your inbox</h2>
            <p style={{ fontSize:13, color:t.text2, fontFamily:"var(--font-mono)", lineHeight:1.72, marginBottom:24 }}>
              We sent a reset link to <strong style={{ color:t.text }}>{email}</strong>. Check your spam folder if you don&apos;t see it within a few minutes.
            </p>
            <Link href="/sign-in" style={{ display:"inline-flex", background:t.green, color:t.onGreen, borderRadius:9, padding:"13px 24px", fontSize:13, fontWeight:700, fontFamily:"var(--font-display)", alignItems:"center", gap:7 }}>
              Back to Sign In <ArrowRight size={12}/>
            </Link>
          </div>
        ) : (
          <>
            <h1 style={{ fontFamily:"var(--font-display)", fontSize:26, fontWeight:800, color:t.text, letterSpacing:-0.8, marginBottom:6 }}>Forgot password?</h1>
            <p style={{ fontSize:13, color:t.text3, fontFamily:"var(--font-mono)", marginBottom:28, lineHeight:1.65 }}>
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>
            {error && <ErrBanner msg={error} t={t}/>}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ position:"relative" }}>
                <Mail size={14} color={t.text3} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
                <input
                  type="email" placeholder="Email address" value={email}
                  onChange={e => { setEmail(e.target.value); setError(""); }}
                  style={{ width:"100%", background:t.surface2, border:`1px solid ${error ? t.red+"66" : t.border}`, borderRadius:9, padding:"12px 14px 12px 38px", fontSize:13.5, color:t.text, fontFamily:"var(--font-mono)", outline:"none", transition:"border-color 0.2s" }}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = t.greenBorder}
                  onBlur={e  => (e.target as HTMLInputElement).style.borderColor = t.border}
                />
              </div>
              <button onClick={handleSubmit} disabled={loading} style={{ width:"100%", background:t.green, color:t.onGreen, border:"none", borderRadius:9, padding:"14px", fontSize:14, fontWeight:700, fontFamily:"var(--font-display)", cursor:loading?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, opacity:loading?0.75:1, transition:"background 0.2s" }}
                onMouseEnter={e=>{ if(!loading)(e.currentTarget as HTMLElement).style.background=t.green2; }}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=t.green}>
                {loading ? <><RefreshCw size={14} style={{ animation:"spin 1s linear infinite" }}/> Sending…</> : <>Send Reset Link <ArrowRight size={14}/></>}
              </button>
            </div>
            <p style={{ textAlign:"center", fontSize:12.5, color:t.text3, fontFamily:"var(--font-mono)", marginTop:24 }}>
              Remember your password?{" "}
              <Link href="/sign-in" style={{ color:t.green, fontWeight:600 }}>Sign in</Link>
            </p>
          </>
        )}
      </Card>
    </AuthShell>
  );
}
