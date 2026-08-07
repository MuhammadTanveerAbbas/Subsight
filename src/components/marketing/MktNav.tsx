"use client";
import React, { useState, useEffect } from "react";
import { Sun, Moon, ArrowRight, Zap, BarChart2, DollarSign, HelpCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type T = {
  text: string; text2: string; text3: string; green: string; green2: string;
  border: string; border2: string; surface2: string; surface3?: string; navBg: string; onGreen: string;
};
type TK = "dark" | "light";

export function MktNav({ t, themeKey, toggle }: { t: T; themeKey: TK; toggle: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const links: [string, string, React.ReactNode][] = [
    ["Features","/#features", <Zap key="f" size={13} color={t.text2}/>],
    ["Compare","/#compare", <BarChart2 key="c" size={13} color={t.text2}/>],
    ["Pricing","/pricing", <DollarSign key="p" size={13} color={t.text2}/>],
    ["FAQ","/#faq", <HelpCircle key="q" size={13} color={t.text2}/>],
  ];

  return (
    <>
      <style>{`
        .mktnav-links{display:flex!important}
        .mktnav-desktop-cta{display:flex!important}
        .mktnav-mobile-cta{display:none!important}
        @media(max-width:768px){
          .mktnav-links{display:none!important}
          .mktnav-desktop-cta{display:none!important}
          .mktnav-mobile-cta{display:flex!important}
        }
      `}</style>
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, display:"grid", gridTemplateColumns:"1fr auto 1fr", alignItems:"center", padding:"0 24px", height:62, background:scrolled?t.navBg:"transparent", borderBottom:scrolled?`1px solid ${t.border}`:"none", backdropFilter:scrolled?"blur(14px)":"none", WebkitBackdropFilter:scrolled?"blur(14px)":"none", transition:"all 0.35s" }}>
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:9, textDecoration:"none" }}>
          <Image src="/icon.svg" alt="Subsight" width={28} height={28} style={{ borderRadius:7, flexShrink:0, display:"block" }} />
          <span style={{ fontFamily:"var(--font-display)", fontSize:17, fontWeight:800, color:t.text, letterSpacing:-0.5 }}>Subsight</span>
        </Link>

        <div className="mktnav-links" style={{ display:"flex", alignItems:"center", gap:24 }}>
          {links.map(([l,h,icon]) => (
            <Link key={l} href={h} style={{ fontSize:13, color:t.text2, fontWeight:500, fontFamily:"var(--font-display)", transition:"color 0.2s", display:"flex", alignItems:"center", gap:5 }}
              onMouseEnter={e=>(e.currentTarget.style.color=t.text)}
              onMouseLeave={e=>(e.currentTarget.style.color=t.text2)}>{icon}{l}</Link>
          ))}
        </div>

        <div style={{ display:"flex", gap:10, alignItems:"center", justifyContent:"flex-end" }}>
          <button onClick={toggle} aria-label="Toggle theme" style={{ width:32, height:32, border:`1px solid ${t.border2}`, borderRadius:7, background:t.surface2, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.2s" }}>
            {themeKey==="dark" ? <Sun size={13} color={t.text2}/> : <Moon size={13} color={t.text2}/>}
          </button>
          <Link href="/sign-up" className="mktnav-desktop-cta" style={{ background:t.green, color:t.onGreen, borderRadius:8, padding:"8px 18px", fontSize:13, fontWeight:700, fontFamily:"var(--font-display)", alignItems:"center", gap:6, transition:"background 0.2s" }}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=t.green2}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=t.green}>
            Get Started <ArrowRight size={12}/>
          </Link>
          <div className="mktnav-mobile-cta" style={{ alignItems:"center", gap:8 }}>
            <Link href="/sign-up" style={{ background:t.green, color:t.onGreen, borderRadius:6, padding:"5px 10px", fontSize:11, fontWeight:700, fontFamily:"var(--font-display)", display:"flex", alignItems:"center", gap:4 }}>
              Get Started <ArrowRight size={10}/>
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
