"use client";

import { useState, useEffect } from "react";
import {
  Check, ArrowRight, ChevronDown, ChevronUp,
  Zap, BarChart2, Bell, Tag, FileDown, Sun, Moon,
  LayoutDashboard, Sparkles, ToggleLeft, Download, Search, Shield,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { DARK, LIGHT } from "../marketing-constants";
import type { Theme as T, ThemeKey as TK } from "../marketing-constants";

const PAGE_CSS = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{--font-display:var(--font-inter),system-ui,sans-serif;--font-mono:var(--font-jetbrains-mono),'Courier New',monospace}
  @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  a{color:inherit;text-decoration:none}
  ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:3px}
  *{scrollbar-width:thin;scrollbar-color:#2a2a2a transparent}
  @media(max-width:900px){
    .features-grid{grid-template-columns:repeat(2,1fr)!important}
  }
  @media(max-width:768px){
    .nav-links{display:none!important}
    .price-grid{grid-template-columns:1fr!important}
    .features-grid{grid-template-columns:1fr!important}
    .section-pad{padding:72px 16px!important}
    .cta-inner{flex-direction:column!important;align-items:stretch!important;text-align:center!important}
    .cta-btns{justify-content:center!important}
    .footer-row{flex-direction:column!important;text-align:center!important;gap:16px!important}
    .nav-wrap{padding:0 16px!important}
    .cta-box{padding:48px 24px!important}
  }
  @media(max-width:480px){
    .section-pad{padding:56px 14px!important}
    .features-grid{grid-template-columns:1fr!important}
  }
`;

function PageNav({ t, themeKey, toggle }: { t: T; themeKey: TK; toggle: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav className="nav-wrap" style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 48px", height:62, background:scrolled?t.navBg:"transparent", borderBottom:scrolled?`1px solid ${t.border}`:"none", backdropFilter:scrolled?"blur(14px)":"none", WebkitBackdropFilter:scrolled?"blur(14px)":"none", transition:"all 0.35s" }}>
      <Link href="/" style={{ display:"flex", alignItems:"center", gap:9, textDecoration:"none" }}>
        <Image src="/icon.svg" alt="Subsight" width={28} height={28} style={{ borderRadius:7, flexShrink:0, display:"block" }} />
        <span style={{ fontFamily:"var(--font-display)", fontSize:17, fontWeight:800, color:t.text, letterSpacing:-0.5 }}>Subsight</span>
      </Link>

      <div className="nav-links" style={{ display:"flex", alignItems:"center", gap:24 }}>
        {([["Home","/"],["Features","/#features"],["Pricing","/pricing"],["Dashboard","/dashboard"]] as const).map(([l,h]) => (
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

function PageFooter({ t }: { t: T }) {
  return (
    <footer style={{ borderTop:`1px solid ${t.border}`, padding:"36px 24px" }}>
      <div className="footer-row" style={{ maxWidth:1080, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <Image src="/icon.svg" alt="Subsight" width={24} height={24} style={{ borderRadius:5, display:"block" }} />
          <span style={{ fontFamily:"var(--font-display)", fontSize:15, fontWeight:800, color:t.text }}>Subsight</span>
        </div>
        <div style={{ display:"flex", gap:20, flexWrap:"wrap", justifyContent:"center" }}>
          {([["Home","/"],["Pricing","/pricing"],["Privacy","/privacy"],["Terms","/terms"],["GitHub","https://github.com/MuhammadTanveerAbbas/Subsight-Tracker"]] as const).map(([l,h]) => (
            <a key={l} href={h} target={h.startsWith("http")?"_blank":"_self"} rel={h.startsWith("http")?"noopener":""} style={{ fontSize:12, color:t.text3, fontFamily:"var(--font-mono)", transition:"color 0.2s" }} onMouseEnter={e=>(e.currentTarget.style.color=t.green)} onMouseLeave={e=>(e.currentTarget.style.color=t.text3)}>{l}</a>
          ))}
        </div>
        <p style={{ fontSize:11, color:t.text3, fontFamily:"var(--font-mono)" }}>© 2026 Subsight · MIT License</p>
      </div>
    </footer>
  );
}

function Label({ text, t }: { text: string; t: T }) {
  return <span style={{ fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase", color:t.green, fontFamily:"var(--font-mono)", display:"block", marginBottom:14 }}>// {text}</span>;
}

// All features that are actually implemented
const FREE_FEATURES = [
  { icon: LayoutDashboard, title: "Live Dashboard",           desc: "Real-time KPIs: monthly spend, active subscriptions, annual total, and upcoming renewals." },
  { icon: Sparkles,        title: "AI Auto-Fill",             desc: "Type a service name. Groq AI fills in price, category, and billing cycle instantly." },
  { icon: Sparkles,        title: "AI Spending Summary",      desc: "Get a plain-English analysis of your spending patterns and category breakdown." },
  { icon: ToggleLeft,      title: "Simulation Mode",          desc: "Toggle subscriptions on or off to see the exact budget impact before making changes." },
  { icon: BarChart2,       title: "Analytics",                desc: "Monthly bar chart, category donut chart, annual totals, and spending trends." },
  { icon: Download,        title: "Export (JSON, CSV, PDF)",  desc: "Export your full subscription list in all three formats. No upgrade required." },
  { icon: Bell,            title: "Renewal Reminders",        desc: "Email alerts 1, 3, 7, or 14 days before each renewal. Configure via SMTP in your environment." },
  { icon: Tag,             title: "Custom Categories",        desc: "Create and manage your own subscription categories alongside the built-in defaults." },
  { icon: Search,          title: "Search & Filter",          desc: "Instantly find subscriptions by name, category, or status." },
  { icon: Shield,          title: "Full Data Ownership",      desc: "Your data lives in your own Supabase database. MIT licensed, self-hostable, no tracking." },
  { icon: Zap,             title: "Multi-Currency Support",   desc: "Track subscriptions in USD, EUR, GBP, JPY, CAD, AUD, and more." },
  { icon: FileDown,        title: "Edit & Delete",            desc: "Update subscription details or remove them at any time. No restrictions." },
];

function PricingPage() {
  const [themeKey, setThemeKey] = useState<TK>("dark");
  const [faqOpen,  setFaqOpen]  = useState<number|null>(null);

  useEffect(() => { setThemeKey((localStorage.getItem("subsight-theme") as TK) || "dark"); }, []);
  const toggle = () => {
    const n = themeKey==="dark" ? "light" : "dark" as TK;
    setThemeKey(n);
    localStorage.setItem("subsight-theme", n);
  };
  const t = themeKey === "dark" ? DARK : LIGHT;

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
              Free forever.<br/><span style={{ color:t.green }}>No credit card.</span>
            </h1>
            <p style={{ fontSize:15, color:t.text2, fontFamily:"var(--font-mono)", maxWidth:520, margin:"0 auto 36px", lineHeight:1.75 }}>
              Every feature is available to all users at no cost. Paid plans are not currently available they are coming in the future.
            </p>
          </div>
        </section>

        {/* Price cards */}
        <section className="section-pad" style={{ padding:"0 24px 80px" }}>
          <div style={{ maxWidth:860, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }} className="price-grid">

            {/* Free highlighted, fully active */}
            <div style={{ background:t.surface2, border:`1px solid ${t.greenBorder}`, borderRadius:16, padding:"40px 32px", position:"relative", display:"flex", flexDirection:"column", boxShadow:`0 0 0 1px ${t.greenBorder}, 0 24px 72px ${t.greenGlow}` }}>
              <span style={{ position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)", background:t.green, color:"#000", fontSize:10, fontWeight:700, padding:"5px 18px", borderRadius:999, fontFamily:"var(--font-mono)", letterSpacing:"0.1em", whiteSpace:"nowrap", boxShadow:`0 4px 16px ${t.greenGlow}` }}>ALL FEATURES INCLUDED</span>
              <div style={{ marginBottom:24 }}>
                <div style={{ fontSize:10, color:t.green, letterSpacing:"0.18em", textTransform:"uppercase", fontFamily:"var(--font-mono)", marginBottom:8 }}>Free Plan</div>
                <p style={{ fontSize:12.5, color:t.text2, fontFamily:"var(--font-mono)", lineHeight:1.6 }}>All features, no limits, no credit card required. Yours forever.</p>
              </div>
              <div style={{ display:"flex", alignItems:"baseline", gap:8, paddingBottom:24, borderBottom:`1px solid ${t.border}`, marginBottom:24 }}>
                <span style={{ fontFamily:"var(--font-display)", fontSize:52, fontWeight:800, color:t.text, lineHeight:1, letterSpacing:-2 }}>$0</span>
                <span style={{ fontSize:12, color:t.text3, fontFamily:"var(--font-mono)" }}>/month</span>
              </div>
              <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:12, marginBottom:32, flex:1 }}>
                {[
                  "Unlimited subscriptions",
                  "Full analytics dashboard",
                  "AI auto-fill and spending summary",
                  "Simulation mode",
                  "Export to JSON, CSV, and PDF",
                  "Renewal email reminders",
                  "Custom categories",
                  "Multi-currency support",
                  "Dark and light theme",
                  "Self-hostable, MIT licensed",
                ].map(f => (
                  <li key={f} style={{ fontSize:13, color:t.text2, display:"flex", alignItems:"flex-start", gap:10, fontFamily:"var(--font-mono)" }}>
                    <span style={{ width:18, height:18, borderRadius:"50%", background:t.greenDim, border:`1px solid ${t.greenBorder}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                      <Check size={10} color={t.green}/>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/sign-up" style={{ display:"flex", width:"100%", padding:"14px", borderRadius:10, fontSize:13, fontFamily:"var(--font-mono)", fontWeight:600, textAlign:"center", textDecoration:"none", background:t.green, color:"#000", border:"none", justifyContent:"center", alignItems:"center", gap:7, transition:"background 0.2s" }}
                onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background=t.green2; }}
                onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background=t.green; }}>
                Get Started Free <ArrowRight size={12}/>
              </Link>
            </div>

            {/* Coming Soon card */}
            <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:16, padding:"40px 32px", position:"relative", display:"flex", flexDirection:"column", opacity:0.65 }}>
              <span style={{ position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)", background:t.surface3, color:t.text2, fontSize:9.5, fontWeight:700, padding:"5px 18px", borderRadius:999, fontFamily:"var(--font-mono)", letterSpacing:"0.1em", whiteSpace:"nowrap", border:`1px solid ${t.border2}` }}>COMING SOON</span>
              <div style={{ marginBottom:24 }}>
                <div style={{ fontSize:10, color:t.text3, letterSpacing:"0.18em", textTransform:"uppercase", fontFamily:"var(--font-mono)", marginBottom:8 }}>Paid Plan</div>
                <p style={{ fontSize:12.5, color:t.text3, fontFamily:"var(--font-mono)", lineHeight:1.6 }}>Paid plans are not yet available. We are working on team and power-user features.</p>
              </div>
              <div style={{ display:"flex", alignItems:"baseline", gap:8, paddingBottom:24, borderBottom:`1px solid ${t.border}`, marginBottom:24 }}>
                <span style={{ fontFamily:"var(--font-display)", fontSize:36, fontWeight:800, color:t.text3, lineHeight:1, letterSpacing:-1 }}>TBA</span>
              </div>
              <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:12, marginBottom:32, flex:1 }}>
                {["Team collaboration","Advanced spending goals","Priority support","Additional export formats","API access"].map(f => (
                  <li key={f} style={{ fontSize:13, color:t.text3, display:"flex", alignItems:"flex-start", gap:10, fontFamily:"var(--font-mono)" }}>
                    <span style={{ width:18, height:18, borderRadius:"50%", background:t.surface2, border:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                      <Check size={10} color={t.text3}/>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <div style={{ display:"flex", width:"100%", padding:"14px", borderRadius:10, fontSize:13, fontFamily:"var(--font-mono)", fontWeight:600, textAlign:"center", background:"transparent", color:t.text3, border:`1px solid ${t.border}`, justifyContent:"center", alignItems:"center", gap:7 }}>
                Not yet available
              </div>
            </div>

          </div>
        </section>

        {/* All features grid */}
        <section className="section-pad" style={{ padding:"20px 24px 80px", background:t.surface }}>
          <div style={{ maxWidth:960, margin:"0 auto" }}>
            <Label text="Included in Free" t={t}/>
            <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(24px,4vw,40px)", fontWeight:800, letterSpacing:-1.5, color:t.text, marginBottom:10 }}>
              Everything that is built, everything that is free.
            </h2>
            <p style={{ fontSize:13, color:t.text3, fontFamily:"var(--font-mono)", marginBottom:40, lineHeight:1.7 }}>
              No feature gates. No upgrade prompts. These are the features that exist in the app today, and they are all available to you right now.
            </p>
            <div className="features-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
              {FREE_FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title} style={{ background:t.surface2, border:`1px solid ${t.border}`, borderRadius:12, padding:"24px 22px", display:"flex", flexDirection:"column", gap:12, transition:"border-color 0.2s" }}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor=t.greenBorder}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor=t.border}>
                  <div style={{ width:36, height:36, borderRadius:9, background:t.greenDim, border:`1px solid ${t.greenBorder}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Icon size={16} color={t.green}/>
                  </div>
                  <div>
                    <p style={{ fontSize:13.5, fontWeight:700, color:t.text, fontFamily:"var(--font-display)", marginBottom:6 }}>{title}</p>
                    <p style={{ fontSize:12, color:t.text3, fontFamily:"var(--font-mono)", lineHeight:1.7 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:24, padding:"18px 22px", background:t.greenDim, border:`1px solid ${t.greenBorder}`, borderRadius:10, display:"flex", alignItems:"center", gap:12 }}>
              <Check size={15} color={t.green} style={{ flexShrink:0 }}/>
              <p style={{ fontSize:12.5, color:t.text2, fontFamily:"var(--font-mono)", lineHeight:1.6 }}>
                All features above are free for every user. No account tiers, no usage limits, no credit card. AI auto-fill requires a Groq API key (free tier available at console.groq.com).
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section-pad" style={{ padding:"80px 24px" }}>
          <div style={{ maxWidth:700, margin:"0 auto" }}>
            <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(24px,4vw,40px)", fontWeight:800, letterSpacing:-1.5, color:t.text, marginBottom:36, textAlign:"center" }}>Pricing FAQ</h2>
            {[
              ["Is Subsight really free?","Yes. Every feature is available to every user at no cost. No credit card, no usage cap, no locked features. The app is MIT-licensed and fully open source."],
              ["Are there any hidden limits?","No. You can add unlimited subscriptions, run unlimited exports, and generate AI summaries without any account tiers. AI auto-fill requires a Groq API key, which has its own free tier at console.groq.com."],
              ["When will paid plans be available?","There is no timeline yet. The current focus is building a solid free product. When paid plans launch, existing free users will be grandfathered in to all current features."],
              ["Do you offer refunds?","There is nothing to refund Subsight is currently free. If paid plans launch in the future, refund terms will be clearly documented."],
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
                  Open Dashboard
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
