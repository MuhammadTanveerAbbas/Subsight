"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  LayoutDashboard, Sparkles, ToggleLeft, Download, Search, Shield,
  ArrowRight, Check, ChevronDown, ChevronUp,
  TrendingUp, Zap, Sun, Moon, Bell, CreditCard,
  BarChart3, ArrowUpRight, Lock, Globe, RefreshCw, GitBranch, Wallet, Target, ListTree, UserPlus,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Theme, ThemeKey } from "./marketing-constants";
import { DARK, LIGHT } from "./marketing-constants";

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useInView(threshold = 0.10) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (entries) => { const e = entries[0]; if (e?.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, vis };
}

// ─── Counter ──────────────────────────────────────────────────────────────────
function Counter({ to, prefix="", suffix="", duration=1600 }: { to:number; prefix?:string; suffix?:string; duration?:number }) {
  const [val, setVal] = useState(0);
  const { ref, vis } = useInView(0.4);
  useEffect(() => {
    if (!vis) return;
    let t0: number | null = null;
    const tick = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [vis, to, duration]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

// ─── Scroll reveal ────────────────────────────────────────────────────────────
function Reveal({ children, delay=0, y=24 }: { children: React.ReactNode; delay?: number; y?: number }) {
  const { ref, vis } = useInView(0.07);
  return (
    <div ref={ref} style={{ opacity:vis?1:0, transform:vis?`translateY(0px)`:`translateY(${y}px)`, transition:`opacity 0.70s ease ${delay}ms, transform 0.70s cubic-bezier(0.34,1.1,0.64,1) ${delay}ms` }}>
      {children}
    </div>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────
function Label({ text, t }: { text:string; t:Theme }) {
  return <span style={{ fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase", color:t.green, fontFamily:"var(--font-mono)", display:"block", marginBottom:14 }}>// {text}</span>;
}

// ─── Ticker ───────────────────────────────────────────────────────────────────
function Ticker({ t }: { t:Theme }) {
  const items = ["Real-time Analytics","AI-Powered Insights","Subscription Tracking","Private Expense Vault","Vault Budget & Analytics","Simulation Mode","Export PDF · CSV · JSON","Supabase Auth","Open Source MIT","Smart Renewal Alerts","Category Breakdown","Multi-Currency Support","Spending Goals","Custom Categories","Dark & Light Theme","Grouped Navigation"];
  return (
    <div style={{ overflow:"hidden", borderTop:`1px solid ${t.border}`, borderBottom:`1px solid ${t.border}`, background:t.surface, padding:"11px 0" }}>
      <div className="ticker-track" style={{ display:"flex", animation:"ticker 40s linear infinite", whiteSpace:"nowrap" }}>
        {[...items,...items,...items].map((item,i) => (
          <span key={i} style={{ fontSize:10, color:t.text3, padding:"0 26px", letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"var(--font-mono)", display:"inline-flex", alignItems:"center", gap:8 }}>
            <span style={{ width:5, height:5, borderRadius:1, background:t.green, display:"inline-block" }} /> {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Mini bar chart (Dashboard Preview) ──────────────────────────────────────
function MiniBars({ t }: { t:Theme }) {
  const months = ["J","F","M","A","M","J","J","A","S","O","N","D"];
  const vals   = [29,31,27,34,42,38,31,46,39,35,43,38];
  const max    = Math.max(...vals);
  const { ref, vis } = useInView(0.2);
  return (
    <div ref={ref} style={{ flex:1, padding:"16px 16px 12px", borderRight:`1px solid ${t.border}` }}>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
        <BarChart3 size={10} color={t.green} />
        <span style={{ fontSize:8.5, color:t.text3, fontFamily:"var(--font-mono)", letterSpacing:"0.1em", textTransform:"uppercase" }}>Monthly Spending</span>
        <span style={{ marginLeft:"auto", fontSize:8, color:t.green, fontFamily:"var(--font-mono)" }}>+12.4%</span>
      </div>
      <div style={{ display:"flex", alignItems:"flex-end", gap:3, height:64 }}>
        {vals.map((v,i) => (
          <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
            <div style={{ width:"100%", background:t.surface3, borderRadius:2, height:52, display:"flex", alignItems:"flex-end", overflow:"hidden" }}>
              <div style={{ width:"100%", borderRadius:2, background:i===11?t.green:i===7?`${t.green}88`:`${t.green}35`, height:vis?`${(v/max)*100}%`:"0%", transition:`height 0.65s cubic-bezier(0.34,1.4,0.64,1) ${i*45}ms` }} />
            </div>
            <span style={{ fontSize:6, color:t.text3, fontFamily:"var(--font-mono)" }}>{months[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Mini donut (Dashboard Preview) ──────────────────────────────────────────
function MiniDonut({ t }: { t:Theme }) {
  const segs = [{ p:33 },{ p:28 },{ p:22 },{ p:17 }];
  const colors = [t.green,`${t.green}bb`,`${t.green}66`,t.border2];
  const { ref, vis } = useInView(0.2);
  const r=34, cx=44, cy=44, circ=2*Math.PI*r;
  let cum=0;
  return (
    <div ref={ref} style={{ padding:"16px", display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
      <svg width="88" height="88" viewBox="0 0 88 88">
        {segs.map((seg,i) => {
          const dash=vis?(seg.p/100)*circ:0, off=-((cum/100)*circ);
          cum+=seg.p;
          return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={colors[i]} strokeWidth="12" strokeDasharray={`${dash} ${circ-dash}`} strokeDashoffset={off} style={{ transition:`stroke-dasharray 0.85s ease ${i*120}ms`, transform:"rotate(-90deg)", transformOrigin:`${cx}px ${cy}px` }} />;
        })}
        <text x={cx} y={cy-4} textAnchor="middle" fill={t.text} fontSize="10" fontFamily="var(--font-display)" fontWeight="700">$388</text>
        <text x={cx} y={cy+8} textAnchor="middle" fill={t.text3} fontSize="6.5" fontFamily="var(--font-mono)">/month</text>
      </svg>
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {["Dev Tools","Design","Cloud","Other"].map((label,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ width:6, height:6, borderRadius:1.5, background:colors[i], flexShrink:0 }} />
            <span style={{ fontSize:9, color:t.text2, fontFamily:"var(--font-mono)" }}>{label}</span>
            <span style={{ fontSize:9, color:t.text, fontFamily:"var(--font-mono)", marginLeft:"auto" }}>{segs[i]?.p ?? 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Dashboard Preview ────────────────────────────────────────────────────────
function DashPreview({ t }: { t:Theme }) {
  const rows = [
    { name:"Netflix",  cat:"Streaming",   amt:"$15.99", warn:false, due:"3d" },
    { name:"AWS",      cat:"Cloud",       amt:"$43.20", warn:true,  due:"1d" },
    { name:"Notion",   cat:"Productivity",amt:"$16.00", warn:false, due:"8d" },
    { name:"Figma",    cat:"Design",      amt:"$15.00", warn:false, due:"5d" },
  ];
  return (
    <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:16, overflow:"hidden", width:"100%", maxWidth:840, minWidth:0 }}>
      {/* Chrome bar */}
      <div style={{ background:t.surface2, borderBottom:`1px solid ${t.border}`, padding:"10px 18px", display:"flex", alignItems:"center", gap:7 }}>
        {["#ff5f57","#ffbd2e","#28ca42"].map((c,i) => <span key={i} style={{ width:9, height:9, borderRadius:"50%", background:c, display:"block" }} />)}
        <span style={{ flex:1, textAlign:"center", fontSize:9.5, color:t.text3, fontFamily:"var(--font-mono)" }}>subsight-tracker.vercel.app  Dashboard</span>
        <span style={{ width:6, height:6, borderRadius:"50%", background:t.green, animation:"pulse 2s ease-in-out infinite" }} />
      </div>
      {/* KPI row */}
      <div className="dash-preview-kpi" style={{ padding:"14px 18px", borderBottom:`1px solid ${t.border}`, display:"flex", gap:16, flexWrap:"wrap", overflowX:"auto" }}>
        {[{ l:"Monthly Spend",v:"$388.18",I:CreditCard },{ l:"Active Subs",v:"14",I:Zap },{ l:"Annual Total",v:"$4,658",I:TrendingUp },{ l:"Due Soon",v:"AWS · 1d",I:Bell }].map(({ l,v,I },i) => (
          <div key={i} style={{ display:"flex", flexDirection:"column", gap:3 }}>
            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
              <I size={9} color={t.green} />
              <span style={{ fontSize:8.5, color:t.text3, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"var(--font-mono)" }}>{l}</span>
            </div>
            <span style={{ fontFamily:"var(--font-display)", fontSize:19, fontWeight:800, color:t.text, lineHeight:1, letterSpacing:-0.5 }}>{v}</span>
          </div>
        ))}
      </div>
      {/* Charts */}
      <div className="dash-chart-row" style={{ display:"flex", borderBottom:`1px solid ${t.border}`, flexWrap:"wrap" }}>
        <MiniBars t={t} />
        <MiniDonut t={t} />
      </div>
      {/* Table */}
      <div style={{ overflowX:"auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1.8fr 1.5fr 1fr 0.8fr", padding:"9px 18px", borderBottom:`1px solid ${t.border}`, minWidth:320 }}>
          {["Service","Category","Amount","Renews"].map(h => <span key={h} style={{ fontSize:8.5, color:t.text3, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"var(--font-mono)" }}>{h}</span>)}
        </div>
        {rows.map((row,i) => (
          <div key={i} style={{ display:"grid", gridTemplateColumns:"1.8fr 1.5fr 1fr 0.8fr", padding:"10px 18px", borderBottom:i<rows.length-1?`1px solid ${t.border}`:"none", animation:`fadeSlideUp 0.4s ease ${0.1+i*0.07}s both`, minWidth:320 }}>
            <span style={{ fontSize:12, fontWeight:600, color:t.text, fontFamily:"var(--font-display)" }}>{row.name}</span>
            <span style={{ fontSize:10.5, color:t.text2, fontFamily:"var(--font-mono)" }}>{row.cat}</span>
            <span style={{ fontSize:12, fontWeight:700, color:t.text, fontFamily:"var(--font-mono)" }}>{row.amt}</span>
            <span style={{ fontSize:9.5, borderRadius:3, padding:"2px 6px", fontFamily:"var(--font-mono)", display:"inline-block", width:"fit-content", color:row.warn?t.amber:t.green, background:row.warn?"rgba(245,158,11,0.10)":t.greenDim }}>in {row.due}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Vault preview ────────────────────────────────────────────────────────────
function VaultPreview({ t }: { t:Theme }) {
  const rows = [
    { name:"Groceries", category:"Food", amount:"$64.20", color:"#f59e0b" },
    { name:"Coffee beans", category:"Food", amount:"$18.00", color:"#f59e0b" },
    { name:"Laptop stand", category:"Shopping", amount:"$42.50", color:"#a78bfa" },
  ];
  return (
    <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:16, padding:24, width:"100%", maxWidth:480 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <Wallet size={17} color={t.green} />
          <span style={{ fontFamily:"var(--font-display)", fontSize:15, fontWeight:700, color:t.text }}>Vault</span>
        </div>
        <span style={{ fontSize:10, color:t.text3, fontFamily:"var(--font-mono)" }}>Private to your account</span>
      </div>
      <div style={{ marginTop:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:10.5, color:t.text3, fontFamily:"var(--font-mono)", marginBottom:8 }}>
          <span>Monthly budget used</span><span style={{ color:t.green }}>62%</span>
        </div>
        <div style={{ height:6, borderRadius:3, background:t.surface3, overflow:"hidden" }}>
          <div style={{ width:"62%", height:"100%", background:t.green, borderRadius:3 }} />
        </div>
      </div>
      <div style={{ marginTop:24, borderTop:`1px solid ${t.border}` }}>
        {rows.map((row) => (
          <div key={row.name} style={{ display:"flex", alignItems:"center", gap:10, padding:"13px 0", borderBottom:`1px solid ${t.border}` }}>
            <span style={{ width:8, height:8, borderRadius:2, background:row.color, flexShrink:0 }} />
            <span style={{ flex:1, fontSize:12.5, color:t.text, fontFamily:"var(--font-display)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{row.name}</span>
            <span style={{ fontSize:11, color:t.text3, fontFamily:"var(--font-mono)" }}>{row.category}</span>
            <span style={{ fontSize:12.5, color:t.text, fontFamily:"var(--font-mono)", whiteSpace:"nowrap" }}>{row.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatCard({ Icon, title, desc, tag, t }: { Icon:React.ElementType; title:string; desc:string; tag?:string; t:Theme }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{ background:hov?t.surface2:t.bg, padding:"32px 28px", position:"relative", transition:"background 0.2s, transform 0.2s", transform:hov?"translateY(-2px)":"translateY(0px)" }}>
      {tag && <span style={{ position:"absolute", top:22, right:20, fontSize:9, color:t.green, letterSpacing:"0.12em", textTransform:"uppercase", background:t.greenDim, border:`1px solid ${t.greenBorder}`, borderRadius:4, padding:"3px 8px", fontFamily:"var(--font-mono)" }}>{tag}</span>}
      <div style={{ width:40, height:40, borderRadius:10, background:t.greenDim, border:`1px solid ${t.greenBorder}`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:20 }}>
        <Icon size={17} color={t.green} strokeWidth={1.5} />
      </div>
      <h3 style={{ fontFamily:"var(--font-display)", fontSize:18, fontWeight:700, color:t.text, marginBottom:10, letterSpacing:-0.3 }}>{title}</h3>
      <p style={{ fontSize:13, color:t.text2, lineHeight:1.72, fontFamily:"var(--font-mono)" }}>{desc}</p>
    </div>
  );
}

// ─── Why Subsight cards ───────────────────────────────────────────────────────
const WHY_ITEMS = [
  { icon: Lock,       title: "You own your data",         desc: "Runs on your Supabase instance. No vendor lock-in, no data harvesting. Export or delete everything at any time." },
  { icon: Sparkles,   title: "AI that actually helps",    desc: "Groq-powered auto-fill populates price, category, and billing cycle the moment you type a service name." },
  { icon: ToggleLeft, title: "Simulate before you cut",   desc: "Toggle subscriptions on/off to see the exact budget impact before cancelling anything." },
  { icon: Shield,     title: "Open source & auditable",   desc: "MIT licensed. Every line of code is public. No black boxes, no surprise charges, no tracking." },
  { icon: Bell,       title: "Never miss a renewal",      desc: "Email reminders 1, 3, 7, or 14 days before each charge. Set it once, forget it forever." },
  { icon: Globe,      title: "Self-host anywhere",        desc: "Deploy to Vercel, Railway, fly.io, or any VPS. One repo, one command, fully yours." },
] as const;
function WhyCard({ icon: Icon, title, desc, t }: { icon: React.ElementType; title: string; desc: string; t: Theme }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background: hov ? t.surface2 : t.surface, border:`1px solid ${hov ? t.greenBorder : t.border}`, borderRadius:14, padding:"28px 24px", transition:"all 0.22s", transform: hov ? "translateY(-3px)" : "translateY(0)" }}>
      <div style={{ width:38, height:38, borderRadius:10, background:t.greenDim, border:`1px solid ${t.greenBorder}`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:18 }}>
        <Icon size={16} color={t.green} strokeWidth={1.5} />
      </div>
      <h3 style={{ fontFamily:"var(--font-display)", fontSize:16, fontWeight:700, color:t.text, marginBottom:8, letterSpacing:-0.3 }}>{title}</h3>
      <p style={{ fontSize:12.5, color:t.text2, lineHeight:1.75, fontFamily:"var(--font-mono)" }}>{desc}</p>
    </div>
  );
}

// ─── FAQ item ─────────────────────────────────────────────────────────────────
function FAQItem({ q, a, t, idx }: { q:string; a:string; t:Theme; idx:number }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={()=>setOpen(!open)}
      style={{ border:`1px solid ${open ? t.greenBorder : t.border}`, borderRadius:12, overflow:"hidden", cursor:"pointer", background:open ? t.surface2 : t.surface, transition:"border-color 0.25s, background 0.25s" }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:14, padding:"20px 22px" }}>
        <span style={{ fontSize:10, color:t.green, fontFamily:"var(--font-mono)", fontWeight:700, letterSpacing:"0.08em", flexShrink:0, marginTop:3, opacity:0.7 }}>{String(idx+1).padStart(2,"0")}</span>
        <span style={{ fontSize:14, fontWeight:600, color:t.text, fontFamily:"var(--font-display)", lineHeight:1.45, flex:1 }}>{q}</span>
        <span style={{ width:24, height:24, borderRadius:6, background: open ? t.greenDim : t.surface3, border:`1px solid ${open ? t.greenBorder : t.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.25s", marginTop:1 }}>
          {open ? <ChevronUp size={12} color={t.green} /> : <ChevronDown size={12} color={t.text3} />}
        </span>
      </div>
      <div style={{ maxHeight:open ? 400 : 0, overflow:"hidden", transition:"max-height 0.35s cubic-bezier(0.4,0,0.2,1)" }}>
        <div style={{ padding:"0 22px 20px 50px", fontSize:13.5, color:t.text2, lineHeight:1.8, fontFamily:"var(--font-mono)" }}>{a}</div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [themeKey, setThemeKey] = useState<ThemeKey>("light");
  const [scrolled, setScrolled] = useState(false);
  const t = themeKey === "dark" ? DARK : LIGHT;

  useEffect(() => {
    const stored = (localStorage.getItem("subsight-theme") || "light") as ThemeKey;
    setThemeKey(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem("subsight-theme", themeKey);
    document.documentElement.setAttribute("data-theme", themeKey);
  }, [themeKey]);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive:true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const toggle = useCallback(() => setThemeKey(p => p==="dark" ? "light" : "dark"), []);

  const btnPrimary: React.CSSProperties = { background:t.green, color:"#000", border:"none", borderRadius:9, padding:"15px 32px", fontSize:14, fontWeight:700, fontFamily:"var(--font-display)", cursor:"pointer", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:8, transition:"background 0.2s, transform 0.15s" };
  const btnGhost:   React.CSSProperties = { background:"transparent", color:t.text, border:`1px solid ${t.border2}`, borderRadius:9, padding:"15px 32px", fontSize:14, fontFamily:"var(--font-display)", fontWeight:600, cursor:"pointer", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:8, transition:"border-color 0.2s, color 0.2s" };

  return (
    <div style={{ background:t.bg, color:t.text, fontFamily:"var(--font-display)", minHeight:"100vh", overflowX:"hidden", transition:"background 0.4s, color 0.4s" }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{overflow-x:hidden}
        :root{--font-display:var(--font-inter),system-ui,sans-serif;--font-mono:var(--font-jetbrains-mono),'Courier New',monospace}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.6)}}
        @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-33.333%)}}
        @keyframes heroIn{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeSlideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
         @media(prefers-reduced-motion:reduce){
           .ticker-track{animation:none!important}
         }
        a{color:inherit;text-decoration:none}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:3px}
        *{scrollbar-width:thin;scrollbar-color:#2a2a2a transparent}
        .nav-desktop{display:flex!important}
        @media(max-width:900px){.feat-grid{grid-template-columns:repeat(2,1fr)!important}}
         @media(max-width:820px){.steps-grid{grid-template-columns:1fr!important}.vault-spotlight{grid-template-columns:1fr!important;gap:32px!important}}
        @media(max-width:768px){
          .nav-desktop{display:none!important}
          .nav-wrap{display:flex!important;justify-content:space-between!important;align-items:center!important;padding:0 16px!important;grid-template-columns:unset!important}
          .stats-grid{grid-template-columns:repeat(2,1fr)!important}
                    .cta-inner{flex-direction:column!important;align-items:stretch!important;text-align:center!important}
          .cta-btns{justify-content:center!important}
          .footer-grid{grid-template-columns:1fr 1fr!important;gap:32px!important}
          .section-pad{padding:80px 20px!important}
          .hero-section{padding:100px 20px 72px!important;min-height:unset!important}
          .dash-chart-row{flex-direction:column!important}
          .cta-box{padding:48px 24px!important}
          .dash-preview-kpi{flex-wrap:wrap!important;gap:16px!important}
                    .footer-brand{grid-column:1/-1!important}
          .ana-2col{grid-template-columns:1fr!important}
          .add-grid{grid-template-columns:1fr!important}
          .chart-2col{grid-template-columns:1fr!important}
        }
        @media(max-width:540px){
          .feat-grid{grid-template-columns:1fr!important}
          .footer-grid{grid-template-columns:1fr 1fr!important}
          .footer-bottom{flex-direction:column!important;text-align:center!important;gap:12px!important}
          .footer-bottom-links{flex-wrap:wrap!important;justify-content:center!important;gap:12px!important}
          .hero-section{padding:88px 16px 56px!important}
          .cta-btns{flex-direction:column!important;align-items:stretch!important}
          .cta-btns a,.cta-btns button{justify-content:center!important}
          .add-inner-grid{grid-template-columns:1fr!important}
        }
        @media(max-width:400px){
          .footer-grid{grid-template-columns:1fr!important}
        }
      `}</style>

      {/* ═══ NAV ════════════════════════════════════════════════════════════════ */}
      <nav className="nav-wrap" style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, display:"grid", gridTemplateColumns:"1fr auto 1fr", alignItems:"center", padding:"0 40px", height:68, background:scrolled?t.navBg:"transparent", borderBottom:scrolled?`1px solid ${t.border}`:"none", backdropFilter:scrolled?"blur(20px)":"none", WebkitBackdropFilter:scrolled?"blur(20px)":"none", transition:"all 0.4s cubic-bezier(0.4,0,0.2,1)" }}>

        {/* Logo */}
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none", flexShrink:0 }}>
          <Image src="/icon.svg" alt="Subsight" width={32} height={32} style={{ borderRadius:9, flexShrink:0, display:"block" }} />
          <span style={{ fontFamily:"var(--font-display)", fontSize:18, fontWeight:800, color:t.text, letterSpacing:-0.6 }}>Subsight</span>
        </Link>

        {/* Center nav links */}
        <div className="nav-desktop" style={{ display:"flex", alignItems:"center", gap:6 }}>
          {[
            { id:"features", label:"Features" },
            { id:"how-it-works", label:"How it works" },
            { id:"vault", label:"Vault" },
            { id:"compare", label:"Compare" },
            { id:"faq", label:"FAQ" },
          ].map(link => (
            <a key={link.id} href={`#${link.id}`}
              style={{ fontSize:13, color:t.text2, fontFamily:"var(--font-display)", fontWeight:500, padding:"7px 16px", borderRadius:8, transition:"color 0.2s, background 0.2s", whiteSpace:"nowrap", textDecoration:"none" }}
              onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.color=t.text; (e.currentTarget as HTMLElement).style.background=t.surface2; }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.color=t.text2; (e.currentTarget as HTMLElement).style.background="transparent"; }}
            >{link.label}</a>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0, justifyContent:"flex-end" }}>
          <button onClick={toggle} aria-label="Toggle theme"
            style={{ width:36, height:36, border:`1px solid ${t.border2}`, borderRadius:10, background:t.surface2, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.2s", flexShrink:0 }}
            onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor=t.green; (e.currentTarget as HTMLElement).style.background=t.surface3; }}
            onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor=t.border2; (e.currentTarget as HTMLElement).style.background=t.surface2; }}>
            {themeKey==="dark" ? <Sun size={14} color={t.text2} /> : <Moon size={14} color={t.text2} />}
          </button>
          <Link href="/sign-up"
            style={{ background:t.green, color:"#000", borderRadius:10, padding:"9px 20px", fontSize:13, fontWeight:700, fontFamily:"var(--font-display)", display:"flex", alignItems:"center", gap:6, textDecoration:"none", transition:"all 0.2s", whiteSpace:"nowrap" }}
            onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background=t.green2; (e.currentTarget as HTMLElement).style.transform="translateY(-1px)"; }}
            onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background=t.green; (e.currentTarget as HTMLElement).style.transform="translateY(0)"; }}>
            Get Started <ArrowRight size={12} />
          </Link>

        </div>
      </nav>



      {/* ═══ HERO ═══════════════════════════════════════════════════════════════ */}
      <section className="section-pad hero-section" style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"130px 24px 80px", position:"relative", overflow:"hidden" }}>
        {/* Background */}
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0 }}>
          <svg width="100%" height="100%" style={{ position:"absolute", inset:0 }}>
            <defs><pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill={t.grid} /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>
        {/* Unified hero */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", position:"relative", zIndex:1, width:"100%" }}>

          {/* Badge pill */}
          <div style={{ animation:"heroIn 0.65s ease both", marginBottom:36 }}>
            <span style={{ display:"inline-flex", alignItems:"center", gap:0, border:`1px solid ${t.greenBorder}`, borderRadius:999, background:t.greenDim, overflow:"hidden" }}>
              <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"6px 14px", fontSize:11, color:t.green, fontFamily:"var(--font-mono)", letterSpacing:"0.04em" }}>
                <GitBranch size={10} color={t.green} strokeWidth={1.8} /> Open Source
              </span>
              <span style={{ color:t.greenBorder, fontSize:11, userSelect:"none" }}>|</span>
              <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"6px 14px", fontSize:11, color:t.green, fontFamily:"var(--font-mono)", letterSpacing:"0.04em" }}>
                <Shield size={10} color={t.green} strokeWidth={1.8} /> Privacy First
              </span>
            </span>
          </div>

          {/* Headline */}
          <h1 style={{ animation:"heroIn 0.65s ease 0.08s both", fontFamily:"var(--font-display)", fontSize:"clamp(32px,5.5vw,64px)", fontWeight:800, lineHeight:1.05, letterSpacing:"-2px", color:t.text, textAlign:"center", maxWidth:720 }}>
            Every subscription. Every personal expense.<br /><span style={{ color:t.green }}>One clear view.</span>
          </h1>

          {/* Subheading */}
          <p style={{ animation:"heroIn 0.65s ease 0.16s both", marginTop:22, fontSize:"clamp(13px,1.2vw,15px)", color:t.text2, maxWidth:440, lineHeight:1.7, fontFamily:"var(--font-mono)", textAlign:"center" }}>
            Subsight tracks recurring charges and keeps personal spending in a private vault. Budgets, analytics and renewal reminders included.
          </p>

          {/* CTA buttons */}
          <div className="cta-btns" style={{ animation:"heroIn 0.65s ease 0.24s both", display:"flex", gap:12, marginTop:40, flexWrap:"wrap", justifyContent:"center" }}>
            <Link href="/sign-up" style={btnPrimary}
              onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background=t.green2; (e.currentTarget as HTMLElement).style.transform="translateY(-2px)"; }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background=t.green; (e.currentTarget as HTMLElement).style.transform="translateY(0px)"; }}>
              <UserPlus size={15} /> Create free account
            </Link>
            <a href="#features" style={btnGhost}
              onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor=t.green; (e.currentTarget as HTMLElement).style.color=t.green; }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor=t.border2; (e.currentTarget as HTMLElement).style.color=t.text; }}>
              <LayoutDashboard size={15} /> Explore Features
            </a>
          </div>

          {/* Stats grid */}
          <div className="stats-grid" style={{ animation:"heroIn 0.65s ease 0.34s both", display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:1, marginTop:64, background:t.border, border:`1px solid ${t.border}`, borderRadius:14, overflow:"hidden", maxWidth:760, width:"100%" }}>
            {[
              { n:100, p:"", s:"%",  l:"Open Source" },
              { n:3,   p:"", s:"",   l:"Export Formats" },
              { n:4,   p:"", s:"",   l:"Reminder Windows" },
              { n:12,  p:"", s:" mo", l:"Spending Trend" },
            ].map((item,i) => (
              <div key={i} style={{ background:t.surface, padding:"28px 18px", textAlign:"center" }}>
                <div style={{ fontFamily:"var(--font-display)", fontSize:"clamp(24px,3.5vw,38px)", fontWeight:800, color:t.text, lineHeight:1, letterSpacing:-1 }}>
                  <Counter to={item.n} prefix={item.p} suffix={item.s} />
                </div>
                <div style={{ fontSize:10, color:t.text3, marginTop:6, letterSpacing:"0.08em", fontFamily:"var(--font-mono)", textTransform:"uppercase", lineHeight:1.4 }}>{item.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══ TICKER ════════════════════════════════════════════════════════════ */}
      <Ticker t={t} />

      {/* ═══ FEATURES ══════════════════════════════════════════════════════════ */}
      <section id="features" className="section-pad" style={{ padding:"100px 24px" }}>
        <div style={{ maxWidth:1080, margin:"0 auto" }}>
          <Reveal><Label text="Features" t={t} />
            <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(32px,5vw,56px)", fontWeight:800, letterSpacing:-2, color:t.text, lineHeight:1.05, maxWidth:560 }}>Built for people who<br /><span style={{ color:t.green }}>mean business</span></h2>
            <p style={{ fontSize:14, color:t.text2, maxWidth:420, marginTop:14, lineHeight:1.78, fontFamily:"var(--font-mono)" }}>No fluff. No onboarding ceremony. Just the tools to own your recurring spend.</p>
          </Reveal>
          <div className="feat-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1px", background:t.border, border:`1px solid ${t.border}`, borderRadius:14, overflow:"hidden", marginTop:52 }}>
            {[
              { Icon:LayoutDashboard, title:"Live Dashboard",        desc:"Real-time KPIs, spending trends, and category breakdowns. Your financial pulse in one glance.",          tag:"Core" },
              { Icon:Sparkles,        title:"AI Auto-Fill",          desc:"Type a service name. Groq AI fills in pricing, billing cycle, and category instantly.",                 tag:"AI" },
              { Icon:ToggleLeft,      title:"Simulation Mode",       desc:"Toggle subscriptions on or off to model budget changes before making any real decisions." },
              { Icon:Download,        title:"Multi-Format Export",   desc:"One shortcut exports your full list to JSON, CSV, or PDF. Your data, your format, forever." },
              { Icon:Search,          title:"Smart Search & Filter", desc:"Find any subscription instantly by name, category, status, or renewal date." },
              { Icon:Shield,          title:"Full Data Ownership",   desc:"Runs on your own Supabase instance. Your data stays under your control. MIT licensed." },
              { Icon:Wallet,          title:"Private Expense Vault", desc:"Log personal purchases and possessions in a space that stays separate from your subscriptions." },
              { Icon:Target,          title:"Vault Budget & Analytics", desc:"Set a monthly budget, then see category breakdowns and six-month trends for personal spending." },
              { Icon:ListTree,        title:"Grouped Navigation",       desc:"Overview, Manage and Account groups keep every tool one click away without crowding the sidebar." },
            ].map(f => <FeatCard key={f.title} t={t} {...f} />)}
          </div>
          <Reveal delay={100}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:28, marginTop:40, flexWrap:"wrap" }}>
              {[{ icon:Lock,label:"Encrypted in Transit" },{ icon:Globe,label:"Self-Hostable" },{ icon:Sparkles,label:"Groq AI Powered" },{ icon:RefreshCw,label:"Open Source MIT" },{ icon:ArrowUpRight,label:"Live on Vercel" }].map(({ icon:Icon,label }) => (
                <div key={label} style={{ display:"flex", alignItems:"center", gap:7, color:t.text2 }}>
                  <Icon size={13} color={t.green} strokeWidth={1.5} />
                  <span style={{ fontSize:12, fontFamily:"var(--font-mono)", letterSpacing:"0.04em" }}>{label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ DASHBOARD PREVIEW ═════════════════════════════════════════════════ */}
      <section className="section-pad" style={{ padding:"0 24px 96px", display:"flex", justifyContent:"center", position:"relative", overflow:"hidden" }}>
        <Reveal y={40}><div style={{ width:"100%", maxWidth:840, overflowX:"auto" }}><DashPreview t={t} /></div></Reveal>
      </section>

      {/* ═══ WHY SUBSIGHT ═══════════════════════════════════════════════════════ */}
      <section id="compare" className="section-pad" style={{ padding:"100px 24px", background:t.surface }}>
        <div style={{ maxWidth:1080, margin:"0 auto" }}>
          <Reveal>
            <Label text="Why Subsight" t={t} />
            <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(32px,5vw,56px)", fontWeight:800, letterSpacing:-2, color:t.text, lineHeight:1.05 }}>Built different.<br /><span style={{ color:t.green }}>On purpose.</span></h2>
            <p style={{ fontSize:14, color:t.text2, maxWidth:500, marginTop:14, lineHeight:1.78, fontFamily:"var(--font-mono)" }}>Other tools link to your bank and sell your data. Subsight gives you full control: open source, self-hostable, and privacy-first by design.</p>
          </Reveal>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginTop:52 }} className="feat-grid">
            {WHY_ITEMS.map((item, i) => (
              <Reveal key={item.title} delay={i * 60}>
                <WhyCard icon={item.icon} title={item.title} desc={item.desc} t={t} />
              </Reveal>
            ))}
          </div>
          <Reveal delay={120}>
            <div style={{ marginTop:48, padding:"24px 28px", border:`1px solid ${t.border}`, borderRadius:14, background:t.bg, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:24, flexWrap:"wrap" }}>
                {[
                  { icon: Check, label: "No bank credentials required" },
                  { icon: Check, label: "Zero telemetry or tracking" },
                  { icon: Check, label: "MIT licensed. Fork it freely." },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} style={{ display:"flex", alignItems:"center", gap:7 }}>
                    <span style={{ width:18, height:18, borderRadius:"50%", background:t.greenDim, border:`1px solid ${t.greenBorder}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <Icon size={10} color={t.green} />
                    </span>
                    <span style={{ fontSize:12.5, color:t.text2, fontFamily:"var(--font-mono)" }}>{label}</span>
                  </div>
                ))}
              </div>
              <a href="https://github.com/MuhammadTanveerAbbas/Subsight-Tracker" target="_blank" rel="noopener"
                style={{ fontSize:12, color:t.green, fontFamily:"var(--font-mono)", border:`1px solid ${t.greenBorder}`, borderRadius:8, padding:"9px 20px", background:t.greenDim, transition:"all 0.2s", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:6 }}
                onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background=t.green; (e.currentTarget as HTMLElement).style.color="#000"; }}
                onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background=t.greenDim; (e.currentTarget as HTMLElement).style.color=t.green; }}>
                <GitBranch size={12} /> View Source
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ══════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="section-pad" style={{ padding:"100px 24px", background:t.surface }}>
        <div style={{ maxWidth:1080, margin:"0 auto" }}>
          <Reveal>
            <Label text="How it works" t={t} />
            <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(28px,4vw,44px)", fontWeight:800, letterSpacing:-1.2, color:t.text, lineHeight:1.1, maxWidth:520 }}>
              Three steps to a clear picture
            </h2>
            <p style={{ fontSize:14, color:t.text2, maxWidth:460, marginTop:14, lineHeight:1.7, fontFamily:"var(--font-mono)" }}>
              Add what you pay for, then see it in one place. Personal spending stays in its own space.
            </p>
          </Reveal>
          <div className="steps-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginTop:44 }}>
            {[
              { n:"01", title:"Add what you pay for", desc:"Enter each subscription with its amount, cycle and renewal date. AI auto-fill can complete the details from a service name." },
              { n:"02", title:"See the full picture", desc:"One dashboard shows monthly spend, annual cost, category share and what renews soon." },
              { n:"03", title:"Keep personal costs separate", desc:"Log purchases in the Vault. It has its own budget and analytics, so they never mix with subscriptions." },
            ].map((step) => (
              <Reveal key={step.n}>
                <div style={{ background:t.bg, border:`1px solid ${t.border}`, borderRadius:12, padding:"28px 24px", height:"100%" }}>
                  <div style={{ fontSize:11, color:t.green, fontFamily:"var(--font-mono)", letterSpacing:"0.08em", marginBottom:20 }}>{step.n}</div>
                  <h3 style={{ fontFamily:"var(--font-display)", fontSize:17, fontWeight:700, color:t.text, marginBottom:10, letterSpacing:-0.3 }}>{step.title}</h3>
                  <p style={{ fontSize:12.5, color:t.text2, lineHeight:1.7, fontFamily:"var(--font-mono)" }}>{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ VAULT ═════════════════════════════════════════════════════════════ */}
      <section id="vault" className="section-pad" style={{ padding:"100px 24px" }}>
        <div className="vault-spotlight" style={{ maxWidth:1080, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, alignItems:"center" }}>
          <Reveal>
            <Label text="Vault" t={t} />
            <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(28px,4vw,44px)", fontWeight:800, letterSpacing:-1.2, color:t.text, lineHeight:1.1, maxWidth:460 }}>
              Your personal spending, kept private
            </h2>
            <p style={{ fontSize:14, color:t.text2, maxWidth:440, marginTop:16, lineHeight:1.75, fontFamily:"var(--font-mono)" }}>
              The Vault is a separate tracker for purchases and possessions you want to remember. It uses its own budget, currency and charts.
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:12, marginTop:28 }}>
              {[
                "A monthly budget and currency of your choice",
                "Category breakdown and six-month trends",
                "Records visible only to your account",
              ].map((line) => (
                <div key={line} style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                  <span style={{ width:20, height:20, borderRadius:6, background:t.greenDim, border:`1px solid ${t.greenBorder}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Check size={11} color={t.green} />
                  </span>
                  <span style={{ fontSize:13, color:t.text2, fontFamily:"var(--font-mono)", lineHeight:1.6 }}>{line}</span>
                </div>
              ))}
            </div>
            <Link href="/sign-up" style={{ ...btnPrimary, marginTop:32 }}
              onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background=t.green2; }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background=t.green; }}>
              Create free account <ArrowRight size={14} />
            </Link>
          </Reveal>
          <Reveal delay={100}><VaultPreview t={t} /></Reveal>
        </div>
      </section>

      {/* ═══ FAQ ════════════════════════════════════════════════════════════════ */}
      <section id="faq" className="section-pad" style={{ padding:"100px 24px", background:t.bg, position:"relative", overflow:"hidden" }}>
        <div style={{ maxWidth:860, margin:"0 auto", position:"relative", zIndex:1 }}>
          {/* Centered header */}
          <Reveal>
            <div style={{ textAlign:"center", marginBottom:56 }}>
              <Label text="FAQ" t={t} />
              <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(30px,5vw,54px)", fontWeight:800, letterSpacing:-2, color:t.text, lineHeight:1.06 }}>
                Good questions.<br /><span style={{ color:t.green }}>Straight answers.</span>
              </h2>
              <p style={{ fontSize:13.5, color:t.text2, maxWidth:420, margin:"16px auto 0", lineHeight:1.75, fontFamily:"var(--font-mono)" }}>
                Everything you need to know before you start tracking.
              </p>
            </div>
          </Reveal>

          {/* Two-column accordion grid */}
          <style>{`
            .faq-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:start}
            @media(max-width:680px){.faq-grid{grid-template-columns:1fr!important}}
          `}</style>
          {(() => {
            const faqs = [
              ["Is Subsight really free?","Yes. Every feature is available to all users at no cost, no credit card, no usage caps, no locked features. The app is MIT-licensed and fully open source. If you self-host, you only pay for Supabase and Groq, both of which have generous free tiers."],
              ["Do I need a Groq API key?","Only for AI auto-fill and AI spending summaries. Every other feature (dashboard, analytics, simulation, export, renewal alerts, settings) works without a Groq key. You can add one at any time in Settings."],
              ["Where is my data stored?","In your own Supabase PostgreSQL database. Subsight never has direct access to your data. You own it completely and can export or delete it at any time."],
              ["Can it detect subscriptions from my bank?","Not currently. Subsight is manual and AI-assisted. You enter subscriptions yourself; the AI auto-fill fills in details like price and category once you type a service name."],
              ["Can I track personal expenses too?","Yes. The Vault is a private area for personal purchases and possessions. It has its own monthly budget, currency and analytics, and its records stay separate from your subscriptions."],
              ["What export formats are supported?","JSON, CSV, and PDF. All three formats are available to all users for free."],
              ["Is there a mobile app?","Not yet web only, but the interface is fully responsive and works well on mobile browsers. A native app may come in the future."],
              ["Can I self-host on my own server?","Absolutely. Clone the GitHub repo, set up a Supabase project, add your environment variables, and deploy anywhere Next.js runs: Vercel, Railway, fly.io, or any VPS."],
              ["How do renewal reminders work?","Configure SMTP credentials via environment variables on your server, enable reminders on a subscription, and choose a lead time (1, 3, 7, or 14 days). A daily cron job checks and sends an email before each renewal date."],
            ];
            const left  = faqs.filter((_,i) => i % 2 === 0);
            const right = faqs.filter((_,i) => i % 2 !== 0);
            return (
              <div className="faq-grid">
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {left.map(([q,a], i) => <Reveal key={q} delay={i*40}><FAQItem q={q??""} a={a??""} t={t} idx={i*2} /></Reveal>)}
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {right.map(([q,a], i) => <Reveal key={q} delay={i*40+20}><FAQItem q={q??""} a={a??""} t={t} idx={i*2+1} /></Reveal>)}
                </div>
              </div>
            );
          })()}

          {/* Bottom CTA nudge */}
          <Reveal delay={80}>
            <div style={{ textAlign:"center", marginTop:52, padding:"28px 24px", border:`1px solid ${t.border}`, borderRadius:14, background:t.surface }}>
              <p style={{ fontSize:13, color:t.text2, fontFamily:"var(--font-mono)", marginBottom:16 }}>Still have questions? The source code is fully open.</p>
              <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
                <a href="https://github.com/MuhammadTanveerAbbas/Subsight-Tracker" target="_blank" rel="noopener"
                  style={{ fontSize:12, color:t.green, fontFamily:"var(--font-mono)", border:`1px solid ${t.greenBorder}`, borderRadius:8, padding:"8px 18px", background:t.greenDim, transition:"all 0.2s" }}
                  onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background=t.green; (e.currentTarget as HTMLElement).style.color="#000"; }}
                  onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background=t.greenDim; (e.currentTarget as HTMLElement).style.color=t.green; }}>
                  View Source on GitHub
                </a>
                <Link href="/sign-up"
                  style={{ fontSize:12, color:t.text2, fontFamily:"var(--font-mono)", border:`1px solid ${t.border}`, borderRadius:8, padding:"8px 18px", background:"transparent", transition:"all 0.2s" }}
                  onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor=t.border2; (e.currentTarget as HTMLElement).style.color=t.text; }}
                  onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor=t.border; (e.currentTarget as HTMLElement).style.color=t.text2; }}>
                  Try it free <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ FINAL CTA ══════════════════════════════════════════════════════════ */}
      <section className="section-pad" style={{ padding:"80px 24px 100px" }}>
        <div style={{ maxWidth:1080, margin:"0 auto" }}>
          <Reveal>
            <div className="cta-box" style={{ background:t.surface, border:`1px solid ${t.greenBorder}`, borderRadius:18, padding:"80px 64px", position:"relative", overflow:"hidden" }}>
              <div className="cta-inner" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:48, flexWrap:"wrap", position:"relative", zIndex:1 }}>
                <div>
                  <Label text="Get started now" t={t} />
                  <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(28px,4vw,50px)", fontWeight:800, letterSpacing:-1.5, color:t.text, lineHeight:1.05 }}>Stop wondering where<br /><span style={{ color:t.green }}>your money went.</span></h2>
                  <p style={{ fontSize:14, color:t.text2, marginTop:14, maxWidth:380, fontFamily:"var(--font-mono)", lineHeight:1.78 }}>Two minutes to set up. Immediate clarity on every recurring charge.</p>
                </div>
                <div className="cta-btns" style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                  <Link href="/sign-up" style={btnPrimary} onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background=t.green2; (e.currentTarget as HTMLElement).style.transform="translateY(-2px)"; }} onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background=t.green; (e.currentTarget as HTMLElement).style.transform="translateY(0px)"; }}>Start Free <ArrowRight size={14} /></Link>
                  <a href="https://subsight-tracker.vercel.app/" target="_blank" rel="noopener" style={btnGhost} onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor=t.green; (e.currentTarget as HTMLElement).style.color=t.green; }} onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor=t.border2; (e.currentTarget as HTMLElement).style.color=t.text; }}><ArrowUpRight size={14} /> Live Demo</a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ FOOTER ═════════════════════════════════════════════════════════════ */}
      <footer style={{ borderTop:`1px solid ${t.border}`, padding:"56px 24px 36px" }}>
        <div style={{ maxWidth:1080, margin:"0 auto" }}>
          <div className="footer-grid" style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:40, marginBottom:48 }}>
            <div className="footer-brand">
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                <Image src="/icon.svg" alt="Subsight" width={28} height={28} style={{ borderRadius:6, display:"block" }} />
                <span style={{ fontFamily:"var(--font-display)", fontSize:18, fontWeight:800, color:t.text }}>Subsight</span>
              </div>
              <p style={{ fontSize:13, color:t.text3, fontFamily:"var(--font-mono)", lineHeight:1.7, maxWidth:320 }}>A real-time subscription tracker with AI insights. Open source. Free forever.</p>
            </div>
            {[
              { title:"Product",    links:[["Features","#features"],["How it works","#how-it-works"],["Vault","#vault"],["Compare","#compare"],["Dashboard","/dashboard"]] },
              { title:"Resources",  links:[["GitHub","https://github.com/MuhammadTanveerAbbas/Subsight-Tracker"],["Live Demo","https://subsight-tracker.vercel.app/"],["Author","https://muhammadtanveerabbas.vercel.app/"]] },
              { title:"Legal",      links:[["Privacy Policy","/privacy"],["Terms of Service","/terms"]] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize:11, fontWeight:700, color:t.text, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"var(--font-mono)", marginBottom:16 }}>{col.title}</div>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {(col.links as [string, string][]).map(([label,href]) => (
                    <a key={label} href={href} target={href.startsWith("http")?"_blank":"_self"} rel={href.startsWith("http")?"noopener":""} style={{ fontSize:13, color:t.text3, fontFamily:"var(--font-mono)", transition:"color 0.2s" }} onMouseEnter={e=>(e.currentTarget.style.color=t.green)} onMouseLeave={e=>(e.currentTarget.style.color=t.text3)}>{label}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="footer-bottom" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:24, borderTop:`1px solid ${t.border}`, flexWrap:"wrap", gap:14 }}>
            <p style={{ fontSize:11, color:t.text3, fontFamily:"var(--font-mono)" }}>© 2026 Subsight · Built by Muhammad Tanveer Abbas · MIT License</p>
            <div className="footer-bottom-links" style={{ display:"flex", gap:20 }}>
              {([["GitHub","https://github.com/MuhammadTanveerAbbas/Subsight-Tracker"],["Live App","https://subsight-tracker.vercel.app/"],["Privacy","/privacy"],["Terms","/terms"]] as const).map(([label,href]) => (
                <a key={label} href={href} target={href.startsWith("http")?"_blank":"_self"} rel={href.startsWith("http")?"noopener":""} style={{ fontSize:11, color:t.text3, fontFamily:"var(--font-mono)", transition:"color 0.2s" }} onMouseEnter={e=>(e.currentTarget.style.color=t.green)} onMouseLeave={e=>(e.currentTarget.style.color=t.text3)}>{label}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
