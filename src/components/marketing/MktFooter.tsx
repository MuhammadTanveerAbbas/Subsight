"use client";

type T = { text: string; text3: string; green: string; border: string };

export function MktFooter({ t }: { t: T }) {
  return (
    <footer style={{ borderTop:`1px solid ${t.border}`, padding:"36px 24px" }}>
      <div className="footer-row" style={{ maxWidth:1080, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <img src="/icon.svg" alt="Subsight" width={24} height={24} style={{ borderRadius:5, display:"block" }} />
          <span style={{ fontFamily:"var(--font-display)", fontSize:15, fontWeight:800, color:t.text }}>Subsight</span>
        </div>
        <div style={{ display:"flex", gap:20, flexWrap:"wrap", justifyContent:"center" }}>
          {([["Home","/"],["Pricing","/pricing"],["Privacy","/privacy"],["Terms","/terms"],["GitHub","https://github.com/MuhammadTanveerAbbas/Subsight-Tracker"]] as [string,string][]).map(([l,h]) => (
            <a key={l} href={h} target={h.startsWith("http")?"_blank":"_self"} rel={h.startsWith("http")?"noopener":""} style={{ fontSize:12, color:t.text3, fontFamily:"var(--font-mono)", transition:"color 0.2s" }}
              onMouseEnter={e=>(e.currentTarget.style.color=t.green)}
              onMouseLeave={e=>(e.currentTarget.style.color=t.text3)}>{l}</a>
          ))}
        </div>
        <p style={{ fontSize:11, color:t.text3, fontFamily:"var(--font-mono)" }}>© 2025 Subsight · MIT License</p>
      </div>
    </footer>
  );
}
