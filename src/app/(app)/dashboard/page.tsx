"use client";
// ─────────────────────────────────────────────────────────────────────────────
// dashboard.tsx  —  Subsight App Shell
// Place at: src/app/(app)/dashboard/page.tsx
//
// Views (all rendered in-page, toggled by sidebar):
//   overview · subscriptions · analytics · ai-summary
//   add · export · settings · profile
//
// Features:
//   • Collapsible sidebar, mobile overlay sidebar
//   • Dark / light theme toggle (localStorage + TODO: sync to profiles.theme)
//   • Edit subscription modal
//   • Simulation mode
//   • Animated Recharts (AreaChart, BarChart, PieChart)
//   • AI Summary with mock Groq call stub
//   • Export JSON / CSV / PDF
//   • Keyboard shortcuts: Ctrl+E, Ctrl+S, Ctrl+A
//   • Toast notifications
//   • Fully responsive (mobile, tablet, desktop)
//
// All Supabase calls are stubbed with TODO comments.
// Kiro wires real data in PROMPT 3.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Bell, Search, Sun, Moon, Menu, X,
  ChevronRight, ChevronLeft, ChevronDown, Trash2, Edit3,
  Check, AlertTriangle, TrendingUp, TrendingDown, RefreshCw,
  Copy, FileText, LogOut, ArrowRight, PieChart, Zap, Globe,
  Lock, Shield, Target, Tag, DollarSign, ToggleLeft, ToggleRight,
  CheckCircle, XCircle, Save, KeyRound,
  CreditCard, Plus, Sparkles, Download, BarChart3, User
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar,
  PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  DARK, LIGHT, MOCK_SUBS, MONTHLY_DATA, CAT_DATA, NAV_MAIN, NAV_BOTTOM,
  type TK, type T, type Sub, type SubStatus,
} from "./dashboard-constants";

// ─── Shared micro-components ──────────────────────────────────────────────────
function Badge({ status, t }: { status: SubStatus; t: T }) {
  const cfg: Record<SubStatus,{ color:string; bg:string; label:string }> = {
    active:          { color:t.green, bg:t.greenDim,  label:"Active"          },
    warning:         { color:t.amber, bg:t.amberDim,  label:"Due Soon"        },
    renewal_passed:  { color:t.red,   bg:t.redDim,    label:"Renewal Passed"  },
    inactive:        { color:t.text3, bg:t.surface2,  label:"Inactive"        },
  };
  const c = cfg[status];
  return (
    <span style={{ fontSize:10, color:c.color, background:c.bg, border:`1px solid ${c.color}33`, borderRadius:4, padding:"3px 8px", fontFamily:"var(--font-mono)", whiteSpace:"nowrap" }}>
      {c.label}
    </span>
  );
}

function Toast({ msg, type, onClose, t }: { msg:string; type:"success"|"error"|"info"; onClose:()=>void; t:T }) {
  const col = { success:t.green, error:t.red, info:t.blue }[type];
  const Ico = { success:CheckCircle, error:XCircle, info:Bell }[type];
  useEffect(() => { const id = setTimeout(onClose, 4000); return () => clearTimeout(id); }, [onClose]);
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:1000, background:t.surface, border:`1px solid ${col}44`, borderLeft:`3px solid ${col}`, borderRadius:10, padding:"13px 17px", display:"flex", alignItems:"center", gap:10, boxShadow:`0 8px 32px ${t.shadow}`, animation:"slideUp 0.3s ease", maxWidth:360, minWidth:260 }}>
      <Ico size={14} color={col} style={{ flexShrink:0 }} />
      <span style={{ fontSize:13, color:t.text, fontFamily:"var(--font-mono)", flex:1 }}>{msg}</span>
      <button onClick={onClose} style={{ background:"none", border:"none", color:t.text3, cursor:"pointer", padding:2, display:"flex" }}><X size={13}/></button>
    </div>
  );
}

function KPI({ label, value, sub, Icon, trend, t }: { label:string; value:string; sub?:string; Icon:React.ElementType; trend?:"up"|"down"|"neutral"; t:T }) {
  return (
    <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:"20px 22px", display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:10.5, color:t.text3, fontFamily:"var(--font-mono)", letterSpacing:"0.1em", textTransform:"uppercase" }}>{label}</span>
        <div style={{ width:32, height:32, borderRadius:8, background:t.greenDim, border:`1px solid ${t.greenBorder}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Icon size={14} color={t.green} strokeWidth={1.5} />
        </div>
      </div>
      <div>
        <div style={{ fontFamily:"var(--font-display)", fontSize:28, fontWeight:800, color:t.text, lineHeight:1, letterSpacing:-1 }}>{value}</div>
        {sub && (
          <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:6 }}>
            {trend==="up"   && <TrendingUp   size={11} color={t.green} />}
            {trend==="down" && <TrendingDown size={11} color={t.red}   />}
            <span style={{ fontSize:11, color:trend==="up"?t.green:trend==="down"?t.red:t.text3, fontFamily:"var(--font-mono)" }}>{sub}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function InputRow({ label, value, onChange, type="text", placeholder="", t }: { label:string; value:string; onChange:(v:string)=>void; type?:string; placeholder?:string; t:T }) {
  const base: React.CSSProperties = { width:"100%", background:t.surface2, border:`1px solid ${t.border}`, borderRadius:8, padding:"10px 13px", fontSize:13, color:t.text, fontFamily:"var(--font-mono)", outline:"none", transition:"border-color 0.2s" };
  return (
    <div>
      <label style={{ fontSize:10.5, color:t.text3, fontFamily:"var(--font-mono)", letterSpacing:"0.08em", display:"block", marginBottom:5 }}>{label}</label>
      <input value={value} onChange={e=>onChange(e.target.value)} type={type} placeholder={placeholder} style={base}
        onFocus={e=>(e.target as HTMLInputElement).style.borderColor=t.greenBorder}
        onBlur={e=>(e.target as HTMLInputElement).style.borderColor=t.border} />
    </div>
  );
}

function SelectRow({ label, value, onChange, options, t }: { label:string; value:string; onChange:(v:string)=>void; options:string[]; t:T }) {
  return (
    <div>
      <label style={{ fontSize:10.5, color:t.text3, fontFamily:"var(--font-mono)", letterSpacing:"0.08em", display:"block", marginBottom:5 }}>{label}</label>
      <select value={value} onChange={e=>onChange(e.target.value)} style={{ width:"100%", background:t.surface2, border:`1px solid ${t.border}`, borderRadius:8, padding:"10px 13px", fontSize:13, color:t.text, fontFamily:"var(--font-mono)", outline:"none", cursor:"pointer" }}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ─── Edit Subscription Modal ──────────────────────────────────────────────────
function EditModal({ sub, onSave, onClose, t }: { sub:Sub; onSave:(s:Sub)=>void; onClose:()=>void; t:T }) {
  const [form, setForm] = useState<Sub>({ ...sub });
  const [saving, setSaving] = useState(false);
  const f = <K extends keyof Sub>(k:K) => (v: Sub[K]) => setForm(p=>({ ...p, [k]:v }));

  const handleSave = async () => {
    setSaving(true);
    // TODO PROMPT 3: await supabase.from('subscriptions').update({...form}).eq('id', form.id);
    await new Promise(r => setTimeout(r, 700));
    onSave(form);
    setSaving(false);
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)" }} onClick={onClose} />
      <div style={{ position:"relative", zIndex:1, background:t.surface, border:`1px solid ${t.border}`, borderRadius:14, padding:"28px 28px", width:"100%", maxWidth:520, maxHeight:"90vh", overflowY:"auto", boxShadow:`0 32px 80px ${t.shadow}` }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
          <div>
            <h2 style={{ fontFamily:"var(--font-display)", fontSize:19, fontWeight:800, color:t.text, letterSpacing:-0.5 }}>Edit Subscription</h2>
            <p style={{ fontSize:11, color:t.text3, fontFamily:"var(--font-mono)", marginTop:2 }}>Update details for {sub.name}</p>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:t.text3, cursor:"pointer", padding:4 }}><X size={18}/></button>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <InputRow label="Subscription Name *" value={form.name} onChange={v=>f("name")(v)} placeholder="e.g. Netflix" t={t} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={{ fontSize:10.5, color:t.text3, fontFamily:"var(--font-mono)", letterSpacing:"0.08em", display:"block", marginBottom:5 }}>Amount *</label>
              <div style={{ display:"flex", gap:6 }}>
                <select value={form.currency} onChange={e=>f("currency")(e.target.value)} style={{ background:t.surface2, border:`1px solid ${t.border}`, borderRadius:8, padding:"10px 10px", fontSize:12, color:t.text, fontFamily:"var(--font-mono)", cursor:"pointer", outline:"none", flexShrink:0 }}>
                  {["USD","EUR","GBP","PKR","CAD","AUD"].map(c=><option key={c}>{c}</option>)}
                </select>
                <input value={String(form.amount)} onChange={e=>f("amount")(parseFloat(e.target.value)||0 as any)} type="number" step="0.01" style={{ flex:1, background:t.surface2, border:`1px solid ${t.border}`, borderRadius:8, padding:"10px 13px", fontSize:13, color:t.text, fontFamily:"var(--font-mono)", outline:"none" }} />
              </div>
            </div>
            <SelectRow label="Billing Cycle" value={form.cycle} onChange={v=>f("cycle")(v)} options={["Daily","Weekly","Monthly","Quarterly","Annually"]} t={t} />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <SelectRow label="Category" value={form.category} onChange={v=>f("category")(v)} options={["Streaming","Productivity","Cloud","Design","Development","Music","Finance","Education","Lifestyle","Other"]} t={t} />
            <SelectRow label="Status" value={form.status} onChange={v=>f("status")(v as SubStatus)} options={["active","inactive","warning","renewal_passed"]} t={t} />
          </div>
          <InputRow label="Provider" value={form.provider} onChange={v=>f("provider")(v)} placeholder="e.g. Netflix Inc." t={t} />
          <div>
            <label style={{ fontSize:10.5, color:t.text3, fontFamily:"var(--font-mono)", letterSpacing:"0.08em", display:"block", marginBottom:5 }}>Notes</label>
            <textarea value={form.notes} onChange={e=>f("notes")(e.target.value)} rows={2} placeholder="Optional notes..." style={{ width:"100%", background:t.surface2, border:`1px solid ${t.border}`, borderRadius:8, padding:"10px 13px", fontSize:13, color:t.text, fontFamily:"var(--font-mono)", outline:"none", resize:"vertical", transition:"border-color 0.2s" }}
              onFocus={e=>(e.target as HTMLTextAreaElement).style.borderColor=t.greenBorder}
              onBlur={e=>(e.target as HTMLTextAreaElement).style.borderColor=t.border} />
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:t.surface2, border:`1px solid ${t.border}`, borderRadius:8, padding:"12px 14px" }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:t.text, fontFamily:"var(--font-display)" }}>Auto Renew</div>
              <div style={{ fontSize:11, color:t.text3, fontFamily:"var(--font-mono)", marginTop:1 }}>Automatically renews each billing cycle</div>
            </div>
            <button onClick={()=>f("autoRenew")(!form.autoRenew)} style={{ background:"none", border:"none", cursor:"pointer", color:form.autoRenew?t.green:t.text3 }}>
              {form.autoRenew ? <ToggleRight size={28}/> : <ToggleLeft size={28}/>}
            </button>
          </div>
        </div>

        <div style={{ display:"flex", gap:10, marginTop:24 }}>
          <button onClick={handleSave} disabled={saving || !form.name} style={{ flex:1, background:t.green, color:"#000", border:"none", borderRadius:8, padding:"12px", fontSize:13, fontWeight:700, fontFamily:"var(--font-display)", cursor:saving||!form.name?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, opacity:!form.name?0.6:1 }}>
            {saving ? <><RefreshCw size={13} style={{ animation:"spin 1s linear infinite" }}/> Saving...</> : <><Save size={13}/> Save Changes</>}
          </button>
          <button onClick={onClose} style={{ background:"transparent", color:t.text2, border:`1px solid ${t.border2}`, borderRadius:8, padding:"12px 20px", fontSize:13, fontFamily:"var(--font-display)", cursor:"pointer" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEWS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Overview View ────────────────────────────────────────────────────────────
function OverviewView({ t, subs, onNav }: { t:T; subs:Sub[]; onNav:(id:string)=>void }) {
  const active  = subs.filter(s => s.status !== "inactive");
  const monthly = active.reduce((a,s) => a + s.amount, 0);
  const dueCount= subs.filter(s => s.status === "warning").length;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {/* KPI row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))", gap:14 }}>
        <KPI t={t} label="Monthly Spend"  value={`$${monthly.toFixed(2)}`} sub="+12.4% vs last month" trend="up"      Icon={DollarSign}  />
        <KPI t={t} label="Active Subs"    value={`${active.length}`}        sub={`${subs.length} total tracked`}       Icon={CreditCard}  />
        <KPI t={t} label="Annual Cost"    value={`$${(monthly*12).toFixed(0)}`} sub="Projected this year"             Icon={TrendingUp}  />
        <KPI t={t} label="Potential Save" value={`$${(dueCount*20).toFixed(0)}`} sub="By cancelling unused" trend="down" Icon={Target} />
        <KPI t={t} label="Avg per Sub"    value={`$${active.length ? (monthly / active.length).toFixed(2) : "0.00"}`} sub="Monthly average cost" trend="neutral" Icon={Zap} />
      </div>

      {/* Spending chart + donut */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:14 }}>
        <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:"20px 22px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:t.text, fontFamily:"var(--font-display)" }}>Monthly Spending</div>
              <div style={{ fontSize:10, color:t.text3, fontFamily:"var(--font-mono)", marginTop:2 }}>Projected for 2026</div>
            </div>
            <button onClick={()=>onNav("analytics")} style={{ fontSize:11, color:t.green, background:t.greenDim, border:`1px solid ${t.greenBorder}`, borderRadius:6, padding:"5px 10px", cursor:"pointer", fontFamily:"var(--font-mono)", display:"flex", alignItems:"center", gap:4 }}>
              View Full <ChevronRight size={11} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={MONTHLY_DATA}>
              <defs>
                <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={t.green} stopOpacity={0.18}/>
                  <stop offset="95%" stopColor={t.green} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
              <XAxis dataKey="month" tick={{ fontSize:9, fill:t.text3, fontFamily:"var(--font-mono)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:9, fill:t.text3, fontFamily:"var(--font-mono)" }} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`} />
              <Tooltip contentStyle={{ background:t.surface2, border:`1px solid ${t.border2}`, borderRadius:8, fontSize:12, fontFamily:"var(--font-mono)", color:t.text }} formatter={(v:number)=>[`$${v}`,""]} />
              <Area type="monotone" dataKey="spend" stroke={t.green} strokeWidth={2} fill="url(#aGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:"20px 22px" }}>
          <div style={{ fontSize:13, fontWeight:700, color:t.text, fontFamily:"var(--font-display)", marginBottom:4 }}>By Category</div>
          <div style={{ fontSize:10, color:t.text3, fontFamily:"var(--font-mono)", marginBottom:14 }}>Annual breakdown</div>
          <ResponsiveContainer width="100%" height={120}>
            <RechartsPie>
              <Pie data={CAT_DATA} cx="50%" cy="50%" innerRadius={34} outerRadius={54} dataKey="value" paddingAngle={2}>
                {CAT_DATA.map((c,i) => <Cell key={i} fill={c.color}/>)}
              </Pie>
              <Tooltip contentStyle={{ background:t.surface2, border:`1px solid ${t.border2}`, borderRadius:8, fontSize:11, fontFamily:"var(--font-mono)", color:t.text }} formatter={(v:number)=>[`${v}%`,""]} />
            </RechartsPie>
          </ResponsiveContainer>
          <div style={{ display:"flex", flexDirection:"column", gap:5, marginTop:8 }}>
            {CAT_DATA.map(c => (
              <div key={c.name} style={{ display:"flex", alignItems:"center", gap:7 }}>
                <span style={{ width:7, height:7, borderRadius:2, background:c.color, flexShrink:0 }}/>
                <span style={{ fontSize:10, color:t.text2, fontFamily:"var(--font-mono)", flex:1 }}>{c.name}</span>
                <span style={{ fontSize:10, color:t.text, fontFamily:"var(--font-mono)" }}>{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent subs table */}
      <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, overflow:"hidden" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"15px 20px", borderBottom:`1px solid ${t.border}` }}>
          <div style={{ fontSize:13, fontWeight:700, color:t.text, fontFamily:"var(--font-display)" }}>My Subscriptions</div>
          <button onClick={()=>onNav("subscriptions")} style={{ fontSize:11, color:t.green, background:"none", border:"none", cursor:"pointer", fontFamily:"var(--font-mono)", display:"flex", alignItems:"center", gap:4 }}>
            View all <ChevronRight size={11}/>
          </button>
        </div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:560 }}>
            <thead>
              <tr style={{ background:t.surface2 }}>
                {["Name","Category","Amount","Next Renewal","Status"].map(h => (
                  <th key={h} style={{ padding:"9px 16px", textAlign:"left", fontSize:9.5, color:t.text3, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"var(--font-mono)", fontWeight:400, borderBottom:`1px solid ${t.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subs.slice(0,5).map(s => (
                <tr key={s.id} style={{ borderBottom:`1px solid ${t.border}`, transition:"background 0.15s" }}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=t.surface2}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background="transparent"}>
                  <td style={{ padding:"11px 16px", fontSize:13, fontWeight:600, color:t.text, fontFamily:"var(--font-display)" }}>{s.name}</td>
                  <td style={{ padding:"11px 16px", fontSize:11, color:t.text2, fontFamily:"var(--font-mono)" }}>{s.category}</td>
                  <td style={{ padding:"11px 16px", fontSize:13, fontWeight:700, color:t.text, fontFamily:"var(--font-mono)" }}>${s.amount.toFixed(2)}</td>
                  <td style={{ padding:"11px 16px", fontSize:11, color:t.text2, fontFamily:"var(--font-mono)" }}>{s.nextDate}</td>
                  <td style={{ padding:"11px 16px" }}><Badge status={s.status} t={t}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Subscriptions View ───────────────────────────────────────────────────────
function SubsView({
  t, subs, setSubs, onAdd, toast,
}: {
  t:T; subs:Sub[]; setSubs:React.Dispatch<React.SetStateAction<Sub[]>>;
  onAdd:()=>void; toast:(m:string,tp:"success"|"error"|"info")=>void;
}) {
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("all");
  const [sim,      setSim]      = useState(false);
  const [editing,  setEditing]  = useState<Sub|null>(null);
  const [deleting, setDeleting] = useState<string|null>(null);

  const filtered = subs.filter(s => {
    const q = search.toLowerCase();
    const m = s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || s.provider.toLowerCase().includes(q);
    const f = filter === "all" || s.status === filter;
    return m && f;
  });

  const toggleStatus = async (id:string) => {
    // TODO PROMPT 3: await supabase.from('subscriptions').update({ status: newStatus }).eq('id', id);
    setSubs(prev => prev.map(s => s.id===id ? { ...s, status: s.status==="active" ? "inactive" : "active" as SubStatus } : s));
  };

  const deleteSub = async (id:string) => {
    setDeleting(id);
    // TODO PROMPT 3: await supabase.from('subscriptions').delete().eq('id', id);
    await new Promise(r => setTimeout(r, 600));
    setSubs(prev => prev.filter(s => s.id !== id));
    setDeleting(null);
    toast("Subscription deleted", "info");
  };

  const saveEdit = (updated:Sub) => {
    setSubs(prev => prev.map(s => s.id===updated.id ? updated : s));
    setEditing(null);
    toast("Subscription updated", "success");
  };

  const simMonthly = filtered.filter(s=>s.status==="active").reduce((a,s)=>a+s.amount,0);
  const simInactive= filtered.filter(s=>s.status==="inactive").reduce((a,s)=>a+s.amount,0);

  return (
    <>
      {editing && <EditModal sub={editing} onSave={saveEdit} onClose={()=>setEditing(null)} t={t} />}
      <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div>
            <h2 style={{ fontFamily:"var(--font-display)", fontSize:22, fontWeight:800, color:t.text, letterSpacing:-0.5 }}>My Subscriptions</h2>
            <p style={{ fontSize:11.5, color:t.text3, fontFamily:"var(--font-mono)", marginTop:3 }}>
              {subs.length} tracked · ${subs.filter(s=>s.status==="active").reduce((a,s)=>a+s.amount,0).toFixed(2)}/mo active
            </p>
          </div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            <button onClick={()=>setSim(!sim)} style={{ display:"flex", alignItems:"center", gap:6, background:sim?t.greenDim:t.surface2, border:`1px solid ${sim?t.greenBorder:t.border2}`, borderRadius:8, padding:"9px 13px", cursor:"pointer", fontSize:12, color:sim?t.green:t.text2, fontFamily:"var(--font-mono)", transition:"all 0.2s" }}>
              {sim ? <ToggleRight size={14}/> : <ToggleLeft size={14}/>} Simulation
            </button>
            <button onClick={onAdd} style={{ background:t.green, color:"#000", border:"none", borderRadius:8, padding:"9px 16px", cursor:"pointer", fontSize:13, fontWeight:700, fontFamily:"var(--font-display)", display:"flex", alignItems:"center", gap:6 }}>
              <Plus size={13}/> Add
            </button>
          </div>
        </div>

        {sim && (
          <div style={{ background:t.amberDim, border:`1px solid ${t.amber}44`, borderRadius:10, padding:"12px 16px", display:"flex", alignItems:"center", gap:10 }}>
            <AlertTriangle size={14} color={t.amber}/>
            <span style={{ fontSize:12, color:t.amber, fontFamily:"var(--font-mono)" }}>Simulation active — toggle subscriptions to preview budget changes. No real changes are saved.</span>
          </div>
        )}

        {/* Search + filter */}
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:200, position:"relative" }}>
            <Search size={13} color={t.text3} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, category, or provider…"
              style={{ width:"100%", background:t.surface2, border:`1px solid ${t.border}`, borderRadius:9, padding:"9px 12px 9px 34px", fontSize:13, color:t.text, fontFamily:"var(--font-mono)", outline:"none", transition:"border-color 0.2s" }}
              onFocus={e=>(e.target as HTMLInputElement).style.borderColor=t.greenBorder}
              onBlur={e=>(e.target as HTMLInputElement).style.borderColor=t.border} />
          </div>
          <select value={filter} onChange={e=>setFilter(e.target.value)} style={{ background:t.surface2, border:`1px solid ${t.border}`, borderRadius:9, padding:"9px 13px", fontSize:12, color:t.text, fontFamily:"var(--font-mono)", cursor:"pointer", outline:"none" }}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="warning">Due Soon</option>
            <option value="renewal_passed">Renewal Passed</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Table */}
        <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, overflow:"hidden" }}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", minWidth:720 }}>
              <thead>
                <tr style={{ background:t.surface2 }}>
                  {["Active","Name","Category","Amount","Cycle","Renewal Date","Auto Renew","Status","Actions"].map(h => (
                    <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:9.5, color:t.text3, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"var(--font-mono)", fontWeight:400, borderBottom:`1px solid ${t.border}`, whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} style={{ borderBottom:`1px solid ${t.border}`, transition:"background 0.15s" }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=t.surface2}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background="transparent"}>
                    <td style={{ padding:"11px 14px" }}>
                      <button onClick={()=>toggleStatus(s.id)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center" }}>
                        <div style={{ width:18, height:18, borderRadius:4, background:s.status==="active"?t.green:t.surface3, border:`1px solid ${s.status==="active"?t.green:t.border2}`, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}>
                          {s.status==="active" && <Check size={11} color="#000" strokeWidth={2.5}/>}
                        </div>
                      </button>
                    </td>
                    <td style={{ padding:"11px 14px" }}>
                      <div style={{ fontSize:13, fontWeight:600, color:t.text, fontFamily:"var(--font-display)" }}>{s.name}</div>
                      {s.provider && <div style={{ fontSize:10, color:t.text3, fontFamily:"var(--font-mono)", marginTop:1 }}>{s.provider}</div>}
                    </td>
                    <td style={{ padding:"11px 14px" }}>
                      <span style={{ fontSize:11, color:t.text2, fontFamily:"var(--font-mono)", background:t.surface3, border:`1px solid ${t.border}`, borderRadius:4, padding:"2px 7px" }}>{s.category}</span>
                    </td>
                    <td style={{ padding:"11px 14px", fontSize:13, fontWeight:700, color:t.text, fontFamily:"var(--font-mono)" }}>{s.currency} {s.amount.toFixed(2)}</td>
                    <td style={{ padding:"11px 14px", fontSize:11, color:t.text2, fontFamily:"var(--font-mono)" }}>{s.cycle}</td>
                    <td style={{ padding:"11px 14px", fontSize:11, color:t.text2, fontFamily:"var(--font-mono)" }}>{s.nextDate}</td>
                    <td style={{ padding:"11px 14px" }}>
                      <span style={{ fontSize:10, color:s.autoRenew?t.green:t.text3, fontFamily:"var(--font-mono)" }}>{s.autoRenew?"Yes":"No"}</span>
                    </td>
                    <td style={{ padding:"11px 14px" }}><Badge status={s.status} t={t}/></td>
                    <td style={{ padding:"11px 14px" }}>
                      <div style={{ display:"flex", gap:4 }}>
                        <button onClick={()=>setEditing(s)} title="Edit"
                          style={{ background:"none", border:"none", cursor:"pointer", color:t.text3, padding:"4px", borderRadius:5, transition:"color 0.2s, background 0.2s" }}
                          onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.color=t.green; (e.currentTarget as HTMLElement).style.background=t.greenDim; }}
                          onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.color=t.text3; (e.currentTarget as HTMLElement).style.background="transparent"; }}>
                          <Edit3 size={13}/>
                        </button>
                        <button onClick={()=>deleteSub(s.id)} disabled={deleting===s.id} title="Delete"
                          style={{ background:"none", border:"none", cursor:"pointer", color:t.text3, padding:"4px", borderRadius:5, transition:"color 0.2s, background 0.2s" }}
                          onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.color=t.red; (e.currentTarget as HTMLElement).style.background=t.redDim; }}
                          onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.color=t.text3; (e.currentTarget as HTMLElement).style.background="transparent"; }}>
                          {deleting===s.id ? <RefreshCw size={13} style={{ animation:"spin 1s linear infinite" }}/> : <Trash2 size={13}/>}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div style={{ padding:"44px 20px", textAlign:"center", color:t.text3, fontFamily:"var(--font-mono)", fontSize:13 }}>
              No subscriptions found{search ? ` for "${search}"` : ""}.
            </div>
          )}
        </div>

        {/* Simulation summary */}
        {sim && (
          <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:"20px 22px" }}>
            <div style={{ fontSize:13, fontWeight:700, color:t.text, fontFamily:"var(--font-display)", marginBottom:14 }}>Simulation Summary</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:12 }}>
              {[
                { label:"Active Monthly",   value:`$${simMonthly.toFixed(2)}`           },
                { label:"Inactive Monthly", value:`$${simInactive.toFixed(2)}`          },
                { label:"Annual Savings",   value:`$${(simInactive*12).toFixed(2)}/yr`  },
              ].map(item => (
                <div key={item.label} style={{ background:t.surface2, borderRadius:8, padding:"14px 16px" }}>
                  <div style={{ fontSize:10, color:t.text3, fontFamily:"var(--font-mono)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>{item.label}</div>
                  <div style={{ fontFamily:"var(--font-display)", fontSize:20, fontWeight:800, color:t.text }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Analytics View ───────────────────────────────────────────────────────────
function AnalyticsView({ t }: { t:T }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div>
        <h2 style={{ fontFamily:"var(--font-display)", fontSize:22, fontWeight:800, color:t.text, letterSpacing:-0.5 }}>Analytics</h2>
        <p style={{ fontSize:11.5, color:t.text3, fontFamily:"var(--font-mono)", marginTop:3 }}>Spending trends and category breakdown</p>
      </div>

      {/* Stats row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:12 }}>
        {[{ l:"Avg Monthly",v:"$388",n:"based on 12 months" },{ l:"Peak Month",v:"$460",n:"August" },{ l:"Lowest Month",v:"$275",n:"February" },{ l:"Annual Total",v:"$4,656",n:"projected" }].map(s => (
          <div key={s.l} style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:10, padding:"16px 18px" }}>
            <div style={{ fontSize:10, color:t.text3, fontFamily:"var(--font-mono)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>{s.l}</div>
            <div style={{ fontFamily:"var(--font-display)", fontSize:22, fontWeight:800, color:t.text, letterSpacing:-0.5 }}>{s.v}</div>
            <div style={{ fontSize:10, color:t.text3, fontFamily:"var(--font-mono)", marginTop:4 }}>{s.n}</div>
          </div>
        ))}
      </div>

      {/* Area chart */}
      <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:"22px" }}>
        <div style={{ fontSize:14, fontWeight:700, color:t.text, fontFamily:"var(--font-display)", marginBottom:4 }}>Monthly Spending Trend</div>
        <div style={{ fontSize:10, color:t.text3, fontFamily:"var(--font-mono)", marginBottom:20 }}>12-month overview for 2026</div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={MONTHLY_DATA}>
            <defs>
              <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={t.green} stopOpacity={0.20}/>
                <stop offset="95%" stopColor={t.green} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={t.border}/>
            <XAxis dataKey="month" tick={{ fontSize:10, fill:t.text3, fontFamily:"var(--font-mono)" }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize:10, fill:t.text3, fontFamily:"var(--font-mono)" }} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`}/>
            <Tooltip contentStyle={{ background:t.surface2, border:`1px solid ${t.border2}`, borderRadius:8, fontSize:12, fontFamily:"var(--font-mono)", color:t.text }} formatter={(v:number)=>[`$${v}`,""]}/>
            <Area type="monotone" dataKey="spend" stroke={t.green} strokeWidth={2.5} fill="url(#g2)" dot={{ fill:t.green, r:3, strokeWidth:0 }}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bar + Donut row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:"22px" }}>
          <div style={{ fontSize:13, fontWeight:700, color:t.text, fontFamily:"var(--font-display)", marginBottom:18 }}>Spending by Category</div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={CAT_DATA} layout="vertical">
              <XAxis type="number" tick={{ fontSize:9, fill:t.text3, fontFamily:"var(--font-mono)" }} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/>
              <YAxis dataKey="name" type="category" tick={{ fontSize:9, fill:t.text2, fontFamily:"var(--font-mono)" }} axisLine={false} tickLine={false} width={78}/>
              <Tooltip contentStyle={{ background:t.surface2, border:`1px solid ${t.border2}`, borderRadius:8, fontSize:11, fontFamily:"var(--font-mono)", color:t.text }} formatter={(v:number)=>[`${v}%`,""]}/>
              <Bar dataKey="value" radius={[0,4,4,0]}>
                {CAT_DATA.map((c,i) => <Cell key={i} fill={c.color}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:"22px" }}>
          <div style={{ fontSize:13, fontWeight:700, color:t.text, fontFamily:"var(--font-display)", marginBottom:18 }}>Distribution</div>
          <ResponsiveContainer width="100%" height={140}>
            <RechartsPie>
              <Pie data={CAT_DATA} cx="50%" cy="50%" innerRadius={44} outerRadius={66} dataKey="value" paddingAngle={3}>
                {CAT_DATA.map((c,i) => <Cell key={i} fill={c.color}/>)}
              </Pie>
              <Tooltip contentStyle={{ background:t.surface2, border:`1px solid ${t.border2}`, borderRadius:8, fontSize:11, fontFamily:"var(--font-mono)", color:t.text }} formatter={(v:number)=>[`${v}%`,""]}/>
            </RechartsPie>
          </ResponsiveContainer>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"6px 14px", justifyContent:"center", marginTop:8 }}>
            {CAT_DATA.map(c => (
              <div key={c.name} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <span style={{ width:7, height:7, borderRadius:2, background:c.color, flexShrink:0 }}/>
                <span style={{ fontSize:9.5, color:t.text2, fontFamily:"var(--font-mono)" }}>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AI Summary View ──────────────────────────────────────────────────────────
function AISummaryView({ t, subs }: { t:T; subs:Sub[] }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string|null>(null);
  const [copied,  setCopied]  = useState(false);
  const monthly = subs.filter(s=>s.status==="active").reduce((a,s)=>a+s.amount,0);

  const generate = async () => {
    setLoading(true);
    // TODO PROMPT 3:
    // Check ai_summaries table for cached result first:
    // const { data: cached } = await supabase.from('ai_summaries').select('*')
    //   .eq('user_id', user.id).gt('expires_at', new Date().toISOString())
    //   .order('generated_at', { ascending: false }).limit(1).single();
    // if (cached) { setSummary(cached.content); setLoading(false); return; }
    //
    // const res = await fetch('/api/ai-summary', { method:'POST', body: JSON.stringify({ subscriptions: subs }) });
    // const { summary: content } = await res.json();
    // setSummary(content);
    // Insert into ai_summaries for caching:
    // await supabase.from('ai_summaries').insert({ user_id: user.id, content, total_monthly: monthly });

    await new Promise(r => setTimeout(r, 1800));
    setSummary(`Based on your **$${monthly.toFixed(2)}/month** subscription portfolio:\n\n**AWS ($43.20/mo)** is your largest expense. Consider Reserved Instances if usage is consistent — potential savings of 30–40%.\n\n**Adobe CC ($54.99/mo)** is your highest single subscription. Standalone Photoshop + Illustrator plans cost $21/mo each — potential saving of ~$13/mo.\n\n**Cursor AI ($29.00/mo)** renewal has passed without action. Review whether usage justifies continuation at the current plan tier.\n\n**Development tools** total $33/mo (Cursor + GitHub). Evaluate whether GitHub Pro features overlap with Cursor's IDE tooling.\n\n**3 subscriptions** are due for renewal within the next 5 days. Review AWS before its billing date.\n\n**Potential annual savings identified: $156–$360** through cloud optimization and creative tool consolidation.`);
    setLoading(false);
  };

  const copy = () => {
    if (summary) { navigator.clipboard.writeText(summary); setCopied(true); setTimeout(()=>setCopied(false),2000); }
  };

  const download = () => {
    if (!summary) return;
    const blob = new Blob([summary], { type:"text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href=url; a.download="subsight-ai-summary.txt"; a.click();
  };

  const renderSummary = (text:string) =>
    text.split(/\*\*(.*?)\*\*/g).map((part,i) =>
      i%2===0 ? part : <strong key={i} style={{ color:t.text, fontWeight:700 }}>{part}</strong>
    );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ fontFamily:"var(--font-display)", fontSize:22, fontWeight:800, color:t.text, letterSpacing:-0.5 }}>AI Summary</h2>
          <p style={{ fontSize:11.5, color:t.text3, fontFamily:"var(--font-mono)", marginTop:3 }}>AI-powered spending insights via Groq · Llama 3.3 70B</p>
        </div>
        <button onClick={generate} disabled={loading} style={{ background:t.green, color:"#000", border:"none", borderRadius:9, padding:"11px 20px", fontSize:13, fontWeight:700, fontFamily:"var(--font-display)", cursor:loading?"not-allowed":"pointer", display:"flex", alignItems:"center", gap:7, opacity:loading?0.75:1, transition:"background 0.2s" }}>
          {loading ? <><RefreshCw size={13} style={{ animation:"spin 1s linear infinite" }}/> Analyzing…</> : <><Sparkles size={13}/> Generate Summary</>}
        </button>
      </div>

      {/* Quick insight cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(195px,1fr))", gap:13 }}>
        {[
          { Icon:TrendingUp,    label:"Monthly Trend",     value:"↑ 12.4%",  col:t.amber, bg:t.amberDim },
          { Icon:Target,        label:"Potential Savings", value:"$140+/mo",  col:t.green, bg:t.greenDim },
          { Icon:AlertTriangle, label:"Due This Week",     value:"3 subs",   col:t.red,   bg:t.redDim   },
          { Icon:Zap,           label:"Score",             value:"72 / 100", col:t.blue,  bg:t.blueDim  },
        ].map(card => (
          <div key={card.label} style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:"18px 20px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
              <div style={{ width:32, height:32, borderRadius:8, background:card.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <card.Icon size={14} color={card.col} strokeWidth={1.5}/>
              </div>
              <span style={{ fontSize:10.5, color:t.text3, fontFamily:"var(--font-mono)", textTransform:"uppercase", letterSpacing:"0.08em" }}>{card.label}</span>
            </div>
            <div style={{ fontFamily:"var(--font-display)", fontSize:22, fontWeight:800, color:t.text }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Summary output */}
      {summary ? (
        <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:"24px 26px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18 }}>
            <Sparkles size={14} color={t.green}/>
            <span style={{ fontSize:13, fontWeight:700, color:t.text, fontFamily:"var(--font-display)" }}>AI Analysis</span>
            <span style={{ fontSize:10, color:t.text3, fontFamily:"var(--font-mono)", marginLeft:"auto" }}>Powered by Groq · Llama 3.3 70B</span>
          </div>
          <div style={{ fontSize:13.5, color:t.text2, fontFamily:"var(--font-mono)", lineHeight:1.82, whiteSpace:"pre-wrap" }}>
            {renderSummary(summary)}
          </div>
          <div style={{ display:"flex", gap:10, marginTop:20 }}>
            <button onClick={copy} style={{ background:t.surface2, border:`1px solid ${t.border2}`, borderRadius:7, padding:"8px 14px", fontSize:12, color:t.text2, cursor:"pointer", fontFamily:"var(--font-mono)", display:"flex", alignItems:"center", gap:6 }}>
              {copied ? <><Check size={12} color={t.green}/> Copied!</> : <><Copy size={12}/> Copy</>}
            </button>
            <button onClick={download} style={{ background:t.surface2, border:`1px solid ${t.border2}`, borderRadius:7, padding:"8px 14px", fontSize:12, color:t.text2, cursor:"pointer", fontFamily:"var(--font-mono)", display:"flex", alignItems:"center", gap:6 }}>
              <Download size={12}/> Download
            </button>
          </div>
        </div>
      ) : (
        <div style={{ background:t.surface, border:`1px dashed ${t.border2}`, borderRadius:12, padding:"52px 24px", textAlign:"center" }}>
          <Sparkles size={28} color={t.text3} style={{ marginBottom:14 }}/>
          <div style={{ fontSize:14, fontWeight:600, color:t.text2, fontFamily:"var(--font-display)", marginBottom:8 }}>No summary yet</div>
          <div style={{ fontSize:13, color:t.text3, fontFamily:"var(--font-mono)" }}>Click "Generate Summary" to get personalized spending insights</div>
        </div>
      )}
    </div>
  );
}

// ─── Add Subscription View ────────────────────────────────────────────────────
function AddView({ t, onSuccess }: { t:T; onSuccess:()=>void }) {
  const blank = { name:"", category:"", amount:"", cycle:"Monthly", startDate:"", provider:"", autoRenew:true, currency:"USD", notes:"" };
  const [form,      setForm]    = useState(blank);
  const [loading,   setLoading] = useState(false);
  const [aiLoading, setAiLoad]  = useState(false);
  const f = (k: keyof typeof form) => (v: string | boolean) => setForm(p => ({ ...p, [k]:v }));

  const aiAutofill = async () => {
    if (!form.name) return;
    setAiLoad(true);
    // TODO PROMPT 3: real Groq call
    await new Promise(r => setTimeout(r, 1100));
    const mock: Record<string,Partial<typeof form>> = {
      netflix: { category:"Streaming",   amount:"15.99", provider:"Netflix Inc."   },
      spotify: { category:"Music",       amount:"9.99",  provider:"Spotify AB"     },
      notion:  { category:"Productivity",amount:"16.00", provider:"Notion Labs"    },
      github:  { category:"Development", amount:"4.00",  provider:"Microsoft"      },
      figma:   { category:"Design",      amount:"15.00", provider:"Figma Inc."     },
      aws:     { category:"Cloud",       amount:"43.20", provider:"Amazon"         },
    };
    const fill = mock[form.name.toLowerCase()] || { category:"SaaS", amount:"9.99", provider:form.name };
    setForm(p => ({ ...p, ...fill }));
    setAiLoad(false);
  };

  const submit = async () => {
    if (!form.name || !form.amount) return;
    setLoading(true);
    // TODO PROMPT 3:
    // const { error } = await supabase.from('subscriptions').insert({
    //   user_id: user.id, name: form.name, amount: parseFloat(form.amount),
    //   billing_cycle: form.cycle, category: form.category || null,
    //   provider: form.provider || null, start_date: form.startDate || null,
    //   currency: form.currency, auto_renew: form.autoRenew, status: 'active', notes: form.notes,
    // });
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    onSuccess();
  };

  const iStyle: React.CSSProperties = { width:"100%", background:t.surface2, border:`1px solid ${t.border}`, borderRadius:8, padding:"10px 13px", fontSize:13, color:t.text, fontFamily:"var(--font-mono)", outline:"none", transition:"border-color 0.2s" };
  const lStyle: React.CSSProperties = { fontSize:10.5, color:t.text3, fontFamily:"var(--font-mono)", letterSpacing:"0.08em", display:"block", marginBottom:5 };

  const preview = { name:form.name||"Subscription Name", amount:form.amount?`${form.currency} ${parseFloat(form.amount).toFixed(2)}`:`${form.currency} 0.00`, cycle:form.cycle, category:form.category||"—", start:form.startDate||new Date().toLocaleDateString("en-US",{ month:"short", day:"numeric", year:"numeric" }), autoRenew:form.autoRenew?"Yes":"No" };

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:22, alignItems:"start" }}>
      {/* Form */}
      <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:"28px" }}>
        <h2 style={{ fontFamily:"var(--font-display)", fontSize:20, fontWeight:800, color:t.text, letterSpacing:-0.5, marginBottom:5 }}>Add Subscription</h2>
        <p style={{ fontSize:12, color:t.text3, fontFamily:"var(--font-mono)", marginBottom:26 }}>Track your recurring payments with AI-powered insights</p>

        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          {/* Name + AI */}
          <div>
            <label style={lStyle}>Subscription Name *</label>
            <div style={{ display:"flex", gap:8 }}>
              <input value={form.name} onChange={e=>f("name")(e.target.value)} placeholder="e.g. Netflix" style={{ ...iStyle, flex:1 }}
                onFocus={e=>(e.target as HTMLInputElement).style.borderColor=t.greenBorder}
                onBlur={e=>(e.target as HTMLInputElement).style.borderColor=t.border} />
              <button onClick={aiAutofill} disabled={!form.name||aiLoading} style={{ background:t.greenDim, border:`1px solid ${t.greenBorder}`, borderRadius:8, padding:"0 14px", cursor:form.name&&!aiLoading?"pointer":"not-allowed", color:t.green, opacity:!form.name?0.5:1, flexShrink:0, display:"flex", alignItems:"center", gap:6, fontSize:12, fontFamily:"var(--font-mono)", fontWeight:600 }}>
                {aiLoading ? <RefreshCw size={13} style={{ animation:"spin 1s linear infinite" }}/> : <Sparkles size={13}/>} AI Fill
              </button>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div>
              <label style={lStyle}>Amount *</label>
              <div style={{ display:"flex", gap:6 }}>
                <select value={form.currency} onChange={e=>f("currency")(e.target.value)} style={{ background:t.surface2, border:`1px solid ${t.border}`, borderRadius:8, padding:"10px 8px", fontSize:12, color:t.text, fontFamily:"var(--font-mono)", cursor:"pointer", outline:"none", flexShrink:0 }}>
                  {["USD","EUR","GBP","PKR","CAD","AUD"].map(c=><option key={c}>{c}</option>)}
                </select>
                <input value={form.amount} onChange={e=>f("amount")(e.target.value)} type="number" step="0.01" min="0" placeholder="0.00" style={{ ...iStyle }}
                  onFocus={e=>(e.target as HTMLInputElement).style.borderColor=t.greenBorder}
                  onBlur={e=>(e.target as HTMLInputElement).style.borderColor=t.border} />
              </div>
            </div>
            <div>
              <label style={lStyle}>Billing Cycle</label>
              <select value={form.cycle} onChange={e=>f("cycle")(e.target.value)} style={{ ...iStyle, cursor:"pointer" }}>
                {["Daily","Weekly","Monthly","Quarterly","Annually"].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div>
              <label style={lStyle}>Category</label>
              <select value={form.category} onChange={e=>f("category")(e.target.value)} style={{ ...iStyle, cursor:"pointer" }}>
                <option value="">Select category</option>
                {["Streaming","Productivity","Cloud","Design","Development","Music","Finance","Education","Lifestyle","Other"].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={lStyle}>Start Date</label>
              <input value={form.startDate} onChange={e=>f("startDate")(e.target.value)} type="date" style={{ ...iStyle }}
                onFocus={e=>(e.target as HTMLInputElement).style.borderColor=t.greenBorder}
                onBlur={e=>(e.target as HTMLInputElement).style.borderColor=t.border} />
            </div>
          </div>

          <div>
            <label style={lStyle}>Provider</label>
            <input value={form.provider} onChange={e=>f("provider")(e.target.value)} placeholder="e.g. Netflix Inc." style={{ ...iStyle }}
              onFocus={e=>(e.target as HTMLInputElement).style.borderColor=t.greenBorder}
              onBlur={e=>(e.target as HTMLInputElement).style.borderColor=t.border} />
          </div>

          <div>
            <label style={lStyle}>Notes (optional)</label>
            <textarea value={form.notes} onChange={e=>f("notes")(e.target.value)} rows={2} placeholder="Optional notes…" style={{ ...iStyle, resize:"vertical" }}
              onFocus={e=>(e.target as HTMLTextAreaElement).style.borderColor=t.greenBorder}
              onBlur={e=>(e.target as HTMLTextAreaElement).style.borderColor=t.border} />
          </div>

          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:t.surface2, border:`1px solid ${t.border}`, borderRadius:8, padding:"13px 15px" }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:t.text, fontFamily:"var(--font-display)" }}>Auto Renew</div>
              <div style={{ fontSize:11, color:t.text3, fontFamily:"var(--font-mono)", marginTop:1 }}>Automatically renews each billing cycle</div>
            </div>
            <button onClick={()=>f("autoRenew")(!form.autoRenew)} style={{ background:"none", border:"none", cursor:"pointer", color:form.autoRenew?t.green:t.text3 }}>
              {form.autoRenew ? <ToggleRight size={27}/> : <ToggleLeft size={27}/>}
            </button>
          </div>

          <button onClick={submit} disabled={!form.name||!form.amount||loading} style={{ background:t.green, color:"#000", border:"none", borderRadius:9, padding:"13px", fontSize:14, fontWeight:700, fontFamily:"var(--font-display)", cursor:(!form.name||!form.amount||loading)?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, opacity:(!form.name||!form.amount)?0.6:1, transition:"background 0.2s" }}>
            {loading ? <><RefreshCw size={14} style={{ animation:"spin 1s linear infinite" }}/> Adding…</> : <><Plus size={14}/> Add Subscription</>}
          </button>
        </div>
      </div>

      {/* Preview */}
      <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:"22px", position:"sticky", top:24 }}>
        <div style={{ fontSize:13, fontWeight:700, color:t.text, fontFamily:"var(--font-display)", marginBottom:16 }}>Preview</div>
        <div style={{ background:t.surface2, border:`1px solid ${t.border}`, borderRadius:10, padding:"16px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:t.greenDim, border:`1px solid ${t.greenBorder}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <CreditCard size={16} color={t.green} strokeWidth={1.5}/>
            </div>
            <div>
              <div style={{ fontFamily:"var(--font-display)", fontSize:14, fontWeight:700, color:t.text }}>{preview.name}</div>
              <div style={{ fontSize:11, color:t.text3, fontFamily:"var(--font-mono)", marginTop:1 }}>{form.provider||"Provider"}</div>
            </div>
          </div>
          {[["Amount",preview.amount],["Billing Cycle",preview.cycle],["Category",preview.category],["Start Date",preview.start],["Auto Renew",preview.autoRenew]].map(([k,v]) => (
            <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:`1px solid ${t.border}` }}>
              <span style={{ fontSize:12, color:t.text3, fontFamily:"var(--font-mono)" }}>{k}</span>
              <span style={{ fontSize:12, fontWeight:600, color:t.text, fontFamily:"var(--font-mono)" }}>{v}</span>
            </div>
          ))}
          <div style={{ display:"flex", justifyContent:"space-between", padding:"9px 0" }}>
            <span style={{ fontSize:12, color:t.text3, fontFamily:"var(--font-mono)" }}>Status</span>
            <span style={{ fontSize:10, color:t.green, background:t.greenDim, border:`1px solid ${t.greenBorder}`, borderRadius:4, padding:"3px 8px", fontFamily:"var(--font-mono)" }}>Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Export View ──────────────────────────────────────────────────────────────
function ExportView({ t, subs, toast }: { t:T; subs:Sub[]; toast:(m:string,tp:"success"|"error"|"info")=>void }) {
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(subs, null, 2)], { type:"application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href=url; a.download="subsight-subscriptions.json"; a.click();
    // TODO PROMPT 3: await supabase.from('export_logs').insert({ user_id: user.id, format:'json', row_count: subs.length });
    toast("Exported as JSON", "success");
  };
  const exportCSV = () => {
    const headers = ["Name","Category","Amount","Currency","Cycle","NextDate","Status","AutoRenew","Provider"];
    const rows    = subs.map(s=>[s.name,s.category,s.amount,s.currency,s.cycle,s.nextDate,s.status,s.autoRenew,s.provider].join(","));
    const blob    = new Blob([[headers.join(","),...rows].join("\n")], { type:"text/csv" });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement("a"); a.href=url; a.download="subsight-subscriptions.csv"; a.click();
    // TODO PROMPT 3: await supabase.from('export_logs').insert({ user_id: user.id, format:'csv', row_count: subs.length });
    toast("Exported as CSV", "success");
  };
  const exportPDF = () => {
    // TODO PROMPT 3: implement jsPDF or server-side PDF
    window.print();
    toast("PDF export triggered — check print dialog", "info");
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div>
        <h2 style={{ fontFamily:"var(--font-display)", fontSize:22, fontWeight:800, color:t.text, letterSpacing:-0.5 }}>Export Data</h2>
        <p style={{ fontSize:11.5, color:t.text3, fontFamily:"var(--font-mono)", marginTop:3 }}>Download your subscription data in multiple formats</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:16 }}>
        {[
          { title:"JSON Export", desc:"Full data with all fields and metadata. Ideal for backup or migrating to another tool.", Icon:FileText, action:exportJSON, shortcut:"Ctrl+E" },
          { title:"CSV Export",  desc:"Spreadsheet-compatible. Open directly in Excel, Google Sheets, or Numbers.",            Icon:BarChart3, action:exportCSV, shortcut:"Ctrl+S" },
          { title:"PDF Export",  desc:"Print-ready document with a clean summary of all your subscriptions.",                  Icon:Download,  action:exportPDF, shortcut:"Ctrl+P" },
        ].map(opt => (
          <div key={opt.title} style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:"24px 22px", display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ width:44, height:44, borderRadius:10, background:t.greenDim, border:`1px solid ${t.greenBorder}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <opt.Icon size={18} color={t.green} strokeWidth={1.5}/>
              </div>
              <span style={{ fontSize:10, color:t.text3, background:t.surface2, border:`1px solid ${t.border}`, borderRadius:5, padding:"3px 8px", fontFamily:"var(--font-mono)" }}>{opt.shortcut}</span>
            </div>
            <div>
              <div style={{ fontFamily:"var(--font-display)", fontSize:15, fontWeight:700, color:t.text, marginBottom:7 }}>{opt.title}</div>
              <div style={{ fontSize:12.5, color:t.text2, fontFamily:"var(--font-mono)", lineHeight:1.65 }}>{opt.desc}</div>
            </div>
            <button onClick={opt.action} style={{ background:t.green, color:"#000", border:"none", borderRadius:8, padding:"11px", fontSize:13, fontWeight:700, fontFamily:"var(--font-display)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, transition:"background 0.2s" }}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=t.green2}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=t.green}>
              <Download size={13}/> {opt.title.split(" ")[0]}
            </button>
          </div>
        ))}
      </div>

      {/* Keyboard shortcuts */}
      <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:"22px" }}>
        <div style={{ fontSize:13, fontWeight:700, color:t.text, fontFamily:"var(--font-display)", marginBottom:16 }}>Keyboard Shortcuts</div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {[["Ctrl + E","Export JSON"],["Ctrl + S","Export CSV"],["Ctrl + P","Export PDF"],["Ctrl + A","Add New Subscription"]].map(([k,v]) => (
            <div key={k} style={{ display:"flex", alignItems:"center", gap:14 }}>
              <kbd style={{ background:t.surface2, border:`1px solid ${t.border2}`, borderRadius:5, padding:"4px 10px", fontSize:11, color:t.text, fontFamily:"var(--font-mono)", whiteSpace:"nowrap" }}>{k}</kbd>
              <span style={{ fontSize:12, color:t.text2, fontFamily:"var(--font-mono)" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Settings View ────────────────────────────────────────────────────────────
function SettingsView({ t, toast }: { t:T; toast:(m:string,tp:"success"|"error"|"info")=>void }) {
  const [currency, setCurrency] = useState("USD");
  const [goalPeriod, setGoalPeriod] = useState("Monthly");
  const [goalAmt,   setGoalAmt]   = useState("");
  const [goalCur,   setGoalCur]   = useState("USD");
  const [catInput,  setCatInput]  = useState("");
  const [cats,      setCats]      = useState(["Streaming","Development","Design","Cloud","Music"]);
  const [notifs,    setNotifs]    = useState({ renewal:true, weekly:true, budget:true });
  const [saving,    setSaving]    = useState(false);

  const addCat = () => { if (catInput.trim() && !cats.includes(catInput.trim())) { setCats(p=>[...p,catInput.trim()]); setCatInput(""); } };
  const removeCat = (c:string) => setCats(p=>p.filter(x=>x!==c));

  const save = async () => {
    setSaving(true);
    // TODO PROMPT 3: upsert to profiles (currency), spending_goals, notification_settings
    await new Promise(r=>setTimeout(r,700));
    setSaving(false);
    toast("Settings saved", "success");
  };

  const sel: React.CSSProperties = { background:t.surface2, border:`1px solid ${t.border}`, borderRadius:8, padding:"10px 13px", fontSize:13, color:t.text, fontFamily:"var(--font-mono)", cursor:"pointer", outline:"none" };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18, maxWidth:680 }}>
      <div>
        <h2 style={{ fontFamily:"var(--font-display)", fontSize:22, fontWeight:800, color:t.text, letterSpacing:-0.5 }}>Settings</h2>
        <p style={{ fontSize:11.5, color:t.text3, fontFamily:"var(--font-mono)", marginTop:3 }}>Manage spending goals, categories, and preferences</p>
      </div>

      {/* Currency */}
      <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:"22px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}><Globe size={14} color={t.green}/><span style={{ fontSize:14, fontWeight:700, color:t.text, fontFamily:"var(--font-display)" }}>Display Currency</span></div>
        <p style={{ fontSize:12, color:t.text3, fontFamily:"var(--font-mono)", marginBottom:16 }}>Choose your preferred currency for display across the app</p>
        <select value={currency} onChange={e=>setCurrency(e.target.value)} style={{ ...sel, minWidth:160 }}>
          {["USD","EUR","GBP","PKR","CAD","AUD","JPY","CHF"].map(c=><option key={c}>$ {c}</option>)}
        </select>
      </div>

      {/* Spending Goals */}
      <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:"22px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}><Target size={14} color={t.green}/><span style={{ fontSize:14, fontWeight:700, color:t.text, fontFamily:"var(--font-display)" }}>Spending Goals</span></div>
        <p style={{ fontSize:12, color:t.text3, fontFamily:"var(--font-mono)", marginBottom:16 }}>Set monthly or annual spending limits to stay on budget</p>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <select value={goalPeriod} onChange={e=>setGoalPeriod(e.target.value)} style={sel}><option>Monthly</option><option>Annual</option></select>
          <input value={goalAmt} onChange={e=>setGoalAmt(e.target.value)} placeholder="Amount" type="number" style={{ ...sel, flex:1, minWidth:100 }}/>
          <select value={goalCur} onChange={e=>setGoalCur(e.target.value)} style={sel}>{["USD","EUR","GBP","PKR"].map(c=><option key={c}>{c}</option>)}</select>
          <button style={{ background:t.green, color:"#000", border:"none", borderRadius:8, padding:"10px 16px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"var(--font-display)", display:"flex", alignItems:"center", gap:6 }}><Plus size={13}/> Add</button>
        </div>
      </div>

      {/* Custom Categories */}
      <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:"22px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}><Tag size={14} color={t.green}/><span style={{ fontSize:14, fontWeight:700, color:t.text, fontFamily:"var(--font-display)" }}>Custom Categories</span></div>
        <p style={{ fontSize:12, color:t.text3, fontFamily:"var(--font-mono)", marginBottom:16 }}>Create your own subscription categories</p>
        <div style={{ display:"flex", gap:10, marginBottom:14 }}>
          <input value={catInput} onChange={e=>setCatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCat()} placeholder="Category name" style={{ ...sel, flex:1 }}/>
          <button onClick={addCat} style={{ background:t.green, color:"#000", border:"none", borderRadius:8, padding:"10px 16px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"var(--font-display)", display:"flex", alignItems:"center", gap:6 }}><Plus size={13}/> Add</button>
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {cats.map(c => (
            <div key={c} style={{ display:"flex", alignItems:"center", gap:6, background:t.surface2, border:`1px solid ${t.border}`, borderRadius:6, padding:"5px 11px" }}>
              <span style={{ fontSize:12, color:t.text2, fontFamily:"var(--font-mono)" }}>{c}</span>
              <button onClick={()=>removeCat(c)} style={{ background:"none", border:"none", cursor:"pointer", color:t.text3, padding:1, display:"flex" }}><X size={11}/></button>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:"22px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}><Bell size={14} color={t.green}/><span style={{ fontSize:14, fontWeight:700, color:t.text, fontFamily:"var(--font-display)" }}>Notifications</span></div>
        <p style={{ fontSize:12, color:t.text3, fontFamily:"var(--font-mono)", marginBottom:16 }}>Control when and how you get notified</p>
        {[
          { key:"renewal" as const, label:"Renewal Alerts",  desc:"Get notified 3 days before a subscription renews" },
          { key:"weekly"  as const, label:"Weekly Summary",  desc:"Weekly email digest of your spending activity" },
          { key:"budget"  as const, label:"Budget Warnings", desc:"Alert when approaching your spending goal" },
        ].map(item => (
          <div key={item.key} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 0", borderBottom:`1px solid ${t.border}` }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:t.text, fontFamily:"var(--font-display)" }}>{item.label}</div>
              <div style={{ fontSize:11, color:t.text3, fontFamily:"var(--font-mono)", marginTop:2 }}>{item.desc}</div>
            </div>
            <button onClick={()=>setNotifs(p=>({ ...p, [item.key]:!p[item.key] }))} style={{ background:"none", border:"none", cursor:"pointer", color:notifs[item.key]?t.green:t.text3, flexShrink:0 }}>
              {notifs[item.key] ? <ToggleRight size={27}/> : <ToggleLeft size={27}/>}
            </button>
          </div>
        ))}
      </div>

      <button onClick={save} disabled={saving} style={{ background:t.green, color:"#000", border:"none", borderRadius:9, padding:"13px", fontSize:14, fontWeight:700, fontFamily:"var(--font-display)", cursor:saving?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, opacity:saving?0.75:1 }}>
        {saving ? <><RefreshCw size={14} style={{ animation:"spin 1s linear infinite" }}/> Saving…</> : <><Save size={14}/> Save Settings</>}
      </button>
    </div>
  );
}

// ─── Profile View ─────────────────────────────────────────────────────────────
function ProfileView({ t, toast }: { t:T; toast:(m:string,tp:"success"|"error"|"info")=>void }) {
  const [form,   setForm]   = useState({ name:"User", email:"muhammadtanveerabbas.dev@gmail.com", avatar:"" });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    // TODO PROMPT 3: await supabase.from('profiles').update({ full_name: form.name, avatar_url: form.avatar }).eq('id', user.id);
    await new Promise(r=>setTimeout(r,700));
    setSaving(false);
    toast("Profile updated","success");
  };

  const signOut = async () => {
    // TODO PROMPT 3: await supabase.auth.signOut(); router.push('/');
    toast("Signing out…","info");
  };

  const iStyle: React.CSSProperties = { width:"100%", background:t.surface2, border:`1px solid ${t.border}`, borderRadius:8, padding:"11px 13px", fontSize:13, color:t.text, fontFamily:"var(--font-mono)", outline:"none", transition:"border-color 0.2s" };
  const lStyle: React.CSSProperties = { fontSize:10.5, color:t.text3, fontFamily:"var(--font-mono)", letterSpacing:"0.08em", display:"block", marginBottom:5 };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18, maxWidth:640 }}>
      <div>
        <h2 style={{ fontFamily:"var(--font-display)", fontSize:22, fontWeight:800, color:t.text, letterSpacing:-0.5 }}>Profile</h2>
        <p style={{ fontSize:11.5, color:t.text3, fontFamily:"var(--font-mono)", marginTop:3 }}>Manage your account information</p>
      </div>

      {/* Profile info */}
      <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:"26px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}><User size={14} color={t.green}/><span style={{ fontSize:14, fontWeight:700, color:t.text, fontFamily:"var(--font-display)" }}>Profile Settings</span></div>
        <p style={{ fontSize:12, color:t.text3, fontFamily:"var(--font-mono)", marginBottom:22 }}>Update your profile information</p>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:24 }}>
          <div style={{ width:56, height:56, borderRadius:13, background:t.greenDim, border:`1px solid ${t.greenBorder}`, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", flexShrink:0 }}>
            {form.avatar ? <img src={form.avatar} alt="avatar" style={{ width:56, height:56, objectFit:"cover" }}/> : <User size={22} color={t.green}/>}
          </div>
          <div>
            <div style={{ fontFamily:"var(--font-display)", fontSize:16, fontWeight:700, color:t.text }}>{form.name}</div>
            <div style={{ fontSize:12, color:t.text3, fontFamily:"var(--font-mono)", marginTop:2 }}>{form.email}</div>
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div>
            <label style={lStyle}>Full Name</label>
            <input value={form.name} onChange={e=>setForm(p=>({ ...p,name:e.target.value }))} placeholder="Enter your full name" style={iStyle}
              onFocus={e=>(e.target as HTMLInputElement).style.borderColor=t.greenBorder}
              onBlur={e=>(e.target as HTMLInputElement).style.borderColor=t.border}/>
          </div>
          <div>
            <label style={lStyle}>Avatar URL (optional)</label>
            <input value={form.avatar} onChange={e=>setForm(p=>({ ...p,avatar:e.target.value }))} placeholder="https://example.com/avatar.jpg" style={iStyle}
              onFocus={e=>(e.target as HTMLInputElement).style.borderColor=t.greenBorder}
              onBlur={e=>(e.target as HTMLInputElement).style.borderColor=t.border}/>
            <p style={{ fontSize:10, color:t.text3, fontFamily:"var(--font-mono)", marginTop:5 }}>Provide a URL to your profile picture</p>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={save} disabled={saving} style={{ background:t.green, color:"#000", border:"none", borderRadius:8, padding:"12px 22px", fontSize:13, fontWeight:700, fontFamily:"var(--font-display)", cursor:saving?"not-allowed":"pointer", display:"flex", alignItems:"center", gap:7 }}>
              {saving ? <><RefreshCw size={13} style={{ animation:"spin 1s linear infinite" }}/> Saving…</> : <><Save size={13}/> Save Changes</>}
            </button>
            <button onClick={()=>setForm({ name:"User", email:"muhammadtanveerabbas.dev@gmail.com", avatar:"" })} style={{ background:"transparent", color:t.text2, border:`1px solid ${t.border2}`, borderRadius:8, padding:"12px 20px", fontSize:13, fontFamily:"var(--font-display)", cursor:"pointer" }}>Reset</button>
          </div>
        </div>
      </div>

      {/* Plan */}
      <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:"22px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}><Zap size={14} color={t.green}/><span style={{ fontSize:14, fontWeight:700, color:t.text, fontFamily:"var(--font-display)" }}>Subscription Plan</span></div>
        <div style={{ background:t.surface2, border:`1px solid ${t.border}`, borderRadius:10, padding:"14px 16px", display:"flex", alignItems:"center", gap:10 }}>
          <Zap size={13} color={t.green}/>
          <span style={{ fontSize:13, fontWeight:600, color:t.text, fontFamily:"var(--font-display)" }}>Pro Plan</span>
          <span style={{ fontSize:10, color:t.green, background:t.greenDim, border:`1px solid ${t.greenBorder}`, borderRadius:4, padding:"2px 8px", fontFamily:"var(--font-mono)", marginLeft:"auto" }}>Active</span>
        </div>
        <p style={{ fontSize:12, color:t.text3, fontFamily:"var(--font-mono)", marginTop:10 }}>You have access to all Pro features including AI summaries and advanced analytics.</p>
      </div>

      {/* Security */}
      <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:"22px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}><Shield size={14} color={t.green}/><span style={{ fontSize:14, fontWeight:700, color:t.text, fontFamily:"var(--font-display)" }}>Privacy & Security</span></div>
        {[
          { Icon:Lock,    label:"End to End Encrypted",      desc:"Your data is encrypted in transit and at rest" },
          { Icon:Shield,  label:"No Third Party Sharing",    desc:"We never sell or share your data" },
          { Icon:Globe,   label:"Supabase Powered",          desc:"Enterprise grade security with PostgreSQL" },
          { Icon:Bell,    label:"Smart Reminders",           desc:"Never miss a subscription renewal again" },
          { Icon:Sparkles,label:"AI Powered Insights",       desc:"Real-time analysis powered by Groq with accurate data" },
        ].map(item => (
          <div key={item.label} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"11px 0", borderBottom:`1px solid ${t.border}` }}>
            <div style={{ width:28, height:28, borderRadius:7, background:t.greenDim, border:`1px solid ${t.greenBorder}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
              <item.Icon size={12} color={t.green} strokeWidth={1.5}/>
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:t.text, fontFamily:"var(--font-display)" }}>{item.label}</div>
              <div style={{ fontSize:11, color:t.text3, fontFamily:"var(--font-mono)", marginTop:2 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Sign out */}
      <button onClick={signOut} style={{ background:t.redDim, color:t.red, border:`1px solid ${t.red}33`, borderRadius:9, padding:"13px", fontSize:13, fontWeight:600, fontFamily:"var(--font-display)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"background 0.2s" }}
        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=`${t.red}22`}
        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=t.redDim}>
        <LogOut size={13}/> Sign Out
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD SHELL
// ═══════════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const [themeKey,     setThemeKey]     = useState<TK>("dark");
  const [active,       setActive]       = useState("overview");
  const [collapsed,    setCollapsed]    = useState(false);
  const [mobileSB,     setMobileSB]     = useState(false);
  const [subs,         setSubs]         = useState<Sub[]>(MOCK_SUBS);
  const [toast,        setToast]        = useState<{ msg:string; type:"success"|"error"|"info" }|null>(null);
  const t = themeKey === "dark" ? DARK : LIGHT;

  // Theme init
  useEffect(() => {
    const stored = (localStorage.getItem("subsight-theme") || "dark") as TK;
    setThemeKey(stored);
  }, []);

  // Persist theme
  useEffect(() => {
    localStorage.setItem("subsight-theme", themeKey);
    document.documentElement.setAttribute("data-theme", themeKey);
  }, [themeKey]);

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key==="e") { e.preventDefault(); setActive("export"); }
        if (e.key==="s") { e.preventDefault(); setActive("export"); }
        if (e.key==="a") { e.preventDefault(); setActive("add"); }
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const showToast = useCallback((msg:string, type:"success"|"error"|"info"="success") => {
    setToast({ msg, type });
  }, []);

  const navTo = useCallback((id:string) => {
    setActive(id);
    setMobileSB(false);
  }, []);

  const SBW = collapsed ? 62 : 226;

  const SidebarLink = ({ id, label, Icon }: { id:string; label:string; Icon:React.ElementType }) => {
    const isActive = active===id;
    return (
      <button onClick={()=>navTo(id)} title={collapsed?label:undefined} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:collapsed?"11px 0 11px 18px":"9px 14px", background:isActive?t.greenDim:"transparent", borderLeft:isActive?`3px solid ${t.green}`:"3px solid transparent", border:"none", cursor:"pointer", color:isActive?t.green:t.text2, transition:"all 0.15s" }}>
        <Icon size={17} strokeWidth={isActive?2:1.5} style={{ flexShrink:0 }}/>
        {!collapsed && <span style={{ fontSize:13, fontWeight:isActive?600:400, whiteSpace:"nowrap", fontFamily:"var(--font-display)" }}>{label}</span>}
      </button>
    );
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:t.bg, color:t.text, fontFamily:"var(--font-display)", transition:"background 0.4s, color 0.4s" }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--font-display:'Plus Jakarta Sans',system-ui,sans-serif;--font-mono:'DM Mono','Courier New',monospace}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        a{color:inherit;text-decoration:none}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${t.border2};border-radius:3px}
        *{scrollbar-width:thin;scrollbar-color:${t.border2} transparent}
        input,select,textarea{color-scheme:${themeKey}}
        .sidebar-desk{display:flex!important}
        .mob-sb-btn{display:none!important}
        @media(max-width:768px){
          .sidebar-desk{display:none!important}
          .mob-sb-btn{display:flex!important}
          .main-pad{padding:14px!important}
          .add-grid{grid-template-columns:1fr!important}
        }
        @media(max-width:640px){
          .kpi-grid{grid-template-columns:1fr 1fr!important}
          .chart-2col{grid-template-columns:1fr!important}
          .ana-2col{grid-template-columns:1fr!important}
        }
        @media(max-width:440px){
          .kpi-grid{grid-template-columns:1fr!important}
        }
      `}</style>

      {/* ── SIDEBAR ── */}
      <aside className="sidebar-desk" style={{ width:SBW, minHeight:"100vh", background:t.sidebarBg, borderRight:`1px solid ${t.border}`, flexDirection:"column", position:"fixed", left:0, top:0, bottom:0, zIndex:50, transition:"width 0.25s cubic-bezier(0.4,0,0.2,1)", overflow:"hidden", flexShrink:0, display:"flex" }}>
        {/* Logo */}
        <div style={{ height:62, display:"flex", alignItems:"center", padding:collapsed?"0 0 0 16px":"0 18px", gap:9, borderBottom:`1px solid ${t.border}`, flexShrink:0 }}>
          <div style={{ width:28, height:28, background:t.green, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><PieChart size={14} color="#000" strokeWidth={2.5}/></div>
          {!collapsed && <span style={{ fontFamily:"var(--font-display)", fontSize:17, fontWeight:800, color:t.text, letterSpacing:-0.5, whiteSpace:"nowrap" }}>Subsight</span>}
        </div>

        {/* Main nav */}
        <nav style={{ flex:1, padding:"10px 0", overflowY:"auto" }}>
          {NAV_MAIN.map(item => <SidebarLink key={item.id} {...item}/>)}
        </nav>

        {/* Bottom nav */}
        <div style={{ padding:"10px 0", borderTop:`1px solid ${t.border}`, flexShrink:0 }}>
          {NAV_BOTTOM.map(item => <SidebarLink key={item.id} {...item}/>)}
        </div>

        {/* Collapse button */}
        <button onClick={()=>setCollapsed(!collapsed)} style={{ display:"flex", alignItems:"center", justifyContent:collapsed?"center":"flex-end", padding:"11px 14px", background:"none", border:"none", borderTop:`1px solid ${t.border}`, cursor:"pointer", color:t.text3, transition:"color 0.2s", flexShrink:0 }}
          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color=t.text}
          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color=t.text3}>
          {collapsed ? <ChevronRight size={15}/> : <ChevronLeft size={15}/>}
        </button>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileSB && (
        <div style={{ position:"fixed", inset:0, zIndex:200 }}>
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.6)" }} onClick={()=>setMobileSB(false)}/>
          <aside style={{ position:"absolute", left:0, top:0, bottom:0, width:236, background:t.sidebarBg, borderRight:`1px solid ${t.border}`, display:"flex", flexDirection:"column", zIndex:201 }}>
            <div style={{ height:62, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 18px", borderBottom:`1px solid ${t.border}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                <div style={{ width:26, height:26, background:t.green, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center" }}><PieChart size={13} color="#000" strokeWidth={2.5}/></div>
                <span style={{ fontFamily:"var(--font-display)", fontSize:16, fontWeight:800, color:t.text }}>Subsight</span>
              </div>
              <button onClick={()=>setMobileSB(false)} style={{ background:"none", border:"none", color:t.text3, cursor:"pointer" }}><X size={18}/></button>
            </div>
            <nav style={{ flex:1, padding:"10px 0", overflowY:"auto" }}>
              {[...NAV_MAIN,...NAV_BOTTOM].map(item => (
                <button key={item.id} onClick={()=>navTo(item.id)} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 16px", background:active===item.id?t.greenDim:"transparent", borderLeft:active===item.id?`3px solid ${t.green}`:"3px solid transparent", border:"none", cursor:"pointer", color:active===item.id?t.green:t.text2, transition:"all 0.15s" }}>
                  <item.Icon size={16} strokeWidth={1.5} style={{ flexShrink:0 }}/>
                  <span style={{ fontSize:13, fontWeight:active===item.id?600:400, fontFamily:"var(--font-display)" }}>{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* ── MAIN ── */}
      <div style={{ flex:1, marginLeft:SBW, display:"flex", flexDirection:"column", minHeight:"100vh", transition:"margin-left 0.25s cubic-bezier(0.4,0,0.2,1)" }}>
        {/* Topbar */}
        <header style={{ height:62, background:t.navBg, borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 22px", position:"sticky", top:0, zIndex:40, backdropFilter:"blur(14px)", WebkitBackdropFilter:"blur(14px)", gap:14, flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button className="mob-sb-btn" onClick={()=>setMobileSB(true)} style={{ background:"none", border:"none", color:t.text2, cursor:"pointer", padding:3, display:"none" }}><Menu size={19}/></button>
            <div style={{ position:"relative" }}>
              <Search size={13} color={t.text3} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
              <input placeholder="Search subscriptions…" style={{ background:t.surface2, border:`1px solid ${t.border}`, borderRadius:9, padding:"8px 12px 8px 32px", fontSize:12.5, color:t.text, fontFamily:"var(--font-mono)", outline:"none", width:"clamp(150px,20vw,260px)", transition:"border-color 0.2s" }}
                onFocus={e=>(e.target as HTMLInputElement).style.borderColor=t.greenBorder}
                onBlur={e=>(e.target as HTMLInputElement).style.borderColor=t.border}/>
            </div>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            {/* Theme toggle */}
            <button onClick={()=>setThemeKey(p=>p==="dark"?"light":"dark")} aria-label="Toggle theme"
              style={{ width:33, height:33, border:`1px solid ${t.border2}`, borderRadius:8, background:t.surface2, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.2s" }}>
              {themeKey==="dark" ? <Sun size={14} color={t.text2}/> : <Moon size={14} color={t.text2}/>}
            </button>

            {/* Notifications bell */}
            <button style={{ position:"relative", width:33, height:33, border:`1px solid ${t.border2}`, borderRadius:8, background:t.surface2, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <Bell size={14} color={t.text2}/>
              <span style={{ position:"absolute", top:6, right:6, width:7, height:7, borderRadius:"50%", background:t.red, border:`2px solid ${t.surface2}` }}/>
            </button>

            {/* Add button */}
            <button onClick={()=>navTo("add")} style={{ background:t.green, color:"#000", border:"none", borderRadius:8, padding:"8px 15px", fontSize:12, fontWeight:700, fontFamily:"var(--font-display)", cursor:"pointer", display:"flex", alignItems:"center", gap:5, whiteSpace:"nowrap" }}>
              <Plus size={12}/> Add
            </button>

            {/* Avatar */}
            <button onClick={()=>navTo("profile")} style={{ width:33, height:33, borderRadius:8, background:t.greenDim, border:`1px solid ${t.greenBorder}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <User size={14} color={t.green}/>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="main-pad" style={{ flex:1, padding:"22px", overflowY:"auto" }}>
          {/* Breadcrumb */}
          <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:18, fontSize:11, color:t.text3, fontFamily:"var(--font-mono)" }}>
            <span>Dashboard</span>
            <ChevronRight size={11}/>
            <span style={{ color:t.text }}>{[...NAV_MAIN,...NAV_BOTTOM].find(n=>n.id===active)?.label||"Overview"}</span>
          </div>

          {/* Route views */}
          {active==="overview"      && <OverviewView   t={t} subs={subs} onNav={navTo}/>}
          {active==="subscriptions" && <SubsView       t={t} subs={subs} setSubs={setSubs} onAdd={()=>navTo("add")} toast={showToast}/>}
          {active==="analytics"     && <AnalyticsView  t={t}/>}
          {active==="ai-summary"    && <AISummaryView  t={t} subs={subs}/>}
          {active==="add"           && <AddView        t={t} onSuccess={()=>{ navTo("subscriptions"); showToast("Subscription added!","success"); }}/>}
          {active==="export"        && <ExportView     t={t} subs={subs} toast={showToast}/>}
          {active==="settings"      && <SettingsView   t={t} toast={showToast}/>}
          {active==="profile"       && <ProfileView    t={t} toast={showToast}/>}
        </main>
      </div>

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)} t={t}/>}
    </div>
  );
}
