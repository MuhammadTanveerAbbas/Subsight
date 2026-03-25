"use client";
// ─────────────────────────────────────────────────────────────────────────────
// landingpage.tsx — Subsight Landing Page  (Phase 1 Final)
// Place at: src/app/(marketing)/page.tsx
//
// Sections: Nav · Hero · Ticker · Features · Dashboard Preview ·
//           Comparison Table · Pricing · FAQ · Final CTA · Footer
//
// Fonts: Plus Jakarta Sans (display) + DM Mono (mono/UI)
// Theme: dark / light toggle — persisted to localStorage
// Responsive: 480 / 768 / 900 / 1440 breakpoints
// Browser: Safari backdrop-filter, Firefox scrollbar, all modern browsers
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";
import {
  LayoutDashboard, Sparkles, ToggleLeft, Download, Search, Shield,
  Github, ArrowRight, Check, X, ChevronDown, ChevronUp,
  TrendingUp, Zap, Sun, Moon, Menu, PieChart, Bell, CreditCard,
  BarChart3, ArrowUpRight, Lock, Globe, RefreshCw, Target,
} from "lucide-react";
import Link from "next/link";

// ─── Theme tokens ─────────────────────────────────────────────────────────────
const DARK = {
  bg:"#080808", surface:"#111111", surface2:"#181818", surface3:"#1e1e1e",
  border:"#1f1f1f", border2:"#2a2a2a",
  text:"#f0f0f0", text2:"#a0a0a0", text3:"#585858",
  green:"#22c55e", green2:"#16a34a",
  greenDim:"rgba(34,197,94,0.08)", greenBorder:"rgba(34,197,94,0.22)", greenGlow:"rgba(34,197,94,0.14)",
  red:"#ef4444", amber:"#f59e0b",
  navBg:"rgba(8,8,8,0.92)", shadow:"rgba(0,0,0,0.7)", grid:"rgba(255,255,255,0.025)",
} as const;
const LIGHT = {
  bg:"#f8f8f6", surface:"#ffffff", surface2:"#f2f2ef", surface3:"#eaeae6",
  border:"#e4e4e0", border2:"#d0d0ca",
  text:"#111111", text2:"#545450", text3:"#888880",
  green:"#16a34a", green2:"#15803d",
  greenDim:"rgba(22,163,74,0.08)", greenBorder:"rgba(22,163,74,0.22)", greenGlow:"rgba(22,163,74,0.10)",
  red:"#dc2626", amber:"#d97706",
  navBg:"rgba(248,248,246,0.92)", shadow:"rgba(0,0,0,0.12)", grid:"rgba(0,0,0,0.04)",
} as const;
type Theme = typeof DARK | typeof LIGHT;
type ThemeKey = "dark" | "light";

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useInView(threshold = 0.10) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
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
  const items = ["Real-time Analytics","AI-Powered Insights","14 Active Subscriptions","Simulation Mode","Export PDF · CSV · JSON","Supabase Auth","Open Source MIT","Smart Renewal Alerts","Category Breakdown","Zero Hidden Fees","Multi-Currency Support","Spending Goals","Custom Categories","Dark & Light Theme"];
  return (
    <div style={{ overflow:"hidden", borderTop:`1px solid ${t.border}`, borderBottom:`1px solid ${t.border}`, background:t.surface, padding:"11px 0" }}>
      <div style={{ display:"flex", animation:"ticker 40s linear infinite", whiteSpace:"nowrap" }}>
        {[...items,...items,...items].map((item,i) => (
          <span key={i} style={{ fontSize:10, color:t.text3, padding:"0 26px", letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"var(--font-mono)", display:"inline-flex", alignItems:"center", gap:8 }}>
            <span style={{ color:t.green, fontSize:7 }}>◆</span> {item}
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
            <span style={{ fontSize:9, color:t.text, fontFamily:"var(--font-mono)", marginLeft:"auto" }}>{segs[i].p}%</span>
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
    <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:16, overflow:"hidden", width:"100%", maxWidth:840, boxShadow:`0 48px 120px ${t.shadow}, 0 0 0 1px ${t.greenBorder}` }}>
      {/* Chrome bar */}
      <div style={{ background:t.surface2, borderBottom:`1px solid ${t.border}`, padding:"10px 18px", display:"flex", alignItems:"center", gap:7 }}>
        {["#ff5f57","#ffbd2e","#28ca42"].map((c,i) => <span key={i} style={{ width:9, height:9, borderRadius:"50%", background:c, display:"block" }} />)}
        <span style={{ flex:1, textAlign:"center", fontSize:9.5, color:t.text3, fontFamily:"var(--font-mono)" }}>app.subsight.io — Dashboard</span>
        <span style={{ width:6, height:6, borderRadius:"50%", background:t.green, animation:"pulse 2s ease-in-out infinite" }} />
      </div>
      {/* KPI row */}
      <div style={{ padding:"14px 18px", borderBottom:`1px solid ${t.border}`, display:"flex", gap:24, flexWrap:"wrap" }}>
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
      <div>
        <div style={{ display:"grid", gridTemplateColumns:"1.8fr 1.5fr 1fr 0.8fr", padding:"9px 18px", borderBottom:`1px solid ${t.border}` }}>
          {["Service","Category","Amount","Renews"].map(h => <span key={h} style={{ fontSize:8.5, color:t.text3, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"var(--font-mono)" }}>{h}</span>)}
        </div>
        {rows.map((row,i) => (
          <div key={i} style={{ display:"grid", gridTemplateColumns:"1.8fr 1.5fr 1fr 0.8fr", padding:"10px 18px", borderBottom:i<rows.length-1?`1px solid ${t.border}`:"none", animation:`fadeSlideUp 0.4s ease ${0.1+i*0.07}s both` }}>
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

// ─── Comparison table ─────────────────────────────────────────────────────────
type CV = boolean | string;
const COMPARE = [
  { f:"Real-time Dashboard",      sub:true,  sheet:false,       truebill:true,  rocket:true,  gen:false },
  { f:"AI Auto-Fill",             sub:true,  sheet:false,       truebill:false, rocket:false, gen:false },
  { f:"Spending Simulation",      sub:true,  sheet:false,       truebill:false, rocket:false, gen:false },
  { f:"Category Analytics",       sub:true,  sheet:"Manual",    truebill:true,  rocket:true,  gen:false },
  { f:"Export JSON / CSV / PDF",  sub:true,  sheet:"Partial",   truebill:false, rocket:false, gen:"Partial" },
  { f:"Self-Hosted Option",       sub:true,  sheet:false,       truebill:false, rocket:false, gen:false },
  { f:"Open Source",              sub:true,  sheet:false,       truebill:false, rocket:false, gen:false },
  { f:"Renewal Alerts",           sub:true,  sheet:false,       truebill:true,  rocket:true,  gen:true },
  { f:"Own Database",             sub:true,  sheet:false,       truebill:false, rocket:false, gen:false },
  { f:"Spending Goals",           sub:true,  sheet:false,       truebill:true,  rocket:true,  gen:false },
  { f:"Free Forever",             sub:true,  sheet:true,        truebill:false, rocket:false, gen:true },
  { f:"Bank Auto-Detection",      sub:false, sheet:false,       truebill:true,  rocket:true,  gen:false },
];
function CCell({ v }: { v:CV }) {
  if (v===true)  return <Check size={14} color="#22c55e" />;
  if (v===false) return <X size={13} color="#ef4444" style={{ opacity:0.5 }} />;
  return <span style={{ fontSize:10.5, fontFamily:"var(--font-mono)", color:"#f59e0b" }}>{v}</span>;
}
function CompareTable({ t }: { t:Theme }) {
  const cols = [{ l:"Subsight",hi:true },{ l:"Spreadsheet",hi:false },{ l:"Truebill",hi:false },{ l:"Rocket Money",hi:false },{ l:"Generic Apps",hi:false }];
  return (
    <div style={{ overflowX:"auto", borderRadius:14, border:`1px solid ${t.border}`, boxShadow:`0 20px 60px ${t.shadow}` }}>
      <table style={{ width:"100%", borderCollapse:"collapse", minWidth:580 }}>
        <thead>
          <tr style={{ background:t.surface2 }}>
            <th style={{ padding:"13px 20px", textAlign:"left", fontSize:10.5, color:t.text3, fontFamily:"var(--font-mono)", letterSpacing:"0.1em", textTransform:"uppercase", fontWeight:400, borderBottom:`1px solid ${t.border}` }}>Feature</th>
            {cols.map((c,i) => (
              <th key={i} style={{ padding:"13px 16px", textAlign:"center", fontSize:11, fontFamily:"var(--font-mono)", fontWeight:c.hi?600:400, color:c.hi?t.green:t.text2, letterSpacing:"0.06em", borderBottom:`1px solid ${t.border}`, background:c.hi?t.greenDim:"transparent", borderTop:c.hi?`2px solid ${t.green}`:"2px solid transparent", position:"relative" }}>
                {c.hi && <span style={{ position:"absolute", top:-2, left:0, right:0, height:2, background:t.green, borderRadius:"2px 2px 0 0" }} />}
                {c.l}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPARE.map((row,ri) => (
            <tr key={ri} style={{ background:ri%2===0?t.surface:t.surface2 }}>
              <td style={{ padding:"12px 20px", fontSize:13, color:t.text, fontFamily:"var(--font-display)", borderBottom:`1px solid ${t.border}` }}>{row.f}</td>
              {[row.sub,row.sheet,row.truebill,row.rocket,row.gen].map((v,ci) => (
                <td key={ci} style={{ padding:"12px 16px", textAlign:"center", borderBottom:`1px solid ${t.border}`, background:ci===0?t.greenDim:"transparent" }}><CCell v={v} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Price card ───────────────────────────────────────────────────────────────
function PriceCard({ plan, price, sub, desc, features, highlight, t, cta, href }: { plan:string; price:string; sub:string; desc:string; features:string[]; highlight?:boolean; t:Theme; cta:string; href:string }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:highlight?t.surface2:t.surface, border:`1px solid ${highlight?t.greenBorder:t.border}`, borderRadius:16, padding:"40px 32px", position:"relative", flex:1, minWidth:280, display:"flex", flexDirection:"column", transition:"transform 0.22s, box-shadow 0.22s", transform:hov?"translateY(-5px)":"translateY(0px)", boxShadow:hov?`0 36px 80px ${t.shadow}, 0 0 0 1px ${t.greenBorder}`:highlight?`0 0 0 1px ${t.greenBorder}, 0 24px 64px ${t.greenGlow}`:"none" }}>
      {highlight && (
        <span style={{ position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)", background:t.green, color:"#000", fontSize:9.5, fontWeight:700, padding:"5px 18px", borderRadius:999, fontFamily:"var(--font-mono)", letterSpacing:"0.1em", whiteSpace:"nowrap", boxShadow:`0 4px 16px ${t.greenGlow}` }}>RECOMMENDED</span>
      )}
      <div style={{ marginBottom:24 }}>
        <span style={{ fontFamily:"var(--font-mono)", fontSize:10, color:highlight?t.green:t.text3, letterSpacing:"0.18em", textTransform:"uppercase", display:"block", marginBottom:8 }}>{plan}</span>
        <p style={{ fontSize:12.5, color:t.text3, fontFamily:"var(--font-mono)", lineHeight:1.6 }}>{desc}</p>
      </div>
      <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:8, paddingBottom:24, borderBottom:`1px solid ${t.border}` }}>
        <span style={{ fontFamily:"var(--font-display)", fontSize:52, fontWeight:800, color:t.text, lineHeight:1, letterSpacing:-2 }}>{price}</span>
        <span style={{ fontSize:12, color:t.text3, fontFamily:"var(--font-mono)" }}>{sub}</span>
      </div>
      <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:12, marginBottom:32, flex:1, paddingTop:20 }}>
        {features.map((f,i) => (
          <li key={i} style={{ fontSize:13, color:t.text2, display:"flex", alignItems:"flex-start", gap:10, fontFamily:"var(--font-mono)" }}>
            <span style={{ width:18, height:18, borderRadius:"50%", background:t.greenDim, border:`1px solid ${t.greenBorder}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
              <Check size={10} color={t.green} />
            </span>
            {f}
          </li>
        ))}
      </ul>
      <Link href={href} target={href.startsWith("http")?"_blank":"_self"} rel={href.startsWith("http")?"noopener":""} style={{ display:"flex", width:"100%", padding:"14px", borderRadius:10, fontSize:13, fontFamily:"var(--font-mono)", fontWeight:600, textAlign:"center", textDecoration:"none", background:highlight?t.green:"transparent", color:highlight?"#000":t.text, border:highlight?"none":`1px solid ${t.border2}`, justifyContent:"center", alignItems:"center", gap:7, transition:"all 0.2s" }}
        onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; if(highlight){el.style.background=t.green2;}else{el.style.borderColor=t.green;el.style.color=t.green;} }}
        onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; if(highlight){el.style.background=t.green;}else{el.style.borderColor=t.border2;el.style.color=t.text;} }}>
        {cta} <ArrowRight size={12} />
      </Link>
    </div>
  );
}

// ─── FAQ item ─────────────────────────────────────────────────────────────────
function FAQItem({ q, a, t }: { q:string; a:string; t:Theme }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={()=>setOpen(!open)} style={{ border:`1px solid ${open?t.border2:t.border}`, borderRadius:9, overflow:"hidden", cursor:"pointer", background:t.surface, transition:"border-color 0.2s" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 22px" }}>
        <span style={{ fontSize:14, fontWeight:600, color:t.text, fontFamily:"var(--font-display)", paddingRight:16, lineHeight:1.4 }}>{q}</span>
        {open ? <ChevronUp size={14} color={t.green} style={{ flexShrink:0 }} /> : <ChevronDown size={14} color={t.text3} style={{ flexShrink:0 }} />}
      </div>
      <div style={{ maxHeight:open?320:0, overflow:"hidden", transition:"max-height 0.32s ease" }}>
        <div style={{ padding:"0 22px 18px", fontSize:13.5, color:t.text2, lineHeight:1.78, fontFamily:"var(--font-mono)" }}>{a}</div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [themeKey, setThemeKey] = useState<ThemeKey>("dark");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [annual, setAnnual]     = useState(false);
  const t = themeKey === "dark" ? DARK : LIGHT;

  useEffect(() => {
    const stored = (localStorage.getItem("subsight-theme") || "dark") as ThemeKey;
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
        html{scroll-behavior:smooth}
        body{overflow-x:hidden}
        :root{--font-display:'Plus Jakarta Sans',system-ui,sans-serif;--font-mono:'DM Mono','Courier New',monospace}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.6)}}
        @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-33.333%)}}
        @keyframes heroIn{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeSlideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        a{color:inherit;text-decoration:none}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:3px}
        *{scrollbar-width:thin;scrollbar-color:#2a2a2a transparent}
        .nav-desktop{display:flex!important}
        .nav-hamburger{display:none!important}
        .mobile-menu{display:none!important}
        @media(max-width:900px){.feat-grid{grid-template-columns:repeat(2,1fr)!important}}
        @media(max-width:768px){
          .nav-desktop{display:none!important}
          .nav-hamburger{display:flex!important}
          .mobile-menu.open{display:flex!important}
          .hero-h1{font-size:clamp(24px,8vw,40px)!important;letter-spacing:-1px!important}
          .stats-grid{grid-template-columns:repeat(2,1fr)!important}
          .price-row{grid-template-columns:1fr!important}
          .cta-inner{flex-direction:column!important;align-items:stretch!important;text-align:center!important}
          .cta-btns{justify-content:center!important}
          .footer-grid{grid-template-columns:1fr 1fr!important;gap:32px!important}
          .section-pad{padding:72px 16px!important}
          .dash-chart-row{flex-direction:column!important}
          .compare-scroll{overflow-x:auto!important}
          .nav-wrap{padding:0 16px!important}
          .cta-box{padding:48px 24px!important}
        }
        @media(max-width:540px){
          .feat-grid{grid-template-columns:1fr!important}
          .stats-grid{grid-template-columns:1fr!important}
          .footer-grid{grid-template-columns:1fr!important}
          .footer-bottom{flex-direction:column!important;text-align:center!important;gap:12px!important}
          .footer-bottom-links{flex-wrap:wrap!important;justify-content:center!important;gap:12px!important}
        }
      `}</style>

      {/* ═══ NAV ════════════════════════════════════════════════════════════════ */}
      <nav className="nav-wrap" style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 40px", height:68, background:scrolled?t.navBg:"transparent", borderBottom:scrolled?`1px solid ${t.border}`:"none", backdropFilter:scrolled?"blur(20px)":"none", WebkitBackdropFilter:scrolled?"blur(20px)":"none", transition:"all 0.4s cubic-bezier(0.4,0,0.2,1)" }}>

        {/* Logo */}
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none", flexShrink:0 }}>
          <div style={{ width:32, height:32, background:t.green, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:`0 0 16px ${t.greenGlow}` }}>
            <PieChart size={15} color="#000" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily:"var(--font-display)", fontSize:18, fontWeight:800, color:t.text, letterSpacing:-0.6 }}>Subsight</span>
        </Link>

        {/* Center pill nav */}
        <div className="nav-desktop" style={{ display:"flex", alignItems:"center", gap:2, background:t.surface2, border:`1px solid ${t.border2}`, borderRadius:999, padding:"5px 6px" }}>
          {["Features","Compare","Pricing","FAQ"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`}
              style={{ fontSize:13, color:t.text2, fontFamily:"var(--font-display)", fontWeight:500, padding:"6px 16px", borderRadius:999, transition:"all 0.2s", whiteSpace:"nowrap" }}
              onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.color=t.text; (e.currentTarget as HTMLElement).style.background=t.surface3; }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.color=t.text2; (e.currentTarget as HTMLElement).style.background="transparent"; }}
            >{l}</a>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
          <button onClick={toggle} aria-label="Toggle theme"
            style={{ width:36, height:36, border:`1px solid ${t.border2}`, borderRadius:10, background:t.surface2, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.2s", flexShrink:0 }}
            onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor=t.green; (e.currentTarget as HTMLElement).style.background=t.surface3; }}
            onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor=t.border2; (e.currentTarget as HTMLElement).style.background=t.surface2; }}>
            {themeKey==="dark" ? <Sun size={14} color={t.text2} /> : <Moon size={14} color={t.text2} />}
          </button>
          <Link href="/sign-in" className="nav-desktop"
            style={{ fontSize:13, color:t.text2, fontFamily:"var(--font-display)", fontWeight:500, display:"flex", padding:"8px 14px", borderRadius:8, transition:"all 0.2s" }}
            onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.color=t.text; (e.currentTarget as HTMLElement).style.background=t.surface2; }}
            onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.color=t.text2; (e.currentTarget as HTMLElement).style.background="transparent"; }}>
            Sign in
          </Link>
          <Link href="/sign-up"
            style={{ background:t.green, color:"#000", borderRadius:10, padding:"9px 20px", fontSize:13, fontWeight:700, fontFamily:"var(--font-display)", display:"flex", alignItems:"center", gap:6, textDecoration:"none", transition:"all 0.2s", boxShadow:`0 0 20px ${t.greenGlow}`, whiteSpace:"nowrap" }}
            onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background=t.green2; (e.currentTarget as HTMLElement).style.transform="translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow=`0 4px 24px ${t.greenGlow}`; }}
            onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background=t.green; (e.currentTarget as HTMLElement).style.transform="translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow=`0 0 20px ${t.greenGlow}`; }}>
            Get Started <ArrowRight size={12} />
          </Link>
          <button className="nav-hamburger" onClick={()=>setMenuOpen(!menuOpen)} aria-label="Open menu" style={{ background:"none", border:"none", color:t.text, cursor:"pointer", padding:4, display:"none" }}>
            {menuOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu ${menuOpen?"open":""}`} style={{ display:"none", position:"fixed", top:68, left:0, right:0, zIndex:99, background:t.surface, borderBottom:`1px solid ${t.border}`, padding:"16px 20px 24px", flexDirection:"column", gap:4 }}>
        {["Features","Compare","Pricing","FAQ"].map(l => (
          <a key={l} href={`#${l.toLowerCase()}`} onClick={()=>setMenuOpen(false)}
            style={{ fontSize:15, color:t.text2, fontWeight:500, fontFamily:"var(--font-display)", padding:"12px 14px", borderRadius:10, transition:"all 0.2s" }}
            onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.color=t.text; (e.currentTarget as HTMLElement).style.background=t.surface2; }}
            onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.color=t.text2; (e.currentTarget as HTMLElement).style.background="transparent"; }}
          >{l}</a>
        ))}
        <div style={{ height:1, background:t.border, margin:"8px 0" }} />
        <Link href="/sign-in" style={{ fontSize:14, color:t.text2, fontFamily:"var(--font-display)", padding:"12px 14px", borderRadius:10 }}>Sign In</Link>
        <Link href="/sign-up" style={{ background:t.green, color:"#000", borderRadius:10, padding:"14px", fontSize:14, fontWeight:700, fontFamily:"var(--font-display)", textAlign:"center", marginTop:4, boxShadow:`0 0 20px ${t.greenGlow}` }}>Get Started Free</Link>
      </div>

      {/* ═══ HERO ═══════════════════════════════════════════════════════════════ */}
      <section className="section-pad" style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"130px 24px 80px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0 }}>
          <svg width="100%" height="100%" style={{ position:"absolute", inset:0 }}>
            <defs><pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill={t.grid} /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>
        <div style={{ position:"absolute", top:"-15%", left:"50%", transform:"translateX(-50%)", width:800, height:800, background:`radial-gradient(circle, ${t.greenGlow} 0%, transparent 62%)`, pointerEvents:"none", zIndex:0 }} />

        <div style={{ animation:"heroIn 0.65s ease both", position:"relative", zIndex:1, display:"inline-flex", alignItems:"center", gap:8, border:`1px solid ${t.border2}`, borderRadius:999, padding:"6px 18px", marginBottom:38, fontSize:10.5, color:t.text3, letterSpacing:"0.12em", textTransform:"uppercase", fontFamily:"var(--font-mono)" }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:t.green, animation:"pulse 2s ease-in-out infinite", display:"inline-block", flexShrink:0 }} />
          Open Source · Self-Hosted · Free Forever
        </div>

        <h1 className="hero-h1" style={{ animation:"heroIn 0.65s ease 0.08s both", position:"relative", zIndex:1, fontFamily:"var(--font-display)", fontSize:"clamp(28px,5.5vw,62px)", fontWeight:800, lineHeight:1.05, letterSpacing:"-2px", color:t.text, maxWidth:680 }}>
          Stop bleeding money <span style={{ color:t.green, whiteSpace:"nowrap" }}>forgotten subscriptions</span>
        </h1>

        <p style={{ animation:"heroIn 0.65s ease 0.16s both", position:"relative", zIndex:1, marginTop:20, fontSize:"clamp(12px,1.1vw,14px)", color:t.text2, maxWidth:400, lineHeight:1.65, fontFamily:"var(--font-mono)" }}>
          Real-time command center for every recurring payment — AI insights, analytics, zero surprises.
        </p>

        <div className="cta-row" style={{ animation:"heroIn 0.65s ease 0.24s both", position:"relative", zIndex:1, display:"flex", gap:12, marginTop:44, flexWrap:"wrap", justifyContent:"center" }}>
          <Link href="/sign-up" style={btnPrimary} onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background=t.green2; (e.currentTarget as HTMLElement).style.transform="translateY(-2px)"; }} onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background=t.green; (e.currentTarget as HTMLElement).style.transform="translateY(0px)"; }}>
            Track My Subscriptions <ArrowRight size={14} />
          </Link>
          <a href="https://github.com/MuhammadTanveerAbbas/Subsight-Tracker" target="_blank" rel="noopener" style={btnGhost} onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor=t.green; (e.currentTarget as HTMLElement).style.color=t.green; }} onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor=t.border2; (e.currentTarget as HTMLElement).style.color=t.text; }}>
            <Github size={14} /> View Source
          </a>
        </div>

        <div className="stats-grid" style={{ animation:"heroIn 0.65s ease 0.34s both", position:"relative", zIndex:1, display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:1, marginTop:80, background:t.border, border:`1px solid ${t.border}`, borderRadius:14, overflow:"hidden", maxWidth:760, width:"100%" }}>
          {[{ n:0,p:"$",s:"",l:"Hidden Fees" },{ n:100,p:"",s:"%",l:"Free & Open Source" },{ n:140,p:"$",s:"+",l:"Avg Monthly Savings" },{ n:14,p:"",s:" subs",l:"Avg Tracked / User" }].map((item,i) => (
            <div key={i} style={{ background:t.surface, padding:"28px 18px", textAlign:"center" }}>
              <div style={{ fontFamily:"var(--font-display)", fontSize:"clamp(26px,3.5vw,38px)", fontWeight:800, color:t.text, lineHeight:1, letterSpacing:-1 }}>
                <Counter to={item.n} prefix={item.p} suffix={item.s} />
              </div>
              <div style={{ fontSize:10, color:t.text3, marginTop:6, letterSpacing:"0.08em", fontFamily:"var(--font-mono)", textTransform:"uppercase", lineHeight:1.4 }}>{item.l}</div>
            </div>
          ))}
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
              { Icon:LayoutDashboard, title:"Live Dashboard",        desc:"Real-time KPIs, spending trends, and category breakdowns — your financial pulse in one glance.",          tag:"Core" },
              { Icon:Sparkles,        title:"AI Auto-Fill",          desc:"Type a service name. Groq AI fills in pricing, billing cycle, and category — instantly.",                 tag:"AI" },
              { Icon:ToggleLeft,      title:"Simulation Mode",       desc:"Toggle subscriptions on or off to model budget changes before making any real decisions." },
              { Icon:Download,        title:"Multi-Format Export",   desc:"One shortcut exports your full list to JSON, CSV, or PDF. Your data, your format, forever." },
              { Icon:Search,          title:"Smart Search & Filter", desc:"Find any subscription instantly by name, category, status, or renewal date." },
              { Icon:Shield,          title:"Full Data Ownership",   desc:"Runs on your own Supabase instance. Your data never leaves your control. MIT licensed." },
            ].map(f => <FeatCard key={f.title} t={t} {...f} />)}
          </div>
          <Reveal delay={100}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:28, marginTop:40, flexWrap:"wrap" }}>
              {[{ icon:Lock,label:"End-to-End Encrypted" },{ icon:Globe,label:"Self-Hostable" },{ icon:Sparkles,label:"Groq AI Powered" },{ icon:RefreshCw,label:"Open Source MIT" },{ icon:ArrowUpRight,label:"Live on Vercel" }].map(({ icon:Icon,label }) => (
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
      <section className="section-pad" style={{ padding:"0 24px 96px", display:"flex", justifyContent:"center", position:"relative", overflow:"visible" }}>
        <div style={{ position:"absolute", top:"20%", left:"50%", transform:"translateX(-50%)", width:700, height:500, background:`radial-gradient(ellipse, ${t.greenGlow} 0%, transparent 65%)`, pointerEvents:"none", zIndex:0 }} />
        <Reveal y={40}><DashPreview t={t} /></Reveal>
      </section>

      {/* ═══ COMPARISON TABLE ══════════════════════════════════════════════════ */}
      <section id="compare" className="section-pad" style={{ padding:"100px 24px", background:t.surface }}>
        <div style={{ maxWidth:1080, margin:"0 auto" }}>
          <Reveal><Label text="Compare" t={t} />
            <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(32px,5vw,56px)", fontWeight:800, letterSpacing:-2, color:t.text, lineHeight:1.05 }}>Subsight vs <span style={{ color:t.green }}>everything else</span></h2>
            <p style={{ fontSize:14, color:t.text2, maxWidth:540, marginTop:14, lineHeight:1.78, fontFamily:"var(--font-mono)" }}>Truebill and Rocket Money link to your bank but lock your data behind a paywall. Spreadsheets require manual effort. Generic apps do the minimum. Subsight does it all — with full ownership.</p>
          </Reveal>
          <div style={{ marginTop:52, overflowX:"auto" }}><Reveal delay={80}><CompareTable t={t} /></Reveal></div>
          <Reveal delay={120}><p style={{ fontSize:11, color:t.text3, fontFamily:"var(--font-mono)", marginTop:14, textAlign:"center" }}>✓ Full support &nbsp;·&nbsp; ± Partial &nbsp;·&nbsp; ✗ Not available</p></Reveal>
        </div>
      </section>

      {/* ═══ PRICING ═══════════════════════════════════════════════════════════ */}
      <section id="pricing" className="section-pad" style={{ padding:"100px 24px", background:t.surface }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <Reveal>
            <div style={{ textAlign:"center", marginBottom:48 }}>
              <Label text="Pricing" t={t} />
              <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(32px,5vw,56px)", fontWeight:800, letterSpacing:-2, color:t.text, lineHeight:1.05 }}>Simple pricing.<br /><span style={{ color:t.green }}>Start free.</span></h2>
              <p style={{ fontSize:14, color:t.text2, maxWidth:440, margin:"16px auto 0", lineHeight:1.78, fontFamily:"var(--font-mono)" }}>Free forever for the basics. Upgrade to Pro for $9/month when you need more.</p>
            </div>
          </Reveal>
          <Reveal delay={60}>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:40 }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:12, background:t.bg, border:`1px solid ${t.border2}`, borderRadius:999, padding:"8px 24px", cursor:"pointer" }} onClick={()=>setAnnual(!annual)}>
                <span style={{ fontSize:13, fontFamily:"var(--font-display)", fontWeight:annual?400:700, color:annual?t.text3:t.text }}>Monthly</span>
                <div style={{ width:44, height:24, borderRadius:999, background:annual?t.green:t.surface3, border:`1px solid ${t.border2}`, position:"relative", transition:"background 0.2s", flexShrink:0 }}>
                  <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:annual?23:3, transition:"left 0.2s" }} />
                </div>
                <span style={{ fontSize:13, fontFamily:"var(--font-display)", fontWeight:annual?700:400, color:annual?t.text:t.text3 }}>Annual <span style={{ fontSize:10, color:t.green, fontFamily:"var(--font-mono)" }}>Save $22</span></span>
              </div>
            </div>
          </Reveal>
          <div className="price-row" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, alignItems:"stretch" }}>
            <Reveal delay={0}>
              <PriceCard t={t} plan="Free" price="$0" sub="/month" desc="Everything you need to get started, no credit card required." cta="Get Started Free" href="/sign-up" features={["Up to 10 subscriptions","Basic analytics dashboard","AI auto-fill (5 / month)","Simulation mode","Export to JSON","Community support"]} />
            </Reveal>
            <Reveal delay={80}>
              <PriceCard t={t} highlight plan="Pro" price={annual?"$86":"$9"} sub={annual?"/year":"/month"} desc="For power users who want the full experience." cta="Start Pro" href="/sign-up" features={["Unlimited subscriptions","Advanced analytics & charts","Unlimited AI auto-fill","Export to JSON, CSV & PDF","Renewal alerts & spending goals","Custom categories","Priority support"]} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ════════════════════════════════════════════════════════════════ */}
      <section id="faq" className="section-pad" style={{ padding:"100px 24px", background:t.surface }}>
        <div style={{ maxWidth:1080, margin:"0 auto" }}>
          <Reveal><Label text="FAQ" t={t} />
            <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(32px,5vw,56px)", fontWeight:800, letterSpacing:-2, color:t.text, lineHeight:1.05 }}>Good questions.<br /><span style={{ color:t.green }}>Straight answers.</span></h2>
          </Reveal>
          <div style={{ maxWidth:720, marginTop:52, display:"flex", flexDirection:"column", gap:4 }}>
            {[
              ["Is Subsight really free?","Yes — forever. Subsight is MIT-licensed and fully open source. The hosted version is free during beta. Self-hosted is free forever. You only pay for Supabase and Groq usage, both of which have generous free tiers that cover most users."],
              ["Do I need a Groq API key?","Only for AI auto-fill. Every other feature — dashboard, tracking, simulation, export, analytics, settings — works without it. You can add a key at any time in Settings."],
              ["Where is my data stored?","In your own Supabase PostgreSQL database. Subsight never has direct access to your data. You own it completely, and you can export or delete it at any time."],
              ["Can it detect subscriptions from my bank?","Not currently. Subsight is manual + AI-assisted. Bank auto-detection is on the roadmap, but we prioritize privacy — no bank credentials needed today."],
              ["What export formats are supported?","JSON, CSV, and PDF — accessible via a single click or keyboard shortcuts: Ctrl+E (JSON), Ctrl+S (CSV), Ctrl+P (PDF)."],
              ["Is there a mobile app?","Not yet — web-only today, but the interface is fully responsive and works well on mobile browsers. A native app is on the roadmap."],
              ["Can I self-host on my own server?","Absolutely. Clone the GitHub repo, set up a Supabase project, add your environment variables, and deploy anywhere Next.js runs — Vercel, Railway, fly.io, or any VPS."],
            ].map(([q,a]) => <Reveal key={q}><FAQItem q={q} a={a} t={t} /></Reveal>)}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ══════════════════════════════════════════════════════════ */}
      <section className="section-pad" style={{ padding:"80px 24px 100px" }}>
        <div style={{ maxWidth:1080, margin:"0 auto" }}>
          <Reveal>
            <div className="cta-box" style={{ background:t.surface, border:`1px solid ${t.greenBorder}`, borderRadius:18, padding:"80px 64px", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", right:-80, top:-80, width:480, height:480, background:`radial-gradient(circle, ${t.greenGlow} 0%, transparent 65%)`, pointerEvents:"none" }} />
              <div style={{ position:"absolute", left:-60, bottom:-60, width:300, height:300, background:`radial-gradient(circle, ${t.greenGlow} 0%, transparent 65%)`, pointerEvents:"none" }} />
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
          <div className="footer-grid" style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:48, marginBottom:48 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                <div style={{ width:28, height:28, background:t.green, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center" }}><PieChart size={14} color="#000" strokeWidth={2.5} /></div>
                <span style={{ fontFamily:"var(--font-display)", fontSize:18, fontWeight:800, color:t.text }}>Subsight</span>
              </div>
              <p style={{ fontSize:13, color:t.text3, fontFamily:"var(--font-mono)", lineHeight:1.7, maxWidth:240 }}>A real-time subscription tracker with AI insights. Open source. Free forever.</p>
            </div>
            {[
              { title:"Product",    links:[["Features","#features"],["Pricing","#pricing"],["Compare","#compare"],["Dashboard","/dashboard"]] },
              { title:"Developers", links:[["GitHub","https://github.com/MuhammadTanveerAbbas/Subsight-Tracker"],["Live Demo","https://subsight-tracker.vercel.app/"],["Author","https://muhammadtanveerabbas.vercel.app/"]] },
              { title:"Legal",      links:[["Privacy Policy","/privacy"],["Terms of Service","/terms"]] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize:11, fontWeight:700, color:t.text, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"var(--font-mono)", marginBottom:16 }}>{col.title}</div>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {col.links.map(([label,href]) => (
                    <a key={label} href={href} target={href.startsWith("http")?"_blank":"_self"} rel={href.startsWith("http")?"noopener":""} style={{ fontSize:13, color:t.text3, fontFamily:"var(--font-mono)", transition:"color 0.2s" }} onMouseEnter={e=>(e.currentTarget.style.color=t.green)} onMouseLeave={e=>(e.currentTarget.style.color=t.text3)}>{label}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="footer-bottom" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:24, borderTop:`1px solid ${t.border}`, flexWrap:"wrap", gap:14 }}>
            <p style={{ fontSize:11, color:t.text3, fontFamily:"var(--font-mono)" }}>© 2025 Subsight · Built by Muhammad Tanveer Abbas · MIT License</p>
            <div className="footer-bottom-links" style={{ display:"flex", gap:20 }}>
              {[["GitHub","https://github.com/MuhammadTanveerAbbas/Subsight-Tracker"],["Live App","https://subsight-tracker.vercel.app/"],["Privacy","/privacy"],["Terms","/terms"]].map(([label,href]) => (
                <a key={label} href={href} target={href.startsWith("http")?"_blank":"_self"} rel={href.startsWith("http")?"noopener":""} style={{ fontSize:11, color:t.text3, fontFamily:"var(--font-mono)", transition:"color 0.2s" }} onMouseEnter={e=>(e.currentTarget.style.color=t.green)} onMouseLeave={e=>(e.currentTarget.style.color=t.text3)}>{label}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
