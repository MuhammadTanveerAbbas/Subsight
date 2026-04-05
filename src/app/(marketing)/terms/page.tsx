"use client";
// ─────────────────────────────────────────────────────────────────────────────
// src/app/(marketing)/terms/page.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { ArrowRight, PieChart, Sun, Moon } from "lucide-react";
import Link from "next/link";

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
    .footer-row{flex-direction:column!important;text-align:center!important;gap:16px!important}
    .nav-wrap{padding:0 16px!important}
    .legal-section{flex-direction:column!important;gap:8px!important}
    .legal-num{min-width:auto!important}
  }
  @media(max-width:480px){
    .legal-content{padding:56px 16px 80px!important}
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

function TermsPage() {
  const [themeKey, setThemeKey] = useState<TK>("dark");
  useEffect(() => { setThemeKey((localStorage.getItem("subsight-theme") as TK) || "dark"); }, []);
  const toggle = () => { const n=themeKey==="dark"?"light":"dark" as TK; setThemeKey(n); localStorage.setItem("subsight-theme",n); };
  const t = themeKey === "dark" ? DARK : LIGHT;

  const sections = [
    {
      title: "Acceptance of Terms",
      body:  "By accessing or using Subsight (subsight-tracker.vercel.app or any self-hosted instance), you agree to these Terms of Service. If you do not agree, do not use the service. These terms apply to all users, including visitors, registered users, and contributors.",
    },
    {
      title: "Description of Service",
      body:  "Subsight is an open-source subscription tracking application that allows users to manually track recurring payments, view spending analytics, and receive AI-powered insights. The service is provided as-is under the MIT License. Self-hosted deployments are entirely the responsibility of the host operator.",
    },
    {
      title: "User Accounts",
      body:  "You must provide accurate information when creating an account. You are responsible for maintaining the security of your credentials. You must be at least 13 years old to create an account. We reserve the right to suspend accounts that violate these terms or abuse the service.",
    },
    {
      title: "Acceptable Use",
      body:  "You agree not to: (1) use the service for any illegal activity, (2) attempt to reverse-engineer, scrape, or abuse the API, (3) upload malicious content or compromise the security of the service, (4) use the service in a way that could damage, disable, or impair Subsight infrastructure, or (5) misrepresent your identity or affiliation.",
    },
    {
      title: "AI Features Disclaimer",
      body:  "AI-powered features (auto-fill, spending insights) are provided for convenience and informational purposes only. Outputs are generated by third-party AI models (Groq / GPT-OSS) and may contain errors. Subsight makes no warranty about the accuracy of AI outputs. Do not use AI-generated financial insights as your sole basis for financial decisions.",
    },
    {
      title: "Open Source License",
      body:  "Subsight's source code is licensed under the MIT License. You are free to use, copy, modify, merge, publish, distribute, sublicense, and sell copies of the software. The MIT License applies to the codebase only  not to the hosted service's data, branding, or proprietary configurations.",
    },
    {
      title: "Limitation of Liability",
      body:  'Subsight is provided "AS IS" without warranty of any kind. In no event shall the authors or maintainers be liable for any claim, damages, or other liability arising from the use or inability to use the software. This includes loss of data, loss of revenue, or service interruptions.',
    },
    {
      title: "Changes to Terms",
      body:  "We reserve the right to modify these terms at any time. Changes will be communicated via the GitHub repository and, where possible, via email. Continued use of the service after changes constitutes acceptance of the updated terms. Last updated: March 24, 2026.",
    },
    {
      title: "Contact",
      body:  "For legal inquiries, contact legal@subsight.io or open an issue at github.com/MuhammadTanveerAbbas/Subsight-Tracker.",
    },
  ];

  return (
    <div style={{ background:t.bg, color:t.text, fontFamily:"var(--font-display)", minHeight:"100vh", overflowX:"hidden", transition:"background 0.4s" }}>
      <style>{PAGE_CSS}</style>
      <PageNav t={t} themeKey={themeKey} toggle={toggle}/>
      <main style={{ paddingTop:62 }}>
        <div className="legal-content" style={{ maxWidth:780, margin:"0 auto", padding:"80px 24px 100px" }}>
          <div style={{ marginBottom:48, animation:"fadeUp 0.6s ease both" }}>
            <Label text="Legal" t={t}/>
            <h1 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(34px,5vw,56px)", fontWeight:800, letterSpacing:-2, color:t.text, marginBottom:14, lineHeight:1.06 }}>Terms of Service</h1>
            <p style={{ fontSize:13.5, color:t.text2, fontFamily:"var(--font-mono)", lineHeight:1.75 }}>Last updated: March 24, 2026 · These terms govern your use of Subsight. By using the service, you agree to the following.</p>
          </div>
          <div style={{ display:"flex", flexDirection:"column" }}>
            {sections.map((s,i) => (
              <div key={i} className="legal-section" style={{ padding:"30px 0", borderBottom:`1px solid ${t.border}`, display:"flex", gap:22 }}>
                <span className="legal-num" style={{ fontFamily:"var(--font-mono)", fontSize:11, color:t.green, letterSpacing:"0.1em", marginTop:4, flexShrink:0, minWidth:28 }}>{String(i+1).padStart(2,"0")}</span>
                <div>
                  <h2 style={{ fontFamily:"var(--font-display)", fontSize:19, fontWeight:700, color:t.text, marginBottom:12, letterSpacing:-0.3 }}>{s.title}</h2>
                  <p style={{ fontSize:14, color:t.text2, fontFamily:"var(--font-mono)", lineHeight:1.82 }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <PageFooter t={t}/>
    </div>
  );
}

export default TermsPage;
