"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  LayoutDashboard, Sparkles, ToggleLeft, Download, Search, Shield, Menu, X, HelpCircle,
  ArrowRight, Check, ChevronDown, ChevronUp, ChevronRight,
  TrendingUp, Zap, Sun, Moon, Bell, CreditCard,
  BarChart3, ArrowUpRight, Lock, Globe, RefreshCw, GitBranch, Wallet, Target, ListTree, UserPlus,
  FileJson, FileSpreadsheet, FileText, Cloud, Play,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Theme, ThemeKey } from "./marketing-constants";
import { DARK, LIGHT } from "./marketing-constants";
import LetterGlitch from "@/components/LetterGlitch";
import { Safari } from "@/components/ui/safari";
import { SiFigma, SiNetflix, SiSpotify, SiApple, SiVercel, SiStripe, SiYoutube } from "react-icons/si";

// ─── Scroll reveal ────────────────────────────────────────────────────────────
function Reveal({ children, delay: _delay = 0, y: _y = 0 }: { children: React.ReactNode; delay?: number; y?: number }) {
  return <div>{children}</div>;
}

// ─── Section label ────────────────────────────────────────────────────────────
function Label({ text, t }: { text:string; t:Theme }) {
  return <span style={{ fontSize: 12, color: t.text3, fontFamily:"var(--font-display)", display:"block", marginBottom:12 }}>{text}</span>;
}

// ─── Ticker ───────────────────────────────────────────────────────────────────
function Ticker({ t }: { t:Theme }) {
  const items: { word:string; Icon:React.ElementType }[] = [
    { word:"Analytics", Icon:BarChart3 },
    { word:"Insights",  Icon:Sparkles },
    { word:"Tracking",  Icon:Target },
    { word:"Vault",     Icon:Lock },
    { word:"Budgets",   Icon:Wallet },
    { word:"Export",    Icon:Download },
    { word:"Alerts",    Icon:Bell },
    { word:"Trends",    Icon:TrendingUp },
    { word:"Security",  Icon:Shield },
    { word:"Automation",Icon:Zap },
  ];
  const track = [...items, ...items];
  return (
    <div style={{ borderTop:`1px solid ${t.border}`, borderBottom:`1px solid ${t.border}`, background:t.surface, padding:"14px 0", overflow:"hidden" }}>
      <style>{`@keyframes subsight-ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
      <div style={{ display:"flex", gap:48, width:"max-content", animation:"subsight-ticker 28s linear infinite" }}>
        {track.map(({ word, Icon },i) => (
          <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:8, fontSize:12, color:t.text2, fontFamily:"var(--font-display)", whiteSpace:"nowrap" }}>
            <Icon size={14} strokeWidth={1.5} color={t.greenInk} />
            {word}
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
  return (
    <div style={{ flex:1, padding:"14px 16px 8px", borderRight:`1px solid ${t.border}`, minWidth:0, display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
        <BarChart3 size={16} strokeWidth={1.5} color={t.text2} />
        <span style={{ fontSize: 12, color:t.text2, fontFamily:"var(--font-display)" }}>Monthly spending</span>
      </div>
      <div style={{ display:"flex", alignItems:"stretch", gap:4, flex:1, minHeight:0 }}>
        {vals.map((v,i) => (
          <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2, minWidth:0 }}>
            <div style={{ width:"100%", background:t.surface2, borderRadius:2, flex:1, minHeight:0, display:"flex", alignItems:"flex-end" }}>
              <div style={{ width:"100%", borderRadius:"2px 2px 0 0", background:i===11?t.green:t.border2, height:`${(v/max)*100}%` }} />
            </div>
            <span style={{ fontSize:11, color:t.text3, fontFamily:"var(--font-mono)" }}>{months[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Mini donut (Dashboard Preview) ──────────────────────────────────────────
function MiniDonut({ t }: { t:Theme }) {
  const segs = [{ p:33 },{ p:28 },{ p:22 },{ p:17 }];
  const colors = [t.green, t.border2, t.surface3, t.surface2];
  const r=34, cx=44, cy=44, circ=2*Math.PI*r;
  let cum=0;
  return (
    <div style={{ padding:"16px", display:"flex", alignItems:"center", gap:12, flexShrink:0, minWidth:0 }}>
      <svg width="88" height="88" viewBox="0 0 88 88" aria-label="Spending by category">
        {segs.map((seg,i) => {
          const dash=(seg.p/100)*circ, off=-((cum/100)*circ);
          cum+=seg.p;
          return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={colors[i]} strokeWidth="12" strokeDasharray={`${dash} ${circ-dash}`} strokeDashoffset={off} style={{ transform:"rotate(-90deg)", transformOrigin:`${cx}px ${cy}px` }} />;
        })}
        <text x={cx} y={cy-4} textAnchor="middle" fill={t.text} fontSize="14" fontFamily="var(--font-display)" fontWeight="500">$388</text>
        <text x={cx} y={cy+12} textAnchor="middle" fill={t.text3} fontSize="11" fontFamily="var(--font-display)">per month</text>
      </svg>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {["Dev tools","Design","Cloud","Other"].map((label,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ width:6, height:6, borderRadius:1, background:colors[i], flexShrink:0 }} />
            <span style={{ fontSize: 12, color:t.text2, fontFamily:"var(--font-display)" }}>{label}</span>
            <span style={{ fontSize: 12, color:t.text, fontFamily:"var(--font-mono)", marginLeft:"auto", fontVariantNumeric:"tabular-nums" }}>{segs[i]?.p ?? 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Forecast chart with hover details ───────────────────────────────────────
function ForecastChart({ t }: { t:Theme }) {
  const [active, setActive] = useState<number | null>(null);
  const points = [
    { m:"Dec", v:"$182", x:0,   y:104 },
    { m:"Jan", v:"$196", x:80,  y:84 },
    { m:"Feb", v:"$214", x:160, y:64 },
    { m:"Mar", v:"$239", x:240, y:36 },
  ];
  const activePoint = active === null ? null : points[active] ?? null;
  const line = "M0 104 C 40 94, 60 90, 80 84 S 140 72, 160 64 S 220 48, 240 36 L320 20";
  return (
    <div style={{ position:"relative", marginTop:16 }}>
      <svg viewBox="0 0 320 140" width="100%" height="140" role="img" aria-label="Monthly forecast" style={{ display:"block", overflow:"visible" }}>
        {[28, 64, 100, 136].map((y) => <line key={y} x1="0" y1={y} x2="320" y2={y} stroke={t.grid} strokeWidth="1" />)}
        <path d={`${line} L320 140 L0 140 Z`} fill={t.greenDim} />
        <path d={line} fill="none" stroke={t.green} strokeWidth="2" strokeLinecap="round" />
        {points.map((p, i) => (
          <g key={p.m} onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)} style={{ cursor:"pointer" }}>
            <circle cx={p.x} cy={p.y} r={active === i ? 6 : 4} fill={t.green} stroke={t.bg} strokeWidth={active === i ? 3 : 2} style={{ transition:"r 0.15s ease" }} />
            <circle cx={p.x} cy={p.y} r={16} fill="transparent" />
          </g>
        ))}
      </svg>
      {activePoint && (
        <div style={{ position:"absolute", left:`${(activePoint.x / 320) * 100}%`, top:`${(activePoint.y / 140) * 100}%`, transform:"translate(-50%,-140%)", background:t.surface, border:`1px solid ${t.greenBorder}`, borderRadius:8, padding:"6px 10px", whiteSpace:"nowrap", pointerEvents:"none", zIndex:2, boxShadow:"0 4px 14px rgba(0,0,0,0.12)" }}>
          <div style={{ fontSize:11, color:t.text3, fontFamily:"var(--font-mono)" }}>{activePoint.m}</div>
          <div style={{ fontSize:14, color:t.text, fontFamily:"var(--font-display)", fontWeight:500 }}>{activePoint.v}</div>
        </div>
      )}
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:t.text3, fontFamily:"var(--font-mono)" }}>
        {points.map(p => <span key={p.m}>{p.m}</span>)}
      </div>
    </div>
  );
}

// ─── Scaled dashboard preview (keeps the mockup proportional at any width) ───
function ScaledDashPreview({ t }: { t:Theme }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / 1200);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={wrapRef} style={{ width:"100%", height:"100%", overflow:"hidden" }}>
      <div style={{ width:1200, height:700, transform:`scale(${scale})`, transformOrigin:"top left" }}>
        <DashPreview t={t} />
      </div>
    </div>
  );
}

// ─── Compact dashboard preview for small screens ─────────────────────────────
function MobileDashPreview({ t }: { t:Theme }) {
  const kpis = [
    { l:"Monthly spend", v:"$388.18" },
    { l:"Active subs",   v:"14" },
    { l:"Annual total",  v:"$4,658" },
    { l:"Due soon",      v:"AWS" },
  ];
  const bars = [29,31,27,34,42,38,31,46,39,35,43,38];
  const max = Math.max(...bars);
  const rows = [
    { n:"Netflix", a:"$15.99" },
    { n:"AWS",     a:"$43.20" },
    { n:"Notion",  a:"$16.00" },
  ];
  return (
    <div style={{ width:"100%", maxWidth:420, margin:"24px auto 0", display:"flex", flexDirection:"column", gap:10 }}>
      <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:10, padding:"10px 12px", display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ width:7, height:7, borderRadius:"50%", background:t.green, flexShrink:0 }} />
        <span style={{ fontSize:12, color:t.text, fontFamily:"var(--font-display)" }}>Dashboard</span>
        <span style={{ marginLeft:"auto", fontSize:10, color:t.text3, fontFamily:"var(--font-mono)" }}>Overview</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        {kpis.map(k => (
          <div key={k.l} style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:10, padding:"11px 12px", minWidth:0 }}>
            <div style={{ fontSize:11, color:t.text3, fontFamily:"var(--font-display)" }}>{k.l}</div>
            <div style={{ fontSize:18, fontWeight:500, color:t.text, fontFamily:"var(--font-display)", marginTop:6, fontVariantNumeric:"tabular-nums", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{k.v}</div>
          </div>
        ))}
      </div>
      <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:10, padding:12 }}>
        <div style={{ fontSize:11, color:t.text2, fontFamily:"var(--font-display)", marginBottom:10 }}>Monthly spending</div>
        <div style={{ display:"flex", alignItems:"flex-end", gap:3, height:64 }}>
          {bars.map((v,i) => <div key={i} style={{ flex:1, height:`${(v/max)*100}%`, background:i===bars.length-1?t.green:t.border2, borderRadius:"2px 2px 0 0" }} />)}
        </div>
      </div>
      <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:10, overflow:"hidden" }}>
        {rows.map((r,i) => (
          <div key={r.n} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 12px", borderTop:i?`1px solid ${t.border}`:"none" }}>
            <span style={{ flex:1, fontSize:12, color:t.text, fontFamily:"var(--font-display)" }}>{r.n}</span>
            <span style={{ fontSize:12, color:t.text, fontFamily:"var(--font-mono)" }}>{r.a}</span>
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
    <div style={{ background:t.surface, overflow:"hidden", width:"100%", height:"100%", minWidth:0, display:"flex", flexDirection:"column" }}>
      {/* Chrome bar */}
      <div style={{ background:t.surface2, borderBottom:`1px solid ${t.border}`, padding:"10px 18px", display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ width:7, height:7, borderRadius:"50%", background:t.green, flexShrink:0 }} />
        <span style={{ fontSize: 12, color:t.text2, fontFamily:"var(--font-display)" }}>Dashboard</span>
        <span style={{ marginLeft:"auto", fontSize:11, color:t.text3, fontFamily:"var(--font-mono)" }}>Overview</span>
      </div>
      {/* KPI row */}
      <div className="dash-preview-kpi" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", borderBottom:`1px solid ${t.border}`, flexShrink:0 }}>
        {[
          { l:"Monthly Spend", v:"$388.18", I:CreditCard,  hint:"this month",  tone:t.text },
          { l:"Active Subs",   v:"14",      I:Zap,         hint:"running",      tone:t.text },
          { l:"Annual Total",  v:"$4,658",  I:TrendingUp,  hint:"projected",    tone:t.text },
          { l:"Due Soon",      v:"AWS",     I:Bell,        hint:"in 1 day",     tone:t.amber },
        ].map(({ l,v,I,hint,tone },i) => (
          <div key={i} style={{ padding:"14px 16px", borderRight:i<3?`1px solid ${t.border}`:"none", display:"flex", flexDirection:"column", gap:8, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ width:24, height:24, borderRadius:6, background:t.surface2, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <I size={13} strokeWidth={1.5} color={t.text3} />
              </span>
              <span style={{ fontSize:11, color:t.text3, fontFamily:"var(--font-display)" }}>{l}</span>
            </div>
            <div style={{ fontFamily:"var(--font-display)", fontSize:20, fontWeight:500, color:tone, lineHeight:1, fontVariantNumeric:"tabular-nums", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{v}</div>
            <span style={{ fontSize:10, color:t.text3, fontFamily:"var(--font-mono)" }}>{hint}</span>
          </div>
        ))}
      </div>
      {/* Charts */}
      <div className="dash-chart-row" style={{ display:"flex", borderBottom:`1px solid ${t.border}`, flexWrap:"wrap", flex:1, minHeight:0 }}>
        <MiniBars t={t} />
        <MiniDonut t={t} />
      </div>
      {/* Table */}
      <div style={{ overflowX:"auto", flexShrink:0 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1.8fr 1.5fr 1fr 0.8fr", padding:"9px 18px", borderBottom:`1px solid ${t.border}`, minWidth:320 }}>
          {["Service","Category","Amount","Renews"].map(h => <span key={h} style={{ fontSize: 11, color:t.text3, letterSpacing: 0, fontFamily:"var(--font-mono)" }}>{h}</span>)}
        </div>
        {rows.map((row,i) => (
          <div key={i} style={{ display:"grid", gridTemplateColumns:"1.8fr 1.5fr 1fr 0.8fr", padding:"12px 20px", borderBottom:i<rows.length-1?`1px solid ${t.border}`:"none", minWidth:320 }}>
            <span style={{ fontSize:13, color:t.text, fontFamily:"var(--font-display)" }}>{row.name}</span>
            <span style={{ fontSize: 13, color:t.text2, fontFamily:"var(--font-display)" }}>{row.cat}</span>
            <span style={{ fontSize:13, color:t.text, fontFamily:"var(--font-mono)", fontVariantNumeric:"tabular-nums" }}>{row.amt}</span>
            <span style={{ fontSize: 12, fontFamily:"var(--font-mono)", color:row.warn?t.amber:t.greenInk }}>in {row.due}</span>
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
          <Wallet size={17} color={t.greenInk} />
          <span style={{ fontFamily:"var(--font-display)", fontSize:15, fontWeight: 500, color:t.text }}>Vault</span>
        </div>
        <span style={{ fontSize: 12, color:t.text3, fontFamily:"var(--font-mono)" }}>Private to your account</span>
      </div>
      <div style={{ marginTop:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize: 12, color:t.text3, fontFamily:"var(--font-mono)", marginBottom:8 }}>
          <span>Monthly budget used</span><span style={{ color: t.greenInk }}>62%</span>
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
  return (
    <div style={{ background:t.bg, padding:"28px 24px", position:"relative", transition:"background-color 0.15s ease" }}
      onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background=t.surface2; }}
      onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background=t.bg; }}>
      {tag && <span style={{ position:"absolute", top:24, right:24, fontSize:12, color: t.text3, fontFamily:"var(--font-display)" }}>{tag}</span>}
      <span style={{ display:"flex", width:20, height:20, alignItems:"center", justifyContent:"center", marginBottom:20 }}>
        <Icon size={16} strokeWidth={1.5} color={t.text2} />
      </span>
      <h3 style={{ fontFamily:"var(--font-display)", fontSize:16, fontWeight:500, color:t.text, marginBottom:8 }}>{title}</h3>
      <p style={{ fontSize:13, color:t.text2, lineHeight:1.6, fontFamily:"var(--font-display)" }}>{desc}</p>
    </div>
  );
}

// ─── Why Subsight cards ───────────────────────────────────────────────────────
const WHY_ITEMS = [
  { icon: Lock,       title: "You own your data",         desc: "Your Supabase, no vendor lock-in, no data harvesting, full control." },
  { icon: Sparkles,   title: "AI auto-fill",              desc: "Auto-fill adds price, category and billing cycle from a name." },
  { icon: ToggleLeft, title: "Simulate before you cut",   desc: "Toggle subscriptions off to see exact budget impact before cancelling." },
  { icon: Shield,     title: "Open source & auditable",   desc: "MIT licensed, public code, no black boxes, tracking, or surprises." },
  { icon: Bell,       title: "Renewal reminders",         desc: "Get email reminders days before every charge, on your schedule." },
  { icon: Globe,      title: "Self-host anywhere",        desc: "Deploy anywhere with one command: Vercel, Railway, fly.io or VPS." },
] as const;
function WhyCard({ icon: Icon, title, desc, t }: { icon: React.ElementType; title: string; desc: string; t: Theme }) {
  return (
    <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:14, padding:"24px 24px", transition: "background-color 0.15s ease" }}
      onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background=t.surface2; }}
      onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background=t.surface; }}>
      <span style={{ display:"flex", width:20, height:20, alignItems:"center", justifyContent:"center", marginBottom:20 }}>
        <Icon size={16} strokeWidth={1.5} color={t.text2} />
      </span>
      <h3 style={{ fontFamily:"var(--font-display)", fontSize:16, fontWeight:500, color:t.text, marginBottom:8 }}>{title}</h3>
      <p style={{ fontSize:13, color:t.text2, lineHeight:1.6, fontFamily:"var(--font-display)" }}>{desc}</p>
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
        <span style={{ fontSize: 12, color: t.greenInk, fontFamily:"var(--font-mono)", fontWeight: 500, letterSpacing: 0, flexShrink:0, marginTop:3, opacity:0.7 }}>{String(idx+1).padStart(2,"0")}</span>
        <span style={{ fontSize:14, fontWeight: 500, color:t.text, fontFamily:"var(--font-display)", lineHeight:1.45, flex:1 }}>{q}</span>
        <span style={{ width:24, height:24, borderRadius:6, background: open ? t.greenDim : t.surface3, border:`1px solid ${open ? t.greenBorder : t.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition: "background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease", marginTop:1 }}>
          {open ? <ChevronUp size={12} color={t.greenInk} /> : <ChevronDown size={12} color={t.text3} />}
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
  const [pastHero, setPastHero] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeReady, setThemeReady] = useState(false);
  const t = themeKey === "dark" ? DARK : LIGHT;

  useEffect(() => {
    const stored = localStorage.getItem("subsight-theme");
    const initial: ThemeKey = stored === "dark" ? "dark" : "light";
    setThemeKey(initial);
    document.documentElement.setAttribute("data-theme", initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
    setThemeReady(true);
  }, []);

  useEffect(() => {
    if (!themeReady) return;
    localStorage.setItem("subsight-theme", themeKey);
    document.documentElement.setAttribute("data-theme", themeKey);
    document.documentElement.classList.toggle("dark", themeKey === "dark");
  }, [themeKey, themeReady]);

  useEffect(() => {
    const h = () => { setScrolled(window.scrollY > 40); setPastHero(window.scrollY > window.innerHeight * 0.7); };
    window.addEventListener("scroll", h, { passive:true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const toggle = useCallback(() => setThemeKey(p => p==="dark" ? "light" : "dark"), []);

  const btnPrimary: React.CSSProperties = { background:t.green, color:"#fff", border:"none", borderRadius:8, padding:"12px 24px", fontSize:14, fontWeight: 500, fontFamily:"var(--font-display)", cursor:"pointer", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:8, transition:"background-color 0.15s ease" };
  const btnGhost:   React.CSSProperties = { background:t.surface, color:t.text, border:`1px solid ${t.border2}`, borderRadius:8, padding:"12px 24px", fontSize:14, fontFamily:"var(--font-display)", fontWeight: 500, cursor:"pointer", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:8, transition:"border-color 0.15s ease, color 0.15s ease" };

  return (
    <div style={{ background:t.bg, color:t.text, fontFamily:"var(--font-display)", minHeight:"100vh", overflowX:"hidden", transition:"background 0.4s, color 0.4s" }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{overflow-x:hidden}
        :root{--font-display:var(--font-inter),system-ui,sans-serif;--font-mono:var(--font-jetbrains-mono),'Courier New',monospace}
        a{color:inherit;text-decoration:none}
        .nav-wrap .brand-mark{filter:none!important}

        .nav-desktop{display:flex!important}
        .nav-menu-btn{display:none}
        .hero-preview-mobile{display:none}
        @media(max-width:900px){.feat-grid{grid-template-columns:repeat(3,1fr)!important}.hero-grid{grid-template-columns:1fr!important;gap:32px!important}.story-grid{grid-template-columns:1fr!important;gap:32px!important}.story-reverse{flex-direction:column!important}}
         @media(max-width:820px){.steps-grid{grid-template-columns:1fr!important}.vault-spotlight{grid-template-columns:1fr!important;gap:32px!important}}
        @media(max-width:768px){
          .nav-desktop{display:none!important}
          .nav-menu-btn{display:flex!important}
          .nav-cta{display:none!important}
          .feat-grid{grid-template-columns:repeat(2,1fr)!important}
          .hero-brand{display:none!important}
          .nav-wrap{display:flex!important;justify-content:space-between!important;align-items:center!important;padding:0 16px!important;grid-template-columns:unset!important}
          .stats-grid{grid-template-columns:repeat(2,1fr)!important}
                    .cta-inner{flex-direction:column!important;align-items:stretch!important;text-align:center!important}
          .cta-btns{justify-content:center!important}
          .footer-main{padding:56px 20px 28px!important}
          .footer-grid{grid-template-columns:1fr 1fr!important;gap:28px 20px!important;margin-bottom:32px!important}
          .footer-col{border-top:1px solid var(--border);padding-top:16px}
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
          .export-grid{grid-template-columns:1fr!important}
          .nav-wrap{padding:0 12px!important}
          .hero-preview-desktop{display:none!important}
          .hero-preview-mobile{display:block!important}
          .footer-grid{grid-template-columns:1fr 1fr!important;gap:24px 16px!important}
          .footer-brand p{max-width:none!important}
          .footer-bottom{flex-direction:column!important;text-align:center!important;gap:14px!important}
          .footer-bottom-links{display:grid!important;grid-template-columns:1fr 1fr!important;justify-items:center!important;gap:10px!important}
          .hero-section{padding:88px 16px 56px!important}
          .cta-btns{flex-direction:column!important;align-items:stretch!important}
          .cta-btns a,.cta-btns button{justify-content:center!important}
          .add-inner-grid{grid-template-columns:1fr!important}
        }
        @media(max-width:400px){
          .footer-grid{gap:20px 12px!important}
          .footer-col a{font-size:12px!important}
        }
      `}</style>

      {/* ═══ NAV ════════════════════════════════════════════════════════════════ */}
      <nav className="nav-wrap" style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, display:"grid", gridTemplateColumns:"1fr auto 1fr", alignItems:"center", padding:"0 40px", height:68, background: pastHero ? t.bg : (themeKey==="dark" ? "rgba(10,10,10,0.32)" : "rgba(255,255,255,0.32)"), backdropFilter: pastHero ? "none" : "blur(14px)", WebkitBackdropFilter: pastHero ? "none" : "blur(14px)", borderBottom: pastHero ? `1px solid ${t.border}` : (themeKey==="dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)"), transition: "background-color 0.25s ease, border-color 0.25s ease, backdrop-filter 0.25s ease" }}>

        {/* Logo */}
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none", flexShrink:0 }}>
          <Image src="/Subsight.png" className="brand-mark" alt="Subsight" width={32} height={32} style={{ borderRadius:9, flexShrink:0, display:"block" }} />
          <span style={{ fontFamily:"var(--font-display)", fontSize:18, fontWeight: 500, color:t.text, letterSpacing: 0 }}>Subsight</span>
        </Link>

        {/* Center nav links */}
        <div className="nav-desktop" style={{ display:"flex", alignItems:"center", gap:6 }}>
          {[
            { id:"features", label:"Features" },
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
            style={{ width:38, height:38, border:`1px solid ${t.border}`, borderRadius:10, background:t.surface, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition: "background-color 0.15s ease, border-color 0.15s ease", flexShrink:0 }}
            onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background=t.surface3; }}
            onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background=t.surface2; }}>
            {themeKey==="dark" ? <Sun size={16} strokeWidth={1.5} color={t.text2} /> : <Moon size={16} strokeWidth={1.5} color={t.text2} />}
          </button>
          <button className="nav-menu-btn" onClick={()=>setMenuOpen(o=>!o)} aria-label="Toggle navigation menu" aria-expanded={menuOpen}
            style={{ width:38, height:38, border:`1px solid ${t.border}`, borderRadius:10, background:t.surface, display:"none", alignItems:"center", justifyContent:"center", cursor:"pointer", transition: "background-color 0.15s ease, border-color 0.15s ease", flexShrink:0 }}>
            {menuOpen ? <X size={16} strokeWidth={1.5} color={t.text2} /> : <Menu size={16} strokeWidth={1.5} color={t.text2} />}
          </button>
          <Link href="/sign-up" className="nav-cta"
            style={{ background:t.green, color:"#000", borderRadius:8, padding:"8px 16px", fontSize:13, fontWeight: 500, fontFamily:"var(--font-display)", display:"flex", alignItems:"center", gap:8, textDecoration:"none", transition: "background-color 0.15s ease", whiteSpace:"nowrap" }}
            onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background=t.green2; }}
            onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background=t.green; }}>
            Get started <ArrowRight size={16} strokeWidth={1.5} />
          </Link>

        </div>
        {menuOpen && (
          <div className="nav-mini-menu" style={{ position:"absolute", top:"calc(100% + 8px)", right:12, width:"min(232px, calc(100vw - 24px))", border:`1px solid ${t.border}`, borderRadius:12, background:t.bg, padding:8, display:"flex", flexDirection:"column", gap:2, boxShadow:"0 1px 2px rgba(0,0,0,0.08)" }}>
            {[
              { id:"features", label:"Features", Icon:LayoutDashboard },
              { id:"compare", label:"Compare", Icon:BarChart3 },
              { id:"faq", label:"FAQ", Icon:HelpCircle },
            ].map(({ id, label, Icon }) => (
              <a key={id} href={`#${id}`} onClick={()=>setMenuOpen(false)}
                style={{ display:"flex", alignItems:"center", gap:10, fontSize:13, color:t.text, fontFamily:"var(--font-display)", fontWeight:500, padding:"9px 11px", borderRadius:8, background:"transparent" }}
                onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background=t.surface2; }}
                onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background="transparent"; }}>
                <Icon size={15} strokeWidth={1.5} color={t.text3} aria-hidden="true" />
                <span style={{ flex:1 }}>{label}</span>
                <ChevronRight size={14} strokeWidth={1.5} color={t.text3} aria-hidden="true" />
              </a>
            ))}
            <div style={{ height:1, background:t.border, margin:"6px 4px" }} />
            <Link href="/sign-up" onClick={()=>setMenuOpen(false)}
              style={{ background:t.green, color:"#000", borderRadius:8, padding:"10px 12px", fontSize:12.5, fontWeight:500, fontFamily:"var(--font-display)", display:"flex", alignItems:"center", justifyContent:"space-between", textDecoration:"none" }}>
              Get started <ArrowRight size={15} strokeWidth={1.5} />
            </Link>
          </div>
        )}
      </nav>



      {/* ═══ HERO ═══════════════════════════════════════════════════════════════ */}
      <section className="section-pad hero-section" style={{ minHeight:"100vh", display:"flex", alignItems:"center", padding:"120px 24px 80px", background:"transparent", overflow:"hidden", position:"relative" }}>
        <LetterGlitch
          glitchColors={undefined}
          baseColor={undefined}
          backgroundColor={undefined}
          dpr={undefined}
          lightMode={themeKey === "light"}
          baseOpacity={0.14}
          glitchAmount={0.45}
          flow={0.35}
          interactive={true}
          style={{ position:"absolute", inset:0, zIndex:0 }}
        />
        {[
          { Icon: SiFigma,   left: "4%",  top: "14%" },
          { Icon: SiNetflix, left: "7%",  top: "36%" },
          { Icon: SiSpotify, left: "12%", top: "22%" },
          { Icon: SiApple,   right: "5%", top: "12%" },
          { Icon: SiVercel,  right: "8%", top: "34%" },
          { Icon: SiStripe,  right: "3%", top: "54%" },
          { Icon: SiYoutube, right: "11%", top: "20%" },
        ].map(({ Icon, left, right, top }, i) => (
          <div key={i} className="hero-brand" style={{ position:"absolute", left, right, top, width:42, height:42, borderRadius:"50%", border:`1px solid ${t.border2}`, background:t.surface, display:"flex", alignItems:"center", justifyContent:"center", zIndex:0, opacity:0.75, transition:"opacity 0.2s ease, border-color 0.2s ease, background-color 0.2s ease" }}
            onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.opacity="1"; (e.currentTarget as HTMLElement).style.borderColor=t.border2; (e.currentTarget as HTMLElement).style.background=t.surface2; }}
            onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.opacity="0.75"; (e.currentTarget as HTMLElement).style.borderColor=t.border2; (e.currentTarget as HTMLElement).style.background=t.surface; }}>
            <Icon size={17} color={t.text2} />
          </div>
        ))}
        <div style={{ maxWidth:1200, margin:"0 auto", width:"100%", position:"relative", zIndex:1 }}>
          <div className="hero-grid" style={{ display:"grid", gridTemplateColumns:"1fr", gap:48, alignItems:"center" }}>
            <div style={{ minWidth:0, textAlign:"center" }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"6px 14px", borderRadius:999, border:`1px solid ${t.border2}`, background:t.surface, marginBottom:24 }}>
                <Sparkles size={12} strokeWidth={1.5} color={t.greenInk} />
                <span style={{ fontSize:12, color:t.text2, fontFamily:"var(--font-display)", fontWeight:500 }}>Open source · Free forever</span>
              </div>
              <h1 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(32px,4.5vw,52px)", fontWeight:500, lineHeight:1.1, color:t.text, maxWidth:560, margin:"0 auto" }}>
                Every subscription and personal expense in one clear view
              </h1>
              <p style={{ marginTop:24, fontSize:16, color:t.text2, maxWidth:440, lineHeight:1.6, fontFamily:"var(--font-display)", marginLeft:"auto", marginRight:"auto" }}>
                Subsight tracks recurring charges and keeps personal spending in a private vault. Budgets, analytics and renewal reminders included.
              </p>
              <div className="cta-btns" style={{ display:"flex", gap:12, marginTop:32, flexWrap:"wrap", justifyContent:"center" }}>
                <Link href="/sign-up" style={btnPrimary}>
                  <ArrowRight size={16} strokeWidth={1.5} /> Create free account
                </Link>
                <a href="#features" style={btnGhost}>
                  <LayoutDashboard size={16} strokeWidth={1.5} /> See how it works
                </a>
              </div>
              <div style={{ display:"flex", gap:24, marginTop:24, color:t.text3, fontSize:12, flexWrap:"wrap", justifyContent:"center" }}>
                <span style={{ display:"inline-flex", alignItems:"center", gap:8 }}><GitBranch size={16} strokeWidth={1.5} /> Open source</span>
                <span style={{ display:"inline-flex", alignItems:"center", gap:8 }}><Shield size={16} strokeWidth={1.5} /> No card required</span>
              </div>
            </div>
            <div className="hero-preview-desktop" style={{ width:"100%", maxWidth:960, margin:"24px auto 0", position:"relative" }}>
              <Safari
                url="app.subsight.dev/dashboard"
                frameColor={themeKey === "dark" ? "#2a2a2a" : "#e5e5e5"}
                innerColor={themeKey === "dark" ? "#141414" : "#ffffff"}
                toolbarColor={themeKey === "dark" ? "#8a8a8a" : "#a3a3a3"}
                style={{ width:"100%" }}
              />
              <div style={{ position:"absolute", left:"0.083%", top:"6.9%", width:"99.75%", height:"92.96%", overflow:"hidden", zIndex:20, borderRadius:"0 0 11px 11px", background:t.surface }}>
                <ScaledDashPreview t={t} />
              </div>
            </div>
            <div className="hero-preview-mobile"><MobileDashPreview t={t} /></div>
          </div>

        </div>
      </section>


      {/* ═══ TICKER ════════════════════════════════════════════════════════════ */}
      <Ticker t={t} />

      {/* ═══ FEATURES ══════════════════════════════════════════════════════════ */}
      <section id="features" className="section-pad" style={{ padding:"100px 24px" }}>
        <div style={{ maxWidth:1080, margin:"0 auto" }}>
          <Reveal><Label text="Features" t={t} />
            <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(28px,4vw,44px)", color:t.text, lineHeight:1.1, maxWidth:560 }}>Track every recurring charge in one place</h2>
            <p style={{ fontSize:14, color:t.text2, maxWidth:420, marginTop:12, lineHeight:1.6, fontFamily:"var(--font-display)" }}>Subscriptions, personal expenses, budgets and renewal reminders, kept together.</p>
          </Reveal>
          <div className="feat-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1px", background:t.border, border:`1px solid ${t.border}`, borderRadius:14, overflow:"hidden", marginTop:52 }}>
            {[
              { Icon:LayoutDashboard, title:"Live dashboard",         desc:"Monthly spend, active subscriptions and category breakdowns on one screen.",           tag:"Core" },
              { Icon:Sparkles,        title:"AI auto-fill",            desc:"Type a service name. The app fills in price, billing cycle and category.",                tag:"AI" },
              { Icon:ToggleLeft,      title:"Simulation mode",         desc:"Toggle subscriptions on or off to see the effect on your monthly budget." },
              { Icon:Download,        title:"Export",                  desc:"Export the full list to JSON, CSV or PDF in one step." },
              { Icon:Search,          title:"Search and filter",       desc:"Find a subscription by name, category, status or renewal date." },
              { Icon:Shield,          title:"Your data",               desc:"Runs on your own Supabase instance. Export or delete everything at any time." },
              { Icon:Wallet,          title:"Private expense vault",   desc:"Record personal purchases in a space separate from your subscriptions." },
              { Icon:Target,          title:"Vault budget",            desc:"Set a monthly budget, then see category breakdowns and six-month trends." },
              { Icon:ListTree,        title:"Grouped navigation",      desc:"Overview, Manage and Account groups keep every tool one click away." },
            ].map(f => <FeatCard key={f.title} t={t} {...f} />)}
          </div>
          <Reveal delay={100}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:28, marginTop:40, flexWrap:"wrap" }}>
              {[{ icon:Lock,label:"Encrypted in transit" },{ icon:Globe,label:"Self-hostable" },{ icon:Sparkles,label:"AI spending insights" },{ icon:RefreshCw,label:"Open source, MIT" },{ icon:ArrowUpRight,label:"Hosted on Vercel" }].map(({ icon:Icon,label }) => (
                <div key={label} style={{ display:"flex", alignItems:"center", gap:8, color:t.text2 }}>
                  <Icon size={16} strokeWidth={1.5} color={t.text3} />
                  <span style={{ fontSize:12, fontFamily:"var(--font-display)" }}>{label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>


      {/* ═══ ONE LEDGER ═════════════════════════════════════════════════════════ */}
      <section id="plan" className="section-pad" style={{ padding:"96px 24px", background:t.bg }}>
        <div style={{ maxWidth:1080, margin:"0 auto" }}>
          <div className="story-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, alignItems:"center" }}>
            <Reveal>
              <div style={{ textAlign:"center" }}>
              <Label text="Plan" t={t} />
              <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(28px,4vw,44px)", color:t.text, lineHeight:1.1, maxWidth:520, margin:"0 auto" }}>One ledger for recurring and personal spend</h2>
              <p style={{ fontSize:14, color:t.text2, marginTop:12, lineHeight:1.6, maxWidth:440, fontFamily:"var(--font-display)", marginLeft:"auto", marginRight:"auto" }}>
                Plan your subscriptions and your vault in one monthly forecast. Turn a subscription off to see what changes.
              </p>
              <div style={{ display:"flex", gap:10, marginTop:24, flexWrap:"wrap", justifyContent:"center" }}>
                <span style={{ display:"inline-flex", alignItems:"center", gap:8, fontSize:12, color:t.text2, fontFamily:"var(--font-display)", border:`1px solid ${t.border}`, borderRadius:999, padding:"6px 12px", background:t.surface }}>
                  <ToggleLeft size={14} strokeWidth={1.5} color={t.greenInk} /> Simulation mode
                </span>
                <span style={{ display:"inline-flex", alignItems:"center", gap:8, fontSize:12, color:t.text2, fontFamily:"var(--font-display)", border:`1px solid ${t.border}`, borderRadius:999, padding:"6px 12px", background:t.surface }}>
                  <Wallet size={14} strokeWidth={1.5} color={t.greenInk} /> Separate vault
                </span>
              </div>
              <div style={{ marginTop:24 }}>
                <Link href="/sign-up" style={btnPrimary}>
                  See the plan <ArrowRight size={16} strokeWidth={1.5} />
                </Link>
              </div>
              </div>
            </Reveal>
            <Reveal>
              <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:16, padding:24, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ fontSize:12, color:t.text3, fontFamily:"var(--font-display)" }}>Combined plan</div>
                  <span style={{ fontSize:11, color:t.greenInk, fontFamily:"var(--font-mono)", border:`1px solid ${t.greenBorder}`, borderRadius:999, padding:"3px 8px", background:t.greenDim }}>Forecast</span>
                </div>
                <div style={{ display:"flex", alignItems:"baseline", gap:8, marginTop:8 }}>
                  <div style={{ fontSize:36, fontWeight:500, color:t.text, fontVariantNumeric:"tabular-nums", fontFamily:"var(--font-display)" }}>$214.60</div>
                  <span style={{ fontSize:12, color:t.text3, fontFamily:"var(--font-display)" }}>per month</span>
                </div>
                <div style={{ display:"flex", gap:8, marginTop:16 }}>
                  <div style={{ flex:1, background:t.bg, border:`1px solid ${t.border}`, borderRadius:10, padding:"12px 14px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, color:t.text3, fontSize:11, fontFamily:"var(--font-display)" }}><CreditCard size={13} strokeWidth={1.5} /> Recurring</div>
                    <div style={{ fontSize:18, color:t.text, marginTop:6, fontFamily:"var(--font-display)", fontVariantNumeric:"tabular-nums" }}>$164.60</div>
                  </div>
                  <div style={{ flex:1, background:t.bg, border:`1px solid ${t.border}`, borderRadius:10, padding:"12px 14px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, color:t.text3, fontSize:11, fontFamily:"var(--font-display)" }}><Wallet size={13} strokeWidth={1.5} /> Vault</div>
                    <div style={{ fontSize:18, color:t.text, marginTop:6, fontFamily:"var(--font-display)", fontVariantNumeric:"tabular-nums" }}>$50.00</div>
                  </div>
                </div>
                <div style={{ display:"flex", height:6, borderRadius:3, overflow:"hidden", marginTop:16, background:t.surface3 }}>
                  <div style={{ width:"77%", background:t.green }} />
                  <div style={{ width:"23%", background:t.border2 }} />
                </div>
                <ForecastChart t={t} />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ RENEWAL CALENDAR ═══════════════════════════════════════════════════ */}
      <section id="calendar" className="section-pad" style={{ padding:"96px 24px", background:t.bg }}>
        <div style={{ maxWidth:1080, margin:"0 auto" }}>
          <Reveal>
            <div style={{ textAlign:"center", maxWidth:620, margin:"0 auto 52px" }}>
              <Label text="Calendar" t={t} />
              <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(28px,4vw,44px)", color:t.text, lineHeight:1.1 }}>See what renews and when</h2>
              <p style={{ fontSize:14, color:t.text2, marginTop:12, lineHeight:1.6, fontFamily:"var(--font-display)" }}>
                A month view of every upcoming charge, with the next two weeks listed beside it. Export the month as a calendar file when you need it.
              </p>
            </div>
          </Reveal>
          <div className="story-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:32, alignItems:"stretch" }}>
            <Reveal>
              <div style={{ display:"flex", flexDirection:"column", gap:12, height:"100%" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:12, color:t.text3, fontFamily:"var(--font-mono)" }}>UPCOMING</span>
                  <span style={{ fontSize:11, color:t.greenInk, fontFamily:"var(--font-mono)", border:`1px solid ${t.greenBorder}`, background:t.greenDim, borderRadius:999, padding:"3px 8px" }}>2 this month</span>
                </div>
                {[
                  { d:"06", n:"AWS",      c:"Cloud",       a:"$43.20", Icon:Cloud },
                  { d:"14", n:"Figma",    c:"Design",      a:"$15.00", Icon:Sparkles },
                  { d:"21", n:"Notion",   c:"Productivity",a:"$16.00", Icon:FileText },
                  { d:"28", n:"Netflix",  c:"Streaming",   a:"$15.99", Icon:Play },
                ].map(e => (
                  <div key={e.n} style={{ display:"flex", alignItems:"center", gap:14, border:`1px solid ${t.border}`, borderRadius:12, padding:"14px 16px", background:t.surface, transition:"border-color 0.15s ease, background-color 0.15s ease" }}
                    onMouseEnter={ev=>{ (ev.currentTarget as HTMLElement).style.borderColor=t.border2; (ev.currentTarget as HTMLElement).style.background=t.surface2; }}
                    onMouseLeave={ev=>{ (ev.currentTarget as HTMLElement).style.borderColor=t.border; (ev.currentTarget as HTMLElement).style.background=t.surface; }}>
                    <span style={{ width:40, height:40, borderRadius:10, background:t.greenDim, border:`1px solid ${t.greenBorder}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <e.Icon size={12} color={t.greenInk} />
                      <span style={{ fontSize:11, color:t.greenInk, fontFamily:"var(--font-mono)" }}>{e.d}</span>
                    </span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:14, color:t.text, fontFamily:"var(--font-display)", fontWeight:500 }}>{e.n}</div>
                      <div style={{ fontSize:11, color:t.text3, fontFamily:"var(--font-display)" }}>{e.c}</div>
                    </div>
                    <span style={{ fontSize:13, color:t.text, fontFamily:"var(--font-mono)", fontVariantNumeric:"tabular-nums" }}>{e.a}</span>
                  </div>
                ))}
                <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:"auto", paddingTop:20 }}>
                  <span style={{ fontSize:11, color:t.text3, fontFamily:"var(--font-mono)", display:"inline-flex", alignItems:"center", gap:6 }}><Download size={13} /> Export the month as .ics</span>
                </div>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:16, padding:20, width:"100%" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                  <div style={{ fontSize:14, color:t.text, fontFamily:"var(--font-display)", fontWeight:500 }}>November 2026</div>
                  <div style={{ display:"flex", gap:6 }}>
                    {[<ChevronDown key="p" size={14} color={t.text3} style={{ transform:"rotate(90deg)" }} />,<ChevronDown key="n" size={14} color={t.text3} style={{ transform:"rotate(-90deg)" }} />].map((el,i) => (
                      <span key={i} style={{ width:28, height:28, border:`1px solid ${t.border}`, borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", background:t.bg }}>{el}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
                  {["S","M","T","W","T","F","S"].map((d, i) => <div key={i} style={{ fontSize:10, color:t.text3, textAlign:"center", fontFamily:"var(--font-mono)" }}>{d}</div>)}
                  {Array.from({ length:30 }, (_, i) => i + 1).map((day) => {
                    const ev = [{ d:6, n:"AWS" },{ d:14, n:"Figma" },{ d:21, n:"Notion" },{ d:28, n:"Netflix" }].find(x => x.d === day);
                    return (
                      <div key={day} title={ev ? `${ev.n} renews` : undefined}
                        style={{ minHeight:42, border:`1px solid ${ev?t.greenBorder:t.border}`, borderRadius:6, padding:4, background:ev?t.greenDim:t.bg, display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
                        <span style={{ fontSize:11, color:ev?t.greenInk:t.text3, fontFamily:"var(--font-mono)" }}>{day}</span>
                        {ev && <span style={{ fontSize:9.5, color:t.greenInk, fontFamily:"var(--font-display)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{ev.n}</span>}
                      </div>
                    );
                  })}
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:14, marginTop:16, paddingTop:14, borderTop:`1px solid ${t.border}`, flexWrap:"wrap" }}>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11, color:t.text3, fontFamily:"var(--font-display)" }}><span style={{ width:8, height:8, borderRadius:2, background:t.green }} /> Renewal</span>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11, color:t.text3, fontFamily:"var(--font-display)" }}><span style={{ width:8, height:8, borderRadius:2, background:t.border }} /> No charge</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ EXPORT ═════════════════════════════════════════════════════════════ */}
      <section id="export" className="section-pad" style={{ padding:"96px 24px", background:t.bg }}>
        <div style={{ maxWidth:1080, margin:"0 auto" }}>
          <Label text="Export" t={t} />
          <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(28px,4vw,44px)", color:t.text, lineHeight:1.1 }}>Your data, your format</h2>
          <p style={{ fontSize:14, color:t.text2, marginTop:12, lineHeight:1.6, maxWidth:520, fontFamily:"var(--font-display)" }}>
            Download subscriptions and vault items as JSON, CSV, PDF or ICS. Filter by category and renewal date, or import a Wallos JSON backup with a preview first.
          </p>
          <div className="export-grid" style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12, marginTop:32 }}>
            {[
              { Icon: FileJson, title: "JSON", desc: "Full backup of both ledgers", meta:".json" },
              { Icon: FileSpreadsheet, title: "CSV", desc: "Spreadsheets for subscriptions and vault", meta:".csv" },
              { Icon: FileText, title: "PDF", desc: "Written report with paginated tables", meta:".pdf" },
              { Icon: Download, title: "ICS", desc: "Renewals in your calendar app", meta:".ics" },
            ].map(({ Icon, title, desc, meta }) => (
              <div key={title}
                onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background=t.surface2; (e.currentTarget as HTMLElement).style.borderColor=t.border2; }}
                onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background=t.surface; (e.currentTarget as HTMLElement).style.borderColor=t.border; }}
                style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:14, padding:24, display:"flex", gap:16, transition:"background-color 0.15s ease, border-color 0.15s ease" }}>
                <span style={{ width:40, height:40, borderRadius:10, background:t.bg, border:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Icon size={18} strokeWidth={1.5} color={t.greenInk} />
                </span>
                <div style={{ minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:15, color:t.text, fontFamily:"var(--font-display)", fontWeight:500 }}>{title}</span>
                    <span style={{ fontSize:10, color:t.text3, fontFamily:"var(--font-mono)", border:`1px solid ${t.border}`, borderRadius:4, padding:"2px 6px" }}>{meta}</span>
                  </div>
                  <div style={{ fontSize:12.5, color:t.text2, marginTop:6, lineHeight:1.5, fontFamily:"var(--font-display)" }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WHY SUBSIGHT ═══════════════════════════════════════════════════════ */}
      <section id="compare" className="section-pad" style={{ padding:"100px 24px", background:t.surface }}>
        <div style={{ maxWidth:1080, margin:"0 auto" }}>
          <Reveal>
            <div style={{ textAlign:"center", maxWidth:620, margin:"0 auto" }}>
              <Label text="Why Subsight" t={t} />
              <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(28px,4vw,44px)", color:t.text, lineHeight:1.1 }}>Open source and under your control</h2>
              <p style={{ fontSize:14, color:t.text2, marginTop:14, lineHeight:1.78, fontFamily:"var(--font-display)" }}>Other tools link to your bank and sell your data. Subsight gives you full control: open source, self-hostable, and privacy-first by design.</p>
            </div>
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
                      <Icon size={10} color={t.greenInk} />
                    </span>
                    <span style={{ fontSize:12.5, color:t.text2, fontFamily:"var(--font-mono)" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>


      {/* ═══ FAQ ════════════════════════════════════════════════════════════════ */}
      <section id="faq" className="section-pad" style={{ padding:"100px 24px", background:t.bg, position:"relative", overflow:"hidden" }}>
        <div style={{ maxWidth:860, margin:"0 auto", position:"relative", zIndex:1 }}>
          {/* Centered header */}
          <Reveal>
            <div style={{ textAlign:"center", marginBottom:56 }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"6px 14px", borderRadius:999, border:`1px solid ${t.border2}`, background:t.surface, marginBottom:20 }}>
                <Sparkles size={13} strokeWidth={1.5} color={t.greenInk} />
                <span style={{ fontSize:12, color:t.text2, fontFamily:"var(--font-display)", fontWeight:500 }}>FAQ</span>
              </div>
              <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(30px,5vw,54px)", fontWeight:500, letterSpacing:0, color:t.text, lineHeight:1.06 }}>
                Questions and answers
              </h2>
              <div style={{ width:32, height:2, background:t.green, margin:"20px auto 0" }} />
              <p style={{ fontSize:13.5, color:t.text2, maxWidth:480, margin:"16px auto 0", lineHeight:1.75, fontFamily:"var(--font-display)" }}>
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

        </div>
      </section>

      {/* ═══ FINAL CTA ══════════════════════════════════════════════════════════ */}
      <section className="section-pad" style={{ padding:"80px 24px 100px" }}>
        <div style={{ maxWidth:1080, margin:"0 auto" }}>
          <Reveal>
            <div className="cta-box" style={{ background:t.surface, border:`1px solid ${t.greenBorder}`, borderRadius:18, padding:"72px 40px", position:"relative", overflow:"hidden", textAlign:"center" }}>
              <div className="cta-inner" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:20, position:"relative", zIndex:1 }}>
                <div style={{ width:48, height:48, borderRadius:12, background:t.greenDim, border:`1px solid ${t.greenBorder}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Sparkles size={22} strokeWidth={1.5} color={t.greenInk} />
                </div>
                <div style={{ fontSize:12, color:t.greenInk, fontFamily:"var(--font-mono)", letterSpacing:0 }}>Get started now</div>
                <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(28px,4vw,44px)", color:t.text, lineHeight:1.1, maxWidth:620 }}>See where your money goes each month</h2>
                <p style={{ fontSize:14, color:t.text2, maxWidth:460, fontFamily:"var(--font-display)", lineHeight:1.7 }}>Two minutes to set up. Immediate clarity on every recurring charge.</p>
                <div className="cta-btns" style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center", marginTop:8 }}>
                  <Link href="/sign-up" style={btnPrimary} onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background=t.green2; (e.currentTarget as HTMLElement).style.transform="translateY(-2px)"; }} onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background=t.green; (e.currentTarget as HTMLElement).style.transform="translateY(0px)"; }}><UserPlus size={15} strokeWidth={1.5} /> Start Free <ArrowRight size={14} /></Link>
                  <a href="https://subsight-tracker.vercel.app/" target="_blank" rel="noopener" style={btnGhost} onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor=t.green; (e.currentTarget as HTMLElement).style.color=t.green; }} onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor=t.border2; (e.currentTarget as HTMLElement).style.color=t.text; }}><ArrowUpRight size={14} /> Live Demo</a>
                </div>
                <div style={{ display:"flex", gap:24, marginTop:12, flexWrap:"wrap", justifyContent:"center" }}>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:8, fontSize:12, color:t.text3, fontFamily:"var(--font-display)" }}><Check size={13} color={t.greenInk} /> No card required</span>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:8, fontSize:12, color:t.text3, fontFamily:"var(--font-display)" }}><Check size={13} color={t.greenInk} /> MIT licensed</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ FOOTER ═════════════════════════════════════════════════════════════ */}
      <footer className="footer-main" style={{ borderTop:`1px solid ${t.border}`, padding:"64px 24px 32px", background:t.surface }}>
        <div style={{ maxWidth:1080, margin:"0 auto" }}>
          <div className="footer-grid" style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:40, marginBottom:48 }}>
            <div className="footer-brand">
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                <Image src="/Subsight.png" className="brand-mark" alt="Subsight" width={32} height={32} style={{ borderRadius:8, display:"block" }} />
                <span style={{ fontFamily:"var(--font-display)", fontSize:20, fontWeight:500, color:t.text }}>Subsight</span>
              </div>
              <p style={{ fontSize:13, color:t.text2, fontFamily:"var(--font-display)", lineHeight:1.7, maxWidth:320 }}>Subscription tracking and personal spending in one place. Open source and free to use.</p>
              <div style={{ display:"flex", gap:8, marginTop:20 }}>
                <Link href="/sign-up" style={{ ...btnPrimary, padding:"9px 16px", fontSize:13 }}>
                  Get started <ArrowRight size={14} strokeWidth={1.5} />
                </Link>
                <a href="https://github.com/MuhammadTanveerAbbas/Subsight-Tracker" target="_blank" rel="noopener"
                  style={{ display:"inline-flex", alignItems:"center", gap:8, fontSize:13, color:t.text, fontFamily:"var(--font-display)", border:`1px solid ${t.border2}`, borderRadius:8, padding:"9px 16px", background:t.bg, transition:"border-color 0.15s ease, color 0.15s ease" }}
                  onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor=t.green; (e.currentTarget as HTMLElement).style.color=t.greenInk; }}
                  onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor=t.border2; (e.currentTarget as HTMLElement).style.color=t.text; }}>
                  <GitBranch size={14} strokeWidth={1.5} /> GitHub
                </a>
              </div>
            </div>
            {[
              { title:"Product",    Icon:LayoutDashboard, links:[["Features","#features"],["Compare","#compare"],["Dashboard","/dashboard"]] },
              { title:"Resources",  Icon:Globe,           links:[["GitHub","https://github.com/MuhammadTanveerAbbas/Subsight-Tracker"],["Live Demo","https://subsight-tracker.vercel.app/"],["Author","https://muhammadtanveerabbas.vercel.app/"]] },
              { title:"Legal",      Icon:Shield,          links:[["Privacy Policy","/privacy"],["Terms of Service","/terms"]] },
            ].map(col => (
              <div key={col.title} className="footer-col">
                <div style={{ fontSize:11, fontWeight:500, color:t.text, letterSpacing:0, fontFamily:"var(--font-mono)", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
                  <col.Icon size={14} strokeWidth={1.5} color={t.greenInk} />
                  {col.title}
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
                  {(col.links as [string, string][]).map(([label,href]) => (
                    <a key={label} href={href} target={href.startsWith("http")?"_blank":"_self"} rel={href.startsWith("http")?"noopener":""} style={{ fontSize:13, color:t.text2, fontFamily:"var(--font-display)", transition:"color 0.2s" }} onMouseEnter={e=>(e.currentTarget.style.color=t.greenInk)} onMouseLeave={e=>(e.currentTarget.style.color=t.text2)}>{label}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="footer-bottom" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:24, borderTop:`1px solid ${t.border}`, flexWrap:"wrap", gap:14 }}>
            <p style={{ fontSize:11, color:t.text3, fontFamily:"var(--font-mono)" }}>© 2026 Subsight · Built by Muhammad Tanveer Abbas · MIT License</p>
            <div className="footer-bottom-links" style={{ display:"flex", gap:20, alignItems:"center" }}>
              <span style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11, color:t.text3, fontFamily:"var(--font-mono)" }}><span style={{ width:6, height:6, borderRadius:"50%", background:t.green }} /> Open source</span>
              {([["GitHub","https://github.com/MuhammadTanveerAbbas/Subsight-Tracker"],["Live App","https://subsight-tracker.vercel.app/"],["Privacy","/privacy"],["Terms","/terms"]] as const).map(([label,href]) => (
                <a key={label} href={href} target={href.startsWith("http")?"_blank":"_self"} rel={href.startsWith("http")?"noopener":""} style={{ fontSize:11, color:t.text3, fontFamily:"var(--font-mono)", transition:"color 0.2s" }} onMouseEnter={e=>(e.currentTarget.style.color=t.greenInk)} onMouseLeave={e=>(e.currentTarget.style.color=t.text3)}>{label}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
