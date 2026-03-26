"use client";
import { useState, useEffect } from "react";
import { Sun, Moon, ArrowRight } from "lucide-react";
import Link from "next/link";

type T = {
  text: string; text2: string; text3: string; green: string; green2: string;
  border: string; border2: string; surface2: string; navBg: string; onGreen: string;
};
type TK = "dark" | "light";

export function MktNav({ t, themeKey, toggle }: { t: T; themeKey: TK; toggle: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, display:"grid", gridTemplateColumns:"1fr auto 1fr", alignItems:"center", padding:"0 48px", height:62, background:scrolled?t.navBg:"transparent", borderBottom:scrolled?`1px solid ${t.border}`:"none", backdropFilter:scrolled?"blur(14px)":"none", WebkitBackdropFilter:scrolled?"blur(14px)":"none", transition:"all 0.35s" }}>
      <Link href="/" style={{ display:"flex", alignItems:"center", gap:9, textDecoration:"none" }}>
        <img src="/icon.svg" alt="Subsight" width={28} height={28} style={{ borderRadius:7, flexShrink:0, display:"block" }} />
        <span style={{ fontFamily:"var(--font-display)", fontSize:17, fontWeight:800, color:t.text, letterSpacing:-0.5 }}>Subsight</span>
      </Link>

      <div className="nav-links" style={{ display:"flex", alignItems:"center", gap:24 }}>
        {([["Features","/#features"],["Compare","/#compare"],["Pricing","/pricing"],["FAQ","/#faq"]] as [string,string][]).map(([l,h]) => (
          <Link key={l} href={h} style={{ fontSize:13, color:t.text2, fontWeight:500, fontFamily:"var(--font-display)", transition:"color 0.2s" }}
            onMouseEnter={e=>(e.currentTarget.style.color=t.text)}
            onMouseLeave={e=>(e.currentTarget.style.color=t.text2)}>{l}</Link>
        ))}
      </div>

      <div style={{ display:"flex", gap:10, alignItems:"center", justifyContent:"flex-end" }}>
        <button onClick={toggle} aria-label="Toggle theme" style={{ width:32, height:32, border:`1px solid ${t.border2}`, borderRadius:7, background:t.surface2, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.2s" }}>
          {themeKey==="dark" ? <Sun size={13} color={t.text2}/> : <Moon size={13} color={t.text2}/>}
        </button>
        <Link href="/sign-up" style={{ background:t.green, color:t.onGreen, borderRadius:8, padding:"8px 18px", fontSize:13, fontWeight:700, fontFamily:"var(--font-display)", display:"flex", alignItems:"center", gap:6, transition:"background 0.2s" }}
          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=t.green2}
          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=t.green}>
          Get Started <ArrowRight size={12}/>
        </Link>
      </div>
    </nav>
  );
}
