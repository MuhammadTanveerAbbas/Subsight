"use client";

import Image from "next/image";

type T = { text: string; text3: string; green: string; border: string };

export function MktFooter({ t }: { t: T }) {
  return (
    <footer style={{ borderTop:`1px solid ${t.border}`, padding:"28px 20px" }}>
      <style>{`
        .mktfooter-inner{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;max-width:1080px;margin:0 auto}
        .mktfooter-links{display:flex;gap:18px;flex-wrap:wrap;justify-content:center}
        @media(max-width:600px){
          .mktfooter-inner{flex-direction:column;align-items:flex-start;gap:16px}
          .mktfooter-links{gap:14px}
        }
      `}</style>
      <div className="mktfooter-inner">
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <Image src="/icon.svg" alt="Subsight" width={22} height={22} style={{ borderRadius:5, display:"block" }} />
          <span style={{ fontFamily:"var(--font-display)", fontSize:14, fontWeight:800, color:t.text }}>Subsight</span>
        </div>
        <div className="mktfooter-links">
          {([["Home","/"],["Pricing","/pricing"],["Privacy","/privacy"],["Terms","/terms"],["GitHub","https://github.com/MuhammadTanveerAbbas/Subsight-Tracker"]] as [string,string][]).map(([l,h]) => (
            <a key={l} href={h} target={h.startsWith("http")?"_blank":"_self"} rel={h.startsWith("http")?"noopener":""} style={{ fontSize:12, color:t.text3, fontFamily:"var(--font-mono)", transition:"color 0.2s" }}
              onMouseEnter={e=>(e.currentTarget.style.color=t.green)}
              onMouseLeave={e=>(e.currentTarget.style.color=t.text3)}>{l}</a>
          ))}
        </div>
        <p style={{ fontSize:11, color:t.text3, fontFamily:"var(--font-mono)", whiteSpace:"nowrap" }}>© 2025 Subsight · MIT</p>
      </div>
    </footer>
  );
}
