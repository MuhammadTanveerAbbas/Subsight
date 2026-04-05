"use client";
import { useState, useEffect } from "react";
import { Sun, Moon, ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";

type T = {
  text: string; text2: string; text3: string; green: string; green2: string;
  border: string; border2: string; surface2: string; surface3?: string; navBg: string; onGreen: string;
};
type TK = "dark" | "light";

export function MktNav({ t, themeKey, toggle }: { t: T; themeKey: TK; toggle: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const links: [string, string][] = [["Features","/#features"],["Compare","/#compare"],["Pricing","/pricing"],["FAQ","/#faq"]];

  return (
    <>
      <style>{`
        .mktnav-links{display:flex!important}
        .mktnav-hamburger{display:none!important}
        .mktnav-mobile{display:none!important}
        @media(max-width:768px){
          .mktnav-links{display:none!important}
          .mktnav-hamburger{display:flex!important}
          .mktnav-mobile.open{display:flex!important}
        }
      `}</style>
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, display:"grid", gridTemplateColumns:"1fr auto 1fr", alignItems:"center", padding:"0 24px", height:62, background:scrolled?t.navBg:"transparent", borderBottom:scrolled?`1px solid ${t.border}`:"none", backdropFilter:scrolled?"blur(14px)":"none", WebkitBackdropFilter:scrolled?"blur(14px)":"none", transition:"all 0.35s" }}>
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:9, textDecoration:"none" }}>
          <img src="/icon.svg" alt="Subsight" width={28} height={28} style={{ borderRadius:7, flexShrink:0, display:"block" }} />
          <span style={{ fontFamily:"var(--font-display)", fontSize:17, fontWeight:800, color:t.text, letterSpacing:-0.5 }}>Subsight</span>
        </Link>

        <div className="mktnav-links" style={{ display:"flex", alignItems:"center", gap:24 }}>
          {links.map(([l,h]) => (
            <Link key={l} href={h} style={{ fontSize:13, color:t.text2, fontWeight:500, fontFamily:"var(--font-display)", transition:"color 0.2s" }}
              onMouseEnter={e=>(e.currentTarget.style.color=t.text)}
              onMouseLeave={e=>(e.currentTarget.style.color=t.text2)}>{l}</Link>
          ))}
        </div>

        <div style={{ display:"flex", gap:10, alignItems:"center", justifyContent:"flex-end" }}>
          <button onClick={toggle} aria-label="Toggle theme" style={{ width:32, height:32, border:`1px solid ${t.border2}`, borderRadius:7, background:t.surface2, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.2s" }}>
            {themeKey==="dark" ? <Sun size={13} color={t.text2}/> : <Moon size={13} color={t.text2}/>}
          </button>
          <Link href="/sign-up" className="mktnav-links" style={{ background:t.green, color:t.onGreen, borderRadius:8, padding:"8px 18px", fontSize:13, fontWeight:700, fontFamily:"var(--font-display)", display:"flex", alignItems:"center", gap:6, transition:"background 0.2s" }}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=t.green2}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=t.green}>
            Get Started <ArrowRight size={12}/>
          </Link>
          <button className="mktnav-hamburger" onClick={()=>setMenuOpen(!menuOpen)} aria-label="Open menu"
            style={{ background:"none", border:"none", color:t.text, cursor:"pointer", padding:4, display:"none", alignItems:"center" }}>
            {menuOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`mktnav-mobile ${menuOpen?"open":""}`} style={{ display:"none", position:"fixed", top:62, left:0, right:0, zIndex:99, background:t.navBg, borderBottom:`1px solid ${t.border}`, backdropFilter:"blur(14px)", WebkitBackdropFilter:"blur(14px)", padding:"16px 20px 24px", flexDirection:"column", gap:4 }}>
        {links.map(([l,h]) => (
          <Link key={l} href={h} onClick={()=>setMenuOpen(false)}
            style={{ fontSize:15, color:t.text2, fontWeight:500, fontFamily:"var(--font-display)", padding:"12px 14px", borderRadius:10, transition:"all 0.2s" }}
            onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.color=t.text; (e.currentTarget as HTMLElement).style.background=t.surface2; }}
            onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.color=t.text2; (e.currentTarget as HTMLElement).style.background="transparent"; }}
          >{l}</Link>
        ))}
        <div style={{ height:1, background:t.border, margin:"8px 0" }} />
        <Link href="/sign-in" style={{ fontSize:14, color:t.text2, fontFamily:"var(--font-display)", padding:"12px 14px", borderRadius:10 }} onClick={()=>setMenuOpen(false)}>Sign In</Link>
        <Link href="/sign-up" style={{ background:t.green, color:t.onGreen, borderRadius:10, padding:"14px", fontSize:14, fontWeight:700, fontFamily:"var(--font-display)", textAlign:"center", marginTop:4 }} onClick={()=>setMenuOpen(false)}>
          Get Started Free
        </Link>
      </div>
    </>
  );
}
