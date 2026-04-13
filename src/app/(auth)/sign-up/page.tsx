"use client";
import { useState, useEffect } from "react";
import {
  Eye, EyeOff, ArrowRight, RefreshCw, PieChart,
  Check, Mail, Lock, User, AlertCircle,
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
  surface3:"#1e1e1e", grid:"rgba(255,255,255,0.025)", shadow:"rgba(0,0,0,0.7)",
  onGreen:"#000000",
} as const;
const LIGHT = {
  bg:"#f8f8f6", surface:"#ffffff", surface2:"#f2f2ef",
  border:"#e4e4e0", border2:"#d0d0ca",
  text:"#111111", text2:"#545450", text3:"#888880",
  green:"#16a34a", green2:"#15803d",
  greenDim:"rgba(22,163,74,0.08)", greenBorder:"rgba(22,163,74,0.22)",
  red:"#dc2626", redDim:"rgba(220,38,38,0.10)",
  surface3:"#eaeae6", grid:"rgba(0,0,0,0.04)", shadow:"rgba(0,0,0,0.12)",
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
          <defs><pattern id="dp2" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill={t.grid}/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#dp2)"/>
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

function Card({ t, children, width=480 }: { t: T; children: React.ReactNode; width?: number }) {
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

function SubmitBtn({ label, loading, onClick, t }: { label: string; loading: boolean; onClick: () => void; t: T }) {
  return (
    <button onClick={onClick} disabled={loading} style={{ width:"100%", background:t.green, color:t.onGreen, border:"none", borderRadius:9, padding:"14px", fontSize:14, fontWeight:700, fontFamily:"var(--font-display)", cursor:loading?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, opacity:loading?0.75:1, transition:"background 0.2s" }}
      onMouseEnter={e=>{ if(!loading)(e.currentTarget as HTMLElement).style.background=t.green2; }}
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

export default function SignUpPage() {
  const { theme } = useTheme();
  const t = theme === "dark" ? DARK : LIGHT;
  const router = useRouter();
  const supabase = createClient();

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);
  const [globalErr,setGlobal]   = useState("");

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/dashboard");
    });
  }, []);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim())                                    e.name     = "Name is required";
    if (!email)                                          e.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email))                e.email    = "Invalid email address";
    if (!password)                                       e.password = "Password is required";
    else if (password.length < 8)                        e.password = "Minimum 8 characters required";
    else if (!/(?=.*[A-Z])(?=.*[0-9])/.test(password))  e.password = "Include at least one uppercase letter and one number";
    if (password !== confirm)                            e.confirm  = "Passwords do not match";
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
  const strengthColor = ["","#ef4444","#f59e0b","#22c55e","#22c55e"][strength];
  const strengthLabel = ["","Too short","Fair","Good","Strong"][strength];

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true); setGlobal("");
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) throw error;
      setDone(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Sign up failed. Please try again.";
      setGlobal(msg);
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  if (done) {
    return (
      <AuthShell t={t}>
        <Card t={t}>
          <div style={{ textAlign:"center" }}>
            <div style={{ width:60, height:60, borderRadius:15, background:t.greenDim, border:`1px solid ${t.greenBorder}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
              <Check size={26} color={t.green}/>
            </div>
            <h2 style={{ fontFamily:"var(--font-display)", fontSize:22, fontWeight:800, color:t.text, marginBottom:10 }}>Check your email</h2>
            <p style={{ fontSize:13, color:t.text2, fontFamily:"var(--font-mono)", lineHeight:1.72, marginBottom:24 }}>
              We sent a confirmation link to <strong style={{ color:t.text }}>{email}</strong>. Click it to activate your account.
            </p>
            <Link href="/sign-in" style={{ display:"inline-flex", background:t.green, color:t.onGreen, borderRadius:9, padding:"13px 24px", fontSize:13, fontWeight:700, fontFamily:"var(--font-display)", alignItems:"center", gap:7 }}>
              Back to Sign In <ArrowRight size={12}/>
            </Link>
          </div>
        </Card>
      </AuthShell>
    );
  }

  return (
    <AuthShell t={t}>
      <Card t={t}>
        <h1 style={{ fontFamily:"var(--font-display)", fontSize:26, fontWeight:800, color:t.text, letterSpacing:-0.8, marginBottom:6 }}>Create account</h1>
        <p style={{ fontSize:13, color:t.text3, fontFamily:"var(--font-mono)", marginBottom:28 }}>Start tracking your subscriptions for free</p>
        {globalErr && <ErrBanner msg={globalErr} t={t}/>}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Field Icon={User} type="text"     placeholder="Full name"     value={name}     onChange={setName}     error={errors.name}     t={t}/>
          <Field Icon={Mail} type="email"    placeholder="Email address" value={email}    onChange={setEmail}    error={errors.email}    t={t}/>
          <div>
            <Field Icon={Lock} type="password" placeholder="Password"   value={password} onChange={setPassword} error={errors.password} t={t}/>
            {password && (
              <div style={{ marginTop:8 }}>
                <div style={{ display:"flex", gap:3, marginBottom:4 }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ height:3, flex:1, borderRadius:2, background: i<=strength ? strengthColor : t.surface3, transition:"background 0.3s" }}/>
                  ))}
                </div>
                <span style={{ fontSize:10, color:strengthColor, fontFamily:"var(--font-mono)" }}>{strengthLabel}</span>
              </div>
            )}
          </div>
          <Field Icon={Lock} type="password" placeholder="Confirm password" value={confirm} onChange={setConfirm} error={errors.confirm} t={t}/>
          <SubmitBtn label="Create Account" loading={loading} onClick={handleSubmit} t={t}/>
          <OrDivider t={t}/>
          <GoogleBtn onClick={handleGoogle} t={t}/>
          <p style={{ fontSize:11, color:t.text3, fontFamily:"var(--font-mono)", textAlign:"center", lineHeight:1.6 }}>
            By signing up you agree to our{" "}
            <Link href="/terms"   style={{ color:t.green }}>Terms</Link> and{" "}
            <Link href="/privacy" style={{ color:t.green }}>Privacy Policy</Link>
          </p>
        </div>
        <p style={{ textAlign:"center", fontSize:12.5, color:t.text3, fontFamily:"var(--font-mono)", marginTop:22 }}>
          Already have an account?{" "}
          <Link href="/sign-in" style={{ color:t.green, fontWeight:600 }}>Sign in</Link>
        </p>
      </Card>
    </AuthShell>
  );
}
