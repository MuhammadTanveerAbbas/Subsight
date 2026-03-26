"use client";
import { useState } from "react";
import {
  Eye, EyeOff, ArrowRight, RefreshCw, PieChart,
  Mail, Lock, AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
          <defs><pattern id="dp" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill={t.grid}/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#dp)"/>
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

function Field({ Icon, type="text", placeholder, value, onChange, error, t }: {
  Icon: React.ElementType; type?: string; placeholder: string;
  value: string; onChange: (v: string) => void; error?: string; t: T;
}) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <div>
      <div style={{ position:"relative" }}>
        <Icon size={14} color={error ? t.red : t.text3} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
        <input
          type={isPass ? (show ? "text" : "password") : type}
          placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)}
          style={{ width:"100%", background:t.surface2, border:`1px solid ${error ? t.red+"66" : t.border}`, borderRadius:9, padding:`12px 14px 12px 38px`, paddingRight:isPass?"42px":"14px", fontSize:13.5, color:t.text, fontFamily:"var(--font-mono)", outline:"none", transition:"border-color 0.2s" }}
          onFocus={e => (e.target as HTMLInputElement).style.borderColor = error ? t.red : t.greenBorder}
          onBlur={e  => (e.target as HTMLInputElement).style.borderColor = error ? t.red+"66" : t.border}
        />
        {isPass && (
          <button type="button" onClick={() => setShow(!show)} style={{ position:"absolute", right:11, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:t.text3, padding:4, display:"flex" }}>
            {show ? <EyeOff size={14}/> : <Eye size={14}/>}
          </button>
        )}
      </div>
      {error && (
        <p style={{ fontSize:11, color:t.red, fontFamily:"var(--font-mono)", marginTop:5, display:"flex", alignItems:"center", gap:4 }}>
          <AlertCircle size={10}/> {error}
        </p>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function ErrBanner({ msg, t }: { msg: string; t: T }) {
  return (
    <div style={{ background:t.redDim, border:`1px solid ${t.red}44`, borderRadius:8, padding:"11px 14px", fontSize:12, color:t.red, fontFamily:"var(--font-mono)", marginBottom:20, display:"flex", alignItems:"center", gap:8 }}>
      <AlertCircle size={13} style={{ flexShrink:0 }}/> {msg}
    </div>
  );
}

function Card({ t, children, width=400 }: { t: T; children: React.ReactNode; width?: number }) {
  return (
    <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:16, padding:"36px 32px", width:"100%", maxWidth:width, boxShadow:`0 32px 80px ${t.shadow}` }}>
      {children}
    </div>
  );
}

function OrDivider({ t }: { t: T }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, margin:"6px 0" }}>
      <div style={{ flex:1, height:1, background:t.border }}/>
      <span style={{ fontSize:11, color:t.text3, fontFamily:"var(--font-mono)" }}>or</span>
      <div style={{ flex:1, height:1, background:t.border }}/>
    </div>
  );
}

function SubmitBtn({ label, loading, disabled, onClick, t }: { label: string; loading: boolean; disabled?: boolean; onClick: () => void; t: T }) {
  return (
    <button onClick={onClick} disabled={loading || disabled} style={{ width:"100%", background:t.green, color:t.onGreen, border:"none", borderRadius:9, padding:"14px", fontSize:14, fontWeight:700, fontFamily:"var(--font-display)", cursor:(loading||disabled)?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, opacity:(loading||disabled)?0.75:1, transition:"background 0.2s" }}
      onMouseEnter={e=>{ if(!loading&&!disabled)(e.currentTarget as HTMLElement).style.background=t.green2; }}
      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=t.green}>
      {loading ? <><RefreshCw size={14} style={{ animation:"spin 1s linear infinite" }}/> Loading…</> : <>{label} <ArrowRight size={14}/></>}
    </button>
  );
}

function GoogleBtn({ onClick, t }: { onClick: () => void; t: T }) {
  return (
    <button onClick={onClick} style={{ width:"100%", background:t.surface2, color:t.text, border:`1px solid ${t.border2}`, borderRadius:9, padding:"13px", fontSize:13, fontFamily:"var(--font-display)", fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:9, transition:"border-color 0.2s" }}
      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor=t.border2}
      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor=t.border}>
      <GoogleIcon/> Continue with Google
    </button>
  );
}

export default function SignInPage() {
  const { theme } = useTheme();
  const t = theme === "dark" ? DARK : LIGHT;
  const router = useRouter();
  const supabase = createClient();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [loading,  setLoading]  = useState(false);
  const [globalErr,setGlobal]   = useState("");

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!email)                           e.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email    = "Invalid email address";
    if (!password)                        e.password = "Password is required";
    else if (password.length < 6)         e.password = "At least 6 characters required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true); setGlobal("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/dashboard");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Sign in failed. Check your credentials.";
      setGlobal(msg);
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <AuthShell t={t}>
      <Card t={t}>
        <h1 style={{ fontFamily:"var(--font-display)", fontSize:26, fontWeight:800, color:t.text, letterSpacing:-0.8, marginBottom:6 }}>Welcome back</h1>
        <p style={{ fontSize:13, color:t.text3, fontFamily:"var(--font-mono)", marginBottom:28 }}>Sign in to your Subsight account</p>
        {globalErr && <ErrBanner msg={globalErr} t={t}/>}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Field Icon={Mail} type="email" placeholder="Email address" value={email} onChange={setEmail} error={errors.email} t={t}/>
          <Field Icon={Lock} type="password" placeholder="Password" value={password} onChange={setPassword} error={errors.password} t={t}/>
          <div style={{ textAlign:"right", marginTop:-4 }}>
            <Link href="/forgot-password" style={{ fontSize:12, color:t.green, fontFamily:"var(--font-mono)", transition:"opacity 0.2s" }}
              onMouseEnter={e=>(e.currentTarget.style.opacity="0.75")}
              onMouseLeave={e=>(e.currentTarget.style.opacity="1")}>
              Forgot password?
            </Link>
          </div>
          <SubmitBtn label="Sign In" loading={loading} onClick={handleSubmit} t={t}/>
          <OrDivider t={t}/>
          <GoogleBtn onClick={handleGoogle} t={t}/>
        </div>
        <p style={{ textAlign:"center", fontSize:12.5, color:t.text3, fontFamily:"var(--font-mono)", marginTop:24 }}>
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" style={{ color:t.green, fontWeight:600 }}>Sign up free</Link>
        </p>
      </Card>
    </AuthShell>
  );
}
