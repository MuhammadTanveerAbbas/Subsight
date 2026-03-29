"use client";

import { useState, useEffect } from "react";
import { Check, X, ArrowRight, ChevronDown, ChevronUp, PieChart, Sun, Moon } from "lucide-react";
import Link from "next/link";

// ─── Tokens ───────────────────────────────────────────────────────────────────
const DARK = {
  bg:"#080808", surface:"#111111", surface2:"#181818", surface3:"#1e1e1e",
  border:"#1f1f1f", border2:"#2a2a2a",
  text:"#f0f0f0", text2:"#a0a0a0", text3:"#585858",
  green:"#22c55e", green2:"#16a34a",
  greenDim:"rgba(34,197,94,0.08)", greenBorder:"rgba(34,197,94,0.22)", greenGlow:"rgba(34,197,94,0.14)",
  red:"#ef4444", amber:"#f59e0b",
  navBg:"rgba(8,8,8,0.92)", shadow:"rgba(0,0,0,0.70)",
} as const;
const LIGHT = {
  bg:"#f8f8f6", surface:"#ffffff", surface2:"#f2f2ef", surface3:"#eaeae6",
  border:"#e4e4e0", border2:"#d0d0ca",
  text:"#111111", text2:"#545450", text3:"#888880",
  green:"#16a34a", green2:"#15803d",
  greenDim:"rgba(22,163,74,0.08)", greenBorder:"rgba(22,163,74,0.22)", greenGlow:"rgba(22,163,74,0.10)",
  red:"#dc2626", amber:"#d97706",
  navBg:"rgba(248,248,246,0.92)", shadow:"rgba(0,0,0,0.12)",
} as const;
type T  = typeof DARK | typeof LIGHT;
type TK = "dark" | "light";

const PAGE_CSS = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{--font-display:var(--font-inter),system-ui,sans-serif;--font-mono:var(--font-jetbrains-mono),'Courier New',monospace}
  @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  a{color:inherit;text-decoration:none}
  ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:3px}
  *{scrollbar-width:thin;scrollbar-color:#2a2a2a transparent}
  @media(max-width:768px){
    .nav-links{display:none!important}
    .price-grid{grid-template-columns:1fr!important}
    .compare-wrap{overflow-x:auto!important}
    .section-pad{padding:72px 16px!important}
    .cta-inner{flex-direction:column!important;align-items:stretch!important;text-align:center!important}
    .cta-btns{justify-content:center!important}
    .footer-row{flex-direction:column!important;text-align:center!important;gap:16px!important}
    .nav-wrap{padding:0 16px!important}
    .cta-box{padding:48px 24px!important}
  }
  @media(max-width:480px){
    .section-pad{padding:56px 14px!important}
  }
`;

function PageNav({ t, themeKey, toggle }: { t:T; themeKey:TK; toggle:()=>void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive:true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav className="nav-wrap" style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 48px", height:62, background:scrolled?t.navBg:"transparent", borderBottom:scrolled?`1px solid ${t.border}`:"none", backdropFilter:scrolled?"blur(14px)":"none", WebkitBackdropFilter:scrolled?"blur(14px)":"none", transition:"all 0.35s" }}>
      <Link href="/" style={{ display:"flex", alignItems:"center", gap:9, textDecoration:"none" }}>
        <img src="/icon.svg" alt="Subsight" width={28} height={28} style={{ borderRadius:7, flexShrink:0, display:"block" }} />
        <span style={{ fontFamily:"var(--font-display)", fontSize:17, fontWeight:800, color:t.text, letterSpacing:-0.5 }}>Subsight</span>
      </Link>

      <div className="nav-links" style={{ display:"flex", alignItems:"center", gap:24 }}>
        {[["Home","/"],["Features","/#features"],["Pricing","/pricing"],["Dashboard","/dashboard"]].map(([l,h]) => (
          <Link key={l} href={h} style={{ fontSize:13, color:t.text2, fontWeight:500, fontFamily:"var(--font-display)", transition:"color 0.2s" }}
            onMouseEnter={e=>(e.currentTarget.style.color=t.text)}
            onMouseLeave={e=>(e.currentTarget.style.color=t.text2)}>{l}</Link>
        ))}
      </div>

      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
        <button onClick={toggle} aria-label="Toggle theme" style={{ width:32, height:32, border:`1px solid ${t.border2}`, borderRadius:7, background:t.surface2, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.2s" }}>
          {themeKey==="dark" ? <Sun size={13} color={t.text2}/> : <Moon size={13} color={t.text2}/>}
        </button>
        <Link href="/sign-up" style={{ background:t.green, color:"#000", borderRadius:8, padding:"8px 18px", fontSize:13, fontWeight:700, fontFamily:"var(--font-display)", display:"flex", alignItems:"center", gap:6, transition:"background 0.2s" }}
          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=t.green2}
          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=t.green}>
          Get Started <ArrowRight size={12}/>
        </Link>
      </div>
    </nav>
  );
}

function PageFooter({ t }: { t:T }) {
  return (
    <footer style={{ borderTop:`1px solid ${t.border}`, padding:"36px 24px" }}>
      <div className="footer-row" style={{ maxWidth:1080, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <img src="/icon.svg" alt="Subsight" width={24} height={24} style={{ borderRadius:5, display:"block" }} />
          <span style={{ fontFamily:"var(--font-display)", fontSize:15, fontWeight:800, color:t.text }}>Subsight</span>
        </div>
        <div style={{ display:"flex", gap:20, flexWrap:"wrap", justifyContent:"center" }}>
          {[["Home","/"],["Pricing","/pricing"],["Privacy","/privacy"],["Terms","/terms"],["GitHub","https://github.com/MuhammadTanveerAbbas/Subsight-Tracker"]].map(([l,h]) => (
            <a key={l} href={h} target={h.startsWith("http")?"_blank":"_self"} rel={h.startsWith("http")?"noopener":""} style={{ fontSize:12, color:t.text3, fontFamily:"var(--font-mono)", transition:"color 0.2s" }} onMouseEnter={e=>(e.currentTarget.style.color=t.green)} onMouseLeave={e=>(e.currentTarget.style.color=t.text3)}>{l}</a>
          ))}
        </div>
        <p style={{ fontSize:11, color:t.text3, fontFamily:"var(--font-mono)" }}>© 2025 Subsight · MIT License</p>
      </div>
    </footer>
  );
}

function Label({ text, t }: { text:string; t:T }) {
  return <span style={{ fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase", color:t.green, fontFamily:"var(--font-mono)", display:"block", marginBottom:14 }}>// {text}</span>;
}

const PRICE_FEATURES = [
  { f:"Active Subscriptions",  free:"Up to 10",    pro:"Unlimited"  },
  { f:"AI Auto-Fill",          free:"5 / month",   pro:"Unlimited"  },
  { f:"Analytics Dashboard",   free:"Basic",       pro:"Advanced"   },
  { f:"Simulation Mode",       free:true,          pro:true         },
  { f:"Export JSON",           free:true,          pro:true         },
  { f:"Export CSV",            free:false,         pro:true         },
  { f:"Export PDF",            free:false,         pro:true         },
  { f:"Renewal Alerts",        free:false,         pro:true         },
  { f:"Custom Categories",     free:false,         pro:true         },
  { f:"Spending Goals",        free:false,         pro:true         },
  { f:"Priority Support",      free:false,         pro:true         },
  { f:"Self-Host Option",      free:true,          pro:true         },
];
type CV = boolean | string;
function CCell({ v }: { v:CV }) {
  if (v===true)  return <Check size={14} color="#22c55e"/>;
  if (v===false) return <X size={13} color="#ef4444" style={{ opacity:0.5 }}/>;
  return <span style={{ fontSize:11, fontFamily:"var(--font-mono)", color:"#a0a0a0" }}>{v}</span>;
}

function PricingPage() {
  const [themeKey, setThemeKey] = useState<TK>("dark");
  const [annual,   setAnnual]   = useState(false);
  const [faqOpen,  setFaqOpen]  = useState<number|null>(null);

  useEffect(() => { setThemeKey((localStorage.getItem("subsight-theme") as TK) || "dark"); }, []);
  const toggle = () => { const n=themeKey==="dark"?"light":"dark" as TK; setThemeKey(n); localStorage.setItem("subsight-theme",n); };
  const t = themeKey === "dark" ? DARK : LIGHT;

  const PLANS = [
    {
      plan:"Free", price:"$0", sub:"/month", highlight:false,
      cta:"Get Started Free", href:"/sign-up",
      desc:"Everything you need to get started, no credit card required.",
      features:["Up to 10 subscriptions","Basic analytics dashboard","AI auto-fill (5 / month)","Simulation mode","Export to JSON","Community support"],
    },
    {
      plan:"Pro", price:annual?"$86":"$9", sub:annual?"/year":"/month", highlight:true,
      cta:"Start Pro", href:"/sign-up",
      desc:"For power users who want the full experience.",
      features:["Unlimited subscriptions","Advanced analytics & charts","Unlimited AI auto-fill","Export to JSON, CSV & PDF","Renewal alerts & spending goals","Custom categories","Priority support"],
    },
  ];

  return (
    <div style={{ background:t.bg, color:t.text, fontFamily:"var(--font-display)", minHeight:"100vh", overflowX:"hidden", transition:"background 0.4s" }}>
      <style>{PAGE_CSS}</style>
      <PageNav t={t} themeKey={themeKey} toggle={toggle}/>

      <main style={{ paddingTop:62 }}>
        {/* Hero */}
        <section className="section-pad" style={{ padding:"96px 24px 72px", textAlign:"center", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:"-15%", left:"50%", transform:"translateX(-50%)", width:660, height:660, background:`radial-gradient(circle, ${t.greenBorder} 0%, transparent 65%)`, pointerEvents:"none" }}/>
          <div style={{ position:"relative", zIndex:1, animation:"fadeUp 0.65s ease both" }}>
            <Label text="Pricing" t={t}/>
            <h1 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(36px,6vw,68px)", fontWeight:800, letterSpacing:-2.5, color:t.text, lineHeight:1.04, marginBottom:18 }}>
              Simple, honest pricing.<br/><span style={{ color:t.green }}>No surprises.</span>
            </h1>
            <p style={{ fontSize:15, color:t.text2, fontFamily:"var(--font-mono)", maxWidth:460, margin:"0 auto 36px", lineHeight:1.75 }}>Start free, upgrade when you need more. No hidden fees, cancel anytime.</p>

            {/* Annual toggle */}
            <div style={{ display:"inline-flex", alignItems:"center", gap:12, background:t.surface, border:`1px solid ${t.border}`, borderRadius:999, padding:"7px 20px", cursor:"pointer" }} onClick={()=>setAnnual(!annual)}>
              <span style={{ fontSize:13, fontFamily:"var(--font-display)", fontWeight:annual?400:700, color:annual?t.text3:t.text }}>Monthly</span>
              <div style={{ width:44, height:24, borderRadius:999, background:annual?t.green:t.surface3, border:`1px solid ${t.border2}`, position:"relative", transition:"background 0.2s", flexShrink:0 }}>
                <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:annual?23:3, transition:"left 0.2s" }}/>
              </div>
              <span style={{ fontSize:13, fontFamily:"var(--font-display)", fontWeight:annual?700:400, color:annual?t.text:t.text3 }}>
                Annual <span style={{ fontSize:10, color:t.green, fontFamily:"var(--font-mono)" }}>Save $22</span>
              </span>
            </div>
          </div>
        </section>

        {/* Price cards */}
        <section className="section-pad" style={{ padding:"0 24px 80px" }}>
          <div style={{ maxWidth:860, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }} className="price-grid">
            {PLANS.map(card => (
              <div key={card.plan} style={{ background:card.highlight?t.surface2:t.surface, border:`1px solid ${card.highlight?t.greenBorder:t.border}`, borderRadius:16, padding:"40px 32px", position:"relative", display:"flex", flexDirection:"column", boxShadow:card.highlight?`0 0 0 1px ${t.greenBorder}, 0 24px 72px ${t.greenGlow}`:"none" }}>
                {card.highlight && <span style={{ position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)", background:t.green, color:"#000", fontSize:10, fontWeight:700, padding:"5px 18px", borderRadius:999, fontFamily:"var(--font-mono)", letterSpacing:"0.1em", whiteSpace:"nowrap", boxShadow:`0 4px 16px ${t.greenGlow}` }}>RECOMMENDED</span>}
                <div style={{ marginBottom:24 }}>
                  <div style={{ fontSize:10, color:card.highlight?t.green:t.text3, letterSpacing:"0.18em", textTransform:"uppercase", fontFamily:"var(--font-mono)", marginBottom:8 }}>{card.plan}</div>
                  <p style={{ fontSize:12.5, color:t.text3, fontFamily:"var(--font-mono)", lineHeight:1.6 }}>{card.desc}</p>
                </div>
                <div style={{ display:"flex", alignItems:"baseline", gap:8, paddingBottom:24, borderBottom:`1px solid ${t.border}`, marginBottom:24 }}>
                  <span style={{ fontFamily:"var(--font-display)", fontSize:52, fontWeight:800, color:t.text, lineHeight:1, letterSpacing:-2 }}>{card.price}</span>
                  <span style={{ fontSize:12, color:t.text3, fontFamily:"var(--font-mono)" }}>{card.sub}</span>
                </div>
                <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:12, marginBottom:32, flex:1 }}>
                  {card.features.map(f => (
                    <li key={f} style={{ fontSize:13, color:t.text2, display:"flex", alignItems:"flex-start", gap:10, fontFamily:"var(--font-mono)" }}>
                      <span style={{ width:18, height:18, borderRadius:"50%", background:t.greenDim, border:`1px solid ${t.greenBorder}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                        <Check size={10} color={t.green}/>
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={card.href} target={card.href.startsWith("http")?"_blank":"_self"} rel={card.href.startsWith("http")?"noopener":""} style={{ display:"flex", width:"100%", padding:"14px", borderRadius:10, fontSize:13, fontFamily:"var(--font-mono)", fontWeight:600, textAlign:"center", textDecoration:"none", background:card.highlight?t.green:"transparent", color:card.highlight?"#000":t.text, border:card.highlight?"none":`1px solid ${t.border2}`, justifyContent:"center", alignItems:"center", gap:7, transition:"all 0.2s" }}
                  onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; if(card.highlight){el.style.background=t.green2;}else{el.style.borderColor=t.green;el.style.color=t.green;} }}
                  onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; if(card.highlight){el.style.background=t.green;}else{el.style.borderColor=t.border2;el.style.color=t.text;} }}>
                  {card.cta} <ArrowRight size={12}/>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Feature comparison */}
        <section className="section-pad" style={{ padding:"20px 24px 80px", background:t.surface }}>
          <div style={{ maxWidth:860, margin:"0 auto" }}>
            <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(24px,4vw,40px)", fontWeight:800, letterSpacing:-1.5, color:t.text, marginBottom:8, textAlign:"center" }}>Full Feature Comparison</h2>
            <p style={{ fontSize:13, color:t.text3, fontFamily:"var(--font-mono)", textAlign:"center", marginBottom:36 }}>Everything included in both plans  no hidden limits.</p>
            <div className="compare-wrap" style={{ borderRadius:12, border:`1px solid ${t.border}`, overflow:"hidden" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", minWidth:480 }}>
                <thead>
                  <tr style={{ background:t.surface2 }}>
                    <th style={{ padding:"14px 20px", textAlign:"left", fontSize:10.5, color:t.text3, fontFamily:"var(--font-mono)", letterSpacing:"0.1em", textTransform:"uppercase", fontWeight:400, borderBottom:`1px solid ${t.border}` }}>Feature</th>
                    {[["Free", false],["Pro", true]].map(([p, hi], i) => (
                      <th key={String(p)} style={{ padding:"14px 20px", textAlign:"center", fontSize:12, fontFamily:"var(--font-mono)", color:hi?t.green:t.text2, letterSpacing:"0.06em", borderBottom:`1px solid ${t.border}`, background:hi?t.greenDim:"transparent", borderTop:hi?`2px solid ${t.green}`:"2px solid transparent", fontWeight:hi?600:400 }}>{String(p)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PRICE_FEATURES.map((row,ri) => (
                    <tr key={ri} style={{ background:ri%2===0?t.surface:t.surface2 }}>
                      <td style={{ padding:"13px 20px", fontSize:13, color:t.text, fontFamily:"var(--font-display)", borderBottom:`1px solid ${t.border}` }}>{row.f}</td>
                      <td style={{ padding:"13px 20px", textAlign:"center", borderBottom:`1px solid ${t.border}` }}><CCell v={row.free}/></td>
                      <td style={{ padding:"13px 20px", textAlign:"center", borderBottom:`1px solid ${t.border}`, background:t.greenDim }}><CCell v={row.pro}/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section-pad" style={{ padding:"80px 24px" }}>
          <div style={{ maxWidth:700, margin:"0 auto" }}>
            <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(24px,4vw,40px)", fontWeight:800, letterSpacing:-1.5, color:t.text, marginBottom:36, textAlign:"center" }}>Pricing FAQ</h2>
            {[
              ["Is the free plan really free?","Yes  the Free plan is free forever. No credit card required. You get up to 10 subscriptions, basic analytics, and JSON export at no cost."],
              ["What's included in Pro?","Pro gives you unlimited subscriptions, advanced analytics, unlimited AI auto-fill, CSV & PDF export, renewal alerts, spending goals, custom categories, and priority support."],
              ["Can I upgrade or downgrade anytime?","Yes  switch plans at any time. Downgrades take effect at the end of the current billing cycle."],
              ["Do you offer refunds?","Yes  if you're not satisfied within 14 days of upgrading to Pro, we'll issue a full refund. No questions asked."],
            ].map(([q,a],i) => (
              <div key={i} onClick={()=>setFaqOpen(faqOpen===i?null:i)} style={{ border:`1px solid ${faqOpen===i?t.border2:t.border}`, borderRadius:9, overflow:"hidden", cursor:"pointer", background:t.surface, marginBottom:4, transition:"border-color 0.2s" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"17px 22px" }}>
                  <span style={{ fontSize:14, fontWeight:600, color:t.text, fontFamily:"var(--font-display)", paddingRight:16 }}>{q}</span>
                  {faqOpen===i ? <ChevronUp size={14} color={t.green}/> : <ChevronDown size={14} color={t.text3}/>}
                </div>
                <div style={{ maxHeight:faqOpen===i?220:0, overflow:"hidden", transition:"max-height 0.3s ease" }}>
                  <div style={{ padding:"0 22px 17px", fontSize:13.5, color:t.text2, lineHeight:1.75, fontFamily:"var(--font-mono)" }}>{a}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="section-pad" style={{ padding:"20px 24px 96px" }}>
          <div style={{ maxWidth:860, margin:"0 auto", background:t.surface, border:`1px solid ${t.greenBorder}`, borderRadius:16, padding:"72px 56px", position:"relative", overflow:"hidden" }} className="cta-box">
            <div style={{ position:"absolute", inset:0, background:`radial-gradient(circle at 50% 50%, ${t.greenBorder} 0%, transparent 65%)`, pointerEvents:"none" }}/>
            <div className="cta-inner" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:40, flexWrap:"wrap", position:"relative", zIndex:1 }}>
              <div>
                <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(26px,4vw,46px)", fontWeight:800, letterSpacing:-1.5, color:t.text, marginBottom:12, lineHeight:1.06 }}>Ready to start?</h2>
                <p style={{ fontSize:14, color:t.text2, fontFamily:"var(--font-mono)", lineHeight:1.75 }}>Two minutes to set up. Immediate clarity on every subscription.</p>
              </div>
              <div className="cta-btns" style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                <Link href="/sign-up" style={{ background:t.green, color:"#000", borderRadius:9, padding:"14px 30px", fontSize:14, fontWeight:700, fontFamily:"var(--font-display)", display:"inline-flex", alignItems:"center", gap:8, transition:"background 0.2s" }} onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=t.green2} onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=t.green}>
                  Start Free <ArrowRight size={13}/>
                </Link>
                <Link href="/dashboard" style={{ background:"transparent", color:t.text, border:`1px solid ${t.border2}`, borderRadius:9, padding:"14px 30px", fontSize:14, fontFamily:"var(--font-display)", fontWeight:600, display:"inline-flex", alignItems:"center", gap:8, transition:"border-color 0.2s" }} onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor=t.green} onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor=t.border2}>
                  Live Demo
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PageFooter t={t}/>
    </div>
  );
}

export default PricingPage;
