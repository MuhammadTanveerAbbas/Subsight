"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Bell, Search, Sun, Moon, Menu, X,
  ChevronRight, ChevronLeft, ChevronDown, Trash2, Edit3,
  Check, AlertTriangle, TrendingUp, TrendingDown, RefreshCw,
  Copy, FileText, LogOut, ArrowRight, Zap, Globe,
  Lock, Shield, Target, Tag, DollarSign, ToggleLeft, ToggleRight,
  CheckCircle, XCircle, Save, CreditCard, Plus, Sparkles, Download, BarChart3, User
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar,
  PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  DARK, LIGHT, NAV_MAIN, NAV_BOTTOM,
  type TK, type T, type Sub, type SubStatus,
} from "./dashboard-constants";

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

function EditModal({ sub, onSave, onClose, t }: { sub:Sub; onSave:(s:Sub)=>void; onClose:()=>void; t:T }) {
  const [form, setForm] = useState<Sub>({ ...sub });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const f = <K extends keyof Sub>(k:K) => (v: Sub[K]) => setForm(p=>({ ...p, [k]:v }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: dbError } = await supabase
        .from('subscriptions')
        .update({
          name: form.name,
          category: form.category,
          amount: form.amount,
          billing_cycle: form.cycle,
          provider: form.provider,
          notes: form.notes,
          auto_renew: form.autoRenew,
          currency: form.currency,
          status: form.status,
        })
        .eq('id', form.id);
      if (dbError) throw dbError;
      onSave(form);
    } catch (err: any) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
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
        {error && (
          <div style={{ background:t.redDim, border:`1px solid ${t.red}44`, borderRadius:8, padding:"10px 14px", marginBottom:16, fontSize:12, color:t.red, fontFamily:"var(--font-mono)" }}>{error}</div>
        )}
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

function buildMonthlyData(subs: Sub[]) {
  const now = new Date();
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return months.map((month, i) => {
    const spend = subs
      .filter(s => s.status === "active")
      .reduce((acc, s) => {
        if (s.cycle === "Monthly" || s.cycle === "Daily" || s.cycle === "Weekly") return acc + s.amount;
        if (s.cycle === "Annually") return acc + s.amount / 12;
        if (s.cycle === "Quarterly") return acc + s.amount / 3;
        return acc;
      }, 0);
    return { month, spend: Math.round(spend * 100) / 100 };
  });
}

function buildCatData(subs: Sub[]) {
  const active = subs.filter(s => s.status === "active");
  const total = active.reduce((a, s) => a + s.amount, 0);
  if (total === 0) return [];
  const catMap: Record<string, number> = {};
  active.forEach(s => {
    const cat = s.category || "Other";
    catMap[cat] = (catMap[cat] || 0) + s.amount;
  });
  const colors = ["#22c55e","#3b82f6","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#ec4899","#14b8a6"];
  return Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value], i) => ({
      name,
      value: Math.round((value / total) * 100),
      color: colors[i % colors.length],
    }));
}

function OverviewView({ t, subs, onNav }: { t:T; subs:Sub[]; onNav:(id:string)=>void }) {
  const active  = subs.filter(s => s.status !== "inactive");
  const monthly = active.reduce((a,s) => a + s.amount, 0);
  const monthlyData = buildMonthlyData(subs);
  const catData = buildCatData(subs);
  const dueSoon = subs.filter(s => s.status === "warning" || s.status === "renewal_passed");

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div className="kpi-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:14 }}>
        <KPI t={t} label="Monthly Spend"  value={`$${monthly.toFixed(2)}`} sub={`${active.length} active subscriptions`} trend="neutral" Icon={DollarSign} />
        <KPI t={t} label="Active Subs"    value={`${active.length}`} sub={`${subs.length} total tracked`} Icon={CreditCard} />
        <KPI t={t} label="Annual Cost"    value={`$${(monthly*12).toFixed(0)}`} sub="Projected this year" Icon={TrendingUp} />
        <KPI t={t} label="Avg per Sub"    value={`$${active.length ? (monthly / active.length).toFixed(2) : "0.00"}`} sub="Monthly average cost" trend="neutral" Icon={Zap} />
      </div>

      <div className="chart-2col" style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:14 }}>
        <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:"20px 22px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:t.text, fontFamily:"var(--font-display)" }}>Monthly Spending</div>
              <div style={{ fontSize:10, color:t.text3, fontFamily:"var(--font-mono)", marginTop:2 }}>Based on your active subscriptions</div>
            </div>
            <button onClick={()=>onNav("analytics")} style={{ fontSize:11, color:t.green, background:t.greenDim, border:`1px solid ${t.greenBorder}`, borderRadius:6, padding:"5px 10px", cursor:"pointer", fontFamily:"var(--font-mono)", display:"flex", alignItems:"center", gap:4 }}>
              View Full <ChevronRight size={11} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={monthlyData}>
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
          <div style={{ fontSize:10, color:t.text3, fontFamily:"var(--font-mono)", marginBottom:14 }}>Spending breakdown</div>
          {catData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={120}>
                <RechartsPie>
                  <Pie data={catData} cx="50%" cy="50%" innerRadius={34} outerRadius={54} dataKey="value" paddingAngle={2}>
                    {catData.map((c,i) => <Cell key={i} fill={c.color}/>)}
                  </Pie>
                  <Tooltip contentStyle={{ background:t.surface2, border:`1px solid ${t.border2}`, borderRadius:8, fontSize:11, fontFamily:"var(--font-mono)", color:t.text }} formatter={(v:number)=>[`${v}%`,""]} />
                </RechartsPie>
              </ResponsiveContainer>
              <div style={{ display:"flex", flexDirection:"column", gap:5, marginTop:8 }}>
                {catData.map(c => (
                  <div key={c.name} style={{ display:"flex", alignItems:"center", gap:7 }}>
                    <span style={{ width:7, height:7, borderRadius:2, background:c.color, flexShrink:0 }}/>
                    <span style={{ fontSize:10, color:t.text2, fontFamily:"var(--font-mono)", flex:1 }}>{c.name}</span>
                    <span style={{ fontSize:10, color:t.text, fontFamily:"var(--font-mono)" }}>{c.value}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign:"center", padding:"24px 0", color:t.text3, fontSize:12, fontFamily:"var(--font-mono)" }}>No data yet</div>
          )}
        </div>
      </div>

      <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, overflow:"hidden" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"15px 20px", borderBottom:`1px solid ${t.border}` }}>
          <div style={{ fontSize:13, fontWeight:700, color:t.text, fontFamily:"var(--font-display)" }}>My Subscriptions</div>
          <button onClick={()=>onNav("subscriptions")} style={{ fontSize:11, color:t.green, background:"none", border:"none", cursor:"pointer", fontFamily:"var(--font-mono)", display:"flex", alignItems:"center", gap:4 }}>
            View all <ChevronRight size={11}/>
          </button>
        </div>
        {subs.length === 0 ? (
          <div style={{ padding:"44px 20px", textAlign:"center", color:t.text3, fontFamily:"var(--font-mono)", fontSize:13 }}>
            No subscriptions yet. <button onClick={()=>onNav("add")} style={{ background:"none", border:"none", color:t.green, cursor:"pointer", fontFamily:"var(--font-mono)", fontSize:13 }}>Add your first one →</button>
          </div>
        ) : (
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
                    <td style={{ padding:"11px 16px", fontSize:13, fontWeight:700, color:t.text, fontFamily:"var(--font-mono)" }}>{s.currency} {s.amount.toFixed(2)}</td>
                    <td style={{ padding:"11px 16px", fontSize:11, color:t.text2, fontFamily:"var(--font-mono)" }}>{s.nextDate || "—"}</td>
                    <td style={{ padding:"11px 16px" }}><Badge status={s.status} t={t}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SubsView({ t, subs, setSubs, onAdd, toast }: { t:T; subs:Sub[]; setSubs:React.Dispatch<React.SetStateAction<Sub[]>>; onAdd:()=>void; toast:(m:string,tp:"success"|"error"|"info")=>void }) {
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
    const sub = subs.find(s => s.id === id);
    if (!sub) return;
    const newStatus: SubStatus = sub.status === "active" ? "inactive" : "active";
    try {
      const supabase = createClient();
      await supabase.from('subscriptions').update({ status: newStatus }).eq('id', id);
      setSubs(prev => prev.map(s => s.id===id ? { ...s, status: newStatus } : s));
    } catch {
      toast("Failed to update status", "error");
    }
  };

  const deleteSub = async (id:string) => {
    setDeleting(id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('subscriptions').delete().eq('id', id);
      if (error) throw error;
      setSubs(prev => prev.filter(s => s.id !== id));
      toast("Subscription deleted", "info");
    } catch {
      toast("Failed to delete subscription", "error");
    } finally {
      setDeleting(null);
    }
  };

  const saveEdit = (updated:Sub) => {
    setSubs(prev => prev.map(s => s.id===updated.id ? updated : s));
    setEditing(null);
    toast("Subscription updated", "success");
  };

  const simMonthly  = filtered.filter(s=>s.status==="active").reduce((a,s)=>a+s.amount,0);
  const simInactive = filtered.filter(s=>s.status==="inactive").reduce((a,s)=>a+s.amount,0);

  return (
    <>
      {editing && <EditModal sub={editing} onSave={saveEdit} onClose={()=>setEditing(null)} t={t} />}
      <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
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
                      <button onClick={()=>!sim && toggleStatus(s.id)} style={{ background:"none", border:"none", cursor:sim?"default":"pointer", display:"flex", alignItems:"center" }}>
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
                    <td style={{ padding:"11px 14px", fontSize:11, color:t.text2, fontFamily:"var(--font-mono)" }}>{s.nextDate || "—"}</td>
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
              {subs.length === 0 ? "No subscriptions yet." : `No subscriptions found${search ? ` for "${search}"` : ""}.`}
            </div>
          )}
        </div>

        {sim && (
          <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:"20px 22px" }}>
            <div style={{ fontSize:13, fontWeight:700, color:t.text, fontFamily:"var(--font-display)", marginBottom:14 }}>Simulation Summary</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:12 }}>
              {[
                { label:"Active Monthly",   value:`$${simMonthly.toFixed(2)}`          },
                { label:"Inactive Monthly", value:`$${simInactive.toFixed(2)}`         },
                { label:"Annual Savings",   value:`$${(simInactive*12).toFixed(2)}/yr` },
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

function AnalyticsView({ t, subs }: { t:T; subs:Sub[] }) {
  const monthlyData = buildMonthlyData(subs);
  const catData = buildCatData(subs);
  const active = subs.filter(s => s.status === "active");
  const monthly = active.reduce((a,s) => a + s.amount, 0);
  const dueSoon = subs.filter(s => s.status === "warning" || s.status === "renewal_passed").length;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div>
        <h2 style={{ fontFamily:"var(--font-display)", fontSize:22, fontWeight:800, color:t.text, letterSpacing:-0.5 }}>Analytics</h2>
        <p style={{ fontSize:11.5, color:t.text3, fontFamily:"var(--font-mono)", marginTop:3 }}>Spending trends and category breakdown</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:12 }}>
        {[
          { l:"Monthly Total",  v:`$${monthly.toFixed(2)}`,          n:`${active.length} active subs` },
          { l:"Annual Projected", v:`$${(monthly*12).toFixed(0)}`,   n:"Based on current subs" },
          { l:"Due Soon",       v:`${dueSoon}`,                       n:"Renewals approaching" },
          { l:"Avg per Sub",    v:`$${active.length ? (monthly/active.length).toFixed(2) : "0.00"}`, n:"Monthly average" },
        ].map(s => (
          <div key={s.l} style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:10, padding:"16px 18px" }}>
            <div style={{ fontSize:10, color:t.text3, fontFamily:"var(--font-mono)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>{s.l}</div>
            <div style={{ fontFamily:"var(--font-display)", fontSize:22, fontWeight:800, color:t.text, letterSpacing:-0.5 }}>{s.v}</div>
            <div style={{ fontSize:10, color:t.text3, fontFamily:"var(--font-mono)", marginTop:4 }}>{s.n}</div>
          </div>
        ))}
      </div>

      <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:"22px" }}>
        <div style={{ fontSize:14, fontWeight:700, color:t.text, fontFamily:"var(--font-display)", marginBottom:4 }}>Monthly Spending Trend</div>
        <div style={{ fontSize:10, color:t.text3, fontFamily:"var(--font-mono)", marginBottom:20 }}>Projected monthly cost based on active subscriptions</div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={monthlyData}>
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

      <div className="ana-2col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:"22px" }}>
          <div style={{ fontSize:13, fontWeight:700, color:t.text, fontFamily:"var(--font-display)", marginBottom:18 }}>Spending by Category</div>
          {catData.length > 0 ? (
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={catData} layout="vertical">
                <XAxis type="number" tick={{ fontSize:9, fill:t.text3, fontFamily:"var(--font-mono)" }} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/>
                <YAxis dataKey="name" type="category" tick={{ fontSize:9, fill:t.text2, fontFamily:"var(--font-mono)" }} axisLine={false} tickLine={false} width={78}/>
                <Tooltip contentStyle={{ background:t.surface2, border:`1px solid ${t.border2}`, borderRadius:8, fontSize:11, fontFamily:"var(--font-mono)", color:t.text }} formatter={(v:number)=>[`${v}%`,""]}/>
                <Bar dataKey="value" radius={[0,4,4,0]}>
                  {catData.map((c,i) => <Cell key={i} fill={c.color}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign:"center", padding:"40px 0", color:t.text3, fontSize:12, fontFamily:"var(--font-mono)" }}>No data yet</div>
          )}
        </div>

        <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:"22px" }}>
          <div style={{ fontSize:13, fontWeight:700, color:t.text, fontFamily:"var(--font-display)", marginBottom:18 }}>Distribution</div>
          {catData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <RechartsPie>
                  <Pie data={catData} cx="50%" cy="50%" innerRadius={44} outerRadius={66} dataKey="value" paddingAngle={3}>
                    {catData.map((c,i) => <Cell key={i} fill={c.color}/>)}
                  </Pie>
                  <Tooltip contentStyle={{ background:t.surface2, border:`1px solid ${t.border2}`, borderRadius:8, fontSize:11, fontFamily:"var(--font-mono)", color:t.text }} formatter={(v:number)=>[`${v}%`,""]}/>
                </RechartsPie>
              </ResponsiveContainer>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"6px 14px", justifyContent:"center", marginTop:8 }}>
                {catData.map(c => (
                  <div key={c.name} style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <span style={{ width:7, height:7, borderRadius:2, background:c.color, flexShrink:0 }}/>
                    <span style={{ fontSize:9.5, color:t.text2, fontFamily:"var(--font-mono)" }}>{c.name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign:"center", padding:"40px 0", color:t.text3, fontSize:12, fontFamily:"var(--font-mono)" }}>No data yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

function AISummaryView({ t, subs }: { t:T; subs:Sub[] }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string|null>(null);
  const [copied,  setCopied]  = useState(false);
  const [error,   setError]   = useState<string|null>(null);
  const monthly = subs.filter(s=>s.status==="active").reduce((a,s)=>a+s.amount,0);
  const dueSoon = subs.filter(s=>s.status==="warning"||s.status==="renewal_passed").length;

  const generate = async () => {
    if (subs.length === 0) {
      setError("Add some subscriptions first to generate an AI summary.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = subs.filter(s=>s.status==="active").map(s=>({
        name: s.name,
        amount: s.amount,
        billingCycle: s.cycle,
        category: s.category,
      }));
      const res = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptions: payload }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate summary');
      }
      const data = await res.json();
      setSummary(data.summary);
    } catch (err: any) {
      setError(err.message || 'AI service unavailable. Please try again later.');
    } finally {
      setLoading(false);
    }
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

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(195px,1fr))", gap:13 }}>
        {[
          { Icon:DollarSign,    label:"Monthly Total",    value:`$${monthly.toFixed(2)}`, col:t.green, bg:t.greenDim },
          { Icon:CreditCard,    label:"Active Subs",      value:`${subs.filter(s=>s.status==="active").length}`, col:t.blue, bg:t.blueDim },
          { Icon:AlertTriangle, label:"Due Soon",         value:`${dueSoon} sub${dueSoon!==1?"s":""}`, col:dueSoon>0?t.red:t.text3, bg:dueSoon>0?t.redDim:t.surface2 },
          { Icon:Target,        label:"Annual Projected", value:`$${(monthly*12).toFixed(0)}`, col:t.amber, bg:t.amberDim },
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

      {error && (
        <div style={{ background:t.redDim, border:`1px solid ${t.red}44`, borderRadius:10, padding:"14px 18px", fontSize:13, color:t.red, fontFamily:"var(--font-mono)" }}>{error}</div>
      )}

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

function AddView({ t, onSuccess, toast }: { t:T; onSuccess:()=>void; toast:(m:string,tp:"success"|"error"|"info")=>void }) {
  const blank = { name:"", category:"", amount:"", cycle:"Monthly", startDate:"", provider:"", autoRenew:true, currency:"USD", notes:"" };
  const [form,      setForm]    = useState(blank);
  const [loading,   setLoading] = useState(false);
  const [aiLoading, setAiLoad]  = useState(false);
  const [error,     setError]   = useState<string|null>(null);
  const f = (k: keyof typeof form) => (v: string | boolean) => setForm(p => ({ ...p, [k]:v }));

  const aiAutofill = async () => {
    if (!form.name) return;
    setAiLoad(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/autofill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'AI autofill failed');
      }
      const data = await res.json();
      setForm(p => ({
        ...p,
        category: data.category || p.category,
        amount: data.amount ? String(data.amount) : p.amount,
        provider: data.provider || p.provider,
        cycle: data.billingCycle === 'yearly' ? 'Annually' : data.billingCycle === 'monthly' ? 'Monthly' : p.cycle,
        autoRenew: data.autoRenew ?? p.autoRenew,
        currency: data.currency || p.currency,
      }));
      toast("AI autofill complete", "success");
    } catch (err: any) {
      setError(err.message || 'AI autofill unavailable');
    } finally {
      setAiLoad(false);
    }
  };

  const submit = async () => {
    if (!form.name || !form.amount) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const startDate = form.startDate || new Date().toISOString().split('T')[0];
      const { error: dbError } = await supabase.from('subscriptions').insert({
        user_id: user.id,
        name: form.name,
        amount: parseFloat(form.amount),
        billing_cycle: form.cycle,
        category: form.category || null,
        provider: form.provider || null,
        start_date: startDate,
        currency: form.currency,
        auto_renew: form.autoRenew,
        status: 'active',
        notes: form.notes || null,
        active_status: true,
        icon: 'default',
      });
      if (dbError) throw dbError;
      setForm(blank);
      toast("Subscription added", "success");
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to add subscription');
    } finally {
      setLoading(false);
    }
  };

  const iStyle: React.CSSProperties = { width:"100%", background:t.surface2, border:`1px solid ${t.border}`, borderRadius:8, padding:"10px 13px", fontSize:13, color:t.text, fontFamily:"var(--font-mono)", outline:"none", transition:"border-color 0.2s" };
  const lStyle: React.CSSProperties = { fontSize:10.5, color:t.text3, fontFamily:"var(--font-mono)", letterSpacing:"0.08em", display:"block", marginBottom:5 };
  const preview = { name:form.name||"Subscription Name", amount:form.amount?`${form.currency} ${parseFloat(form.amount).toFixed(2)}`:`${form.currency} 0.00`, cycle:form.cycle, category:form.category||"—", start:form.startDate||new Date().toLocaleDateString("en-US",{ month:"short", day:"numeric", year:"numeric" }), autoRenew:form.autoRenew?"Yes":"No" };

  return (
    <div className="add-grid" style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:22, alignItems:"start" }}>
      <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:"28px" }}>
        <h2 style={{ fontFamily:"var(--font-display)", fontSize:20, fontWeight:800, color:t.text, letterSpacing:-0.5, marginBottom:5 }}>Add Subscription</h2>
        <p style={{ fontSize:12, color:t.text3, fontFamily:"var(--font-mono)", marginBottom:26 }}>Track your recurring payments with AI-powered insights</p>
        {error && (
          <div style={{ background:t.redDim, border:`1px solid ${t.red}44`, borderRadius:8, padding:"10px 14px", marginBottom:16, fontSize:12, color:t.red, fontFamily:"var(--font-mono)" }}>{error}</div>
        )}
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
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

function ExportView({ t, subs, toast }: { t:T; subs:Sub[]; toast:(m:string,tp:"success"|"error"|"info")=>void }) {
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(subs, null, 2)], { type:"application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href=url; a.download="subsight-subscriptions.json"; a.click();
    toast("Exported as JSON", "success");
  };

  const exportCSV = () => {
    const headers = ["Name","Category","Amount","Currency","Cycle","NextDate","Status","AutoRenew","Provider"];
    const rows    = subs.map(s=>[s.name,s.category,s.amount,s.currency,s.cycle,s.nextDate||"",s.status,s.autoRenew,s.provider].join(","));
    const blob    = new Blob([[headers.join(","),...rows].join("\n")], { type:"text/csv" });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement("a"); a.href=url; a.download="subsight-subscriptions.csv"; a.click();
    toast("Exported as CSV", "success");
  };

  const exportPDF = () => {
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

function SettingsView({ t, toast }: { t:T; toast:(m:string,tp:"success"|"error"|"info")=>void }) {
  const [currency, setCurrency] = useState("USD");
  const [goalPeriod, setGoalPeriod] = useState("Monthly");
  const [goalAmt,   setGoalAmt]   = useState("");
  const [goalCur,   setGoalCur]   = useState("USD");
  const [catInput,  setCatInput]  = useState("");
  const [cats,      setCats]      = useState<string[]>([]);
  const [notifs,    setNotifs]    = useState({ renewal:true, weekly:false, budget:true });
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("subsight-settings");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.currency) setCurrency(parsed.currency);
        if (parsed.cats) setCats(parsed.cats);
        if (parsed.notifs) setNotifs(parsed.notifs);
      } catch {}
    }
  }, []);

  const addCat = () => {
    if (catInput.trim() && !cats.includes(catInput.trim())) {
      setCats(p=>[...p,catInput.trim()]);
      setCatInput("");
    }
  };
  const removeCat = (c:string) => setCats(p=>p.filter(x=>x!==c));

  const save = async () => {
    setSaving(true);
    localStorage.setItem("subsight-settings", JSON.stringify({ currency, cats, notifs }));
    await new Promise(r=>setTimeout(r,300));
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
      <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:"22px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}><Globe size={14} color={t.green}/><span style={{ fontSize:14, fontWeight:700, color:t.text, fontFamily:"var(--font-display)" }}>Display Currency</span></div>
        <p style={{ fontSize:12, color:t.text3, fontFamily:"var(--font-mono)", marginBottom:16 }}>Choose your preferred currency for display across the app</p>
        <select value={currency} onChange={e=>setCurrency(e.target.value)} style={{ ...sel, minWidth:160 }}>
          {["USD","EUR","GBP","PKR","CAD","AUD","JPY","CHF"].map(c=><option key={c}>{c}</option>)}
        </select>
      </div>
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
          {cats.length === 0 && <span style={{ fontSize:12, color:t.text3, fontFamily:"var(--font-mono)" }}>No custom categories yet</span>}
        </div>
      </div>
      <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:"22px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}><Bell size={14} color={t.green}/><span style={{ fontSize:14, fontWeight:700, color:t.text, fontFamily:"var(--font-display)" }}>Notifications</span></div>
        <p style={{ fontSize:12, color:t.text3, fontFamily:"var(--font-mono)", marginBottom:16 }}>Control when and how you get notified</p>
        {[
          { key:"renewal" as const, label:"Renewal Alerts",  desc:"Get notified before a subscription renews (Pro)" },
          { key:"weekly"  as const, label:"Weekly Summary",  desc:"Weekly email digest of your spending activity (Pro)" },
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

function ProfileView({ t, toast }: { t:T; toast:(m:string,tp:"success"|"error"|"info")=>void }) {
  const [form,   setForm]   = useState({ name:"", email:"", avatar:"" });
  const [saving, setSaving] = useState(false);
  const [plan,   setPlan]   = useState<"free"|"pro">("free");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setForm(p => ({ ...p, email: user.email || "" }));
      supabase.from('profiles').select('full_name, avatar_url, subscription_tier').eq('id', user.id).single().then(({ data }) => {
        if (data) {
          setForm(p => ({ ...p, name: data.full_name || "", avatar: data.avatar_url || "" }));
          setPlan(data.subscription_tier === "pro" ? "pro" : "free");
        }
      });
    });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('profiles').update({ full_name: form.name, avatar_url: form.avatar || null }).eq('id', user.id);
      if (error) throw error;
      toast("Profile updated", "success");
    } catch (err: any) {
      toast(err.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const iStyle: React.CSSProperties = { width:"100%", background:t.surface2, border:`1px solid ${t.border}`, borderRadius:8, padding:"11px 13px", fontSize:13, color:t.text, fontFamily:"var(--font-mono)", outline:"none", transition:"border-color 0.2s" };
  const lStyle: React.CSSProperties = { fontSize:10.5, color:t.text3, fontFamily:"var(--font-mono)", letterSpacing:"0.08em", display:"block", marginBottom:5 };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18, maxWidth:640 }}>
      <div>
        <h2 style={{ fontFamily:"var(--font-display)", fontSize:22, fontWeight:800, color:t.text, letterSpacing:-0.5 }}>Profile</h2>
        <p style={{ fontSize:11.5, color:t.text3, fontFamily:"var(--font-mono)", marginTop:3 }}>Manage your account information</p>
      </div>
      <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:"26px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}><User size={14} color={t.green}/><span style={{ fontSize:14, fontWeight:700, color:t.text, fontFamily:"var(--font-display)" }}>Profile Settings</span></div>
        <p style={{ fontSize:12, color:t.text3, fontFamily:"var(--font-mono)", marginBottom:22 }}>Update your profile information</p>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:24 }}>
          <div style={{ width:56, height:56, borderRadius:13, background:t.greenDim, border:`1px solid ${t.greenBorder}`, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", flexShrink:0 }}>
            {form.avatar ? <img src={form.avatar} alt="avatar" style={{ width:56, height:56, objectFit:"cover" }}/> : <User size={22} color={t.green}/>}
          </div>
          <div>
            <div style={{ fontFamily:"var(--font-display)", fontSize:16, fontWeight:700, color:t.text }}>{form.name || "User"}</div>
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
          <button onClick={save} disabled={saving} style={{ background:t.green, color:"#000", border:"none", borderRadius:8, padding:"12px 22px", fontSize:13, fontWeight:700, fontFamily:"var(--font-display)", cursor:saving?"not-allowed":"pointer", display:"flex", alignItems:"center", gap:7, width:"fit-content" }}>
            {saving ? <><RefreshCw size={13} style={{ animation:"spin 1s linear infinite" }}/> Saving...</> : <><Save size={13}/> Save Changes</>}
          </button>
        </div>
      </div>
      <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:"22px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}><Zap size={14} color={t.green}/><span style={{ fontSize:14, fontWeight:700, color:t.text, fontFamily:"var(--font-display)" }}>Subscription Plan</span></div>
        <div style={{ background:t.surface2, border:`1px solid ${t.border}`, borderRadius:10, padding:"14px 16px", display:"flex", alignItems:"center", gap:10 }}>
          <Zap size={13} color={plan==="pro"?t.green:t.text3}/>
          <span style={{ fontSize:13, fontWeight:600, color:t.text, fontFamily:"var(--font-display)" }}>{plan==="pro"?"Pro Plan":"Free Plan"}</span>
          <span style={{ fontSize:10, color:plan==="pro"?t.green:t.text3, background:plan==="pro"?t.greenDim:t.surface3, border:`1px solid ${plan==="pro"?t.greenBorder:t.border}`, borderRadius:4, padding:"2px 8px", fontFamily:"var(--font-mono)", marginLeft:"auto" }}>{plan==="pro"?"Active":"Free"}</span>
        </div>
        {plan==="free" && (
          <p style={{ fontSize:12, color:t.text3, fontFamily:"var(--font-mono)", marginTop:10 }}>
            Upgrade to Pro for unlimited subscriptions, AI summaries, and email reminders.{" "}
            <a href="/pricing" style={{ color:t.green, textDecoration:"none" }}>View plans</a>
          </p>
        )}
      </div>
      <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:"22px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}><Shield size={14} color={t.green}/><span style={{ fontSize:14, fontWeight:700, color:t.text, fontFamily:"var(--font-display)" }}>Privacy & Security</span></div>
        {[
          { Icon:Lock,    label:"End to End Encrypted",   desc:"Your data is encrypted in transit and at rest" },
          { Icon:Shield,  label:"No Third Party Sharing", desc:"We never sell or share your data" },
          { Icon:Globe,   label:"Supabase Powered",       desc:"Enterprise grade security with PostgreSQL" },
          { Icon:Bell,    label:"Smart Reminders",        desc:"Never miss a subscription renewal again" },
          { Icon:Sparkles,label:"AI Powered Insights",    desc:"Real-time analysis powered by Groq" },
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
      <button onClick={signOut} style={{ background:t.redDim, color:t.red, border:`1px solid ${t.red}33`, borderRadius:9, padding:"13px", fontSize:13, fontWeight:600, fontFamily:"var(--font-display)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"background 0.2s" }}
        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=`${t.red}22`}
        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=t.redDim}>
        <LogOut size={13}/> Sign Out
      </button>
    </div>
  );
}

export default function Dashboard() {
  const [themeKey,  setThemeKey]  = useState<TK>("dark");
  const [active,    setActive]    = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSB,  setMobileSB]  = useState(false);
  const [subs,      setSubs]      = useState<Sub[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [toast,     setToast]     = useState<{ msg:string; type:"success"|"error"|"info" }|null>(null);
  const t = themeKey === "dark" ? DARK : LIGHT;

  useEffect(() => {
    const stored = (localStorage.getItem("subsight-theme") || "dark") as TK;
    setThemeKey(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem("subsight-theme", themeKey);
    document.documentElement.setAttribute("data-theme", themeKey);
  }, [themeKey]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return; }
      supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) {
            setSubs(data.map(s => ({
              id: s.id,
              name: s.name,
              category: s.category || "Other",
              amount: Number(s.amount),
              cycle: s.billing_cycle || "Monthly",
              nextDate: s.next_renewal_date || "",
              status: (s.status || "active") as SubStatus,
              autoRenew: s.auto_renew ?? true,
              currency: s.currency || "USD",
              provider: s.provider || "",
              notes: s.notes || "",
            })));
          }
          setLoading(false);
        });
    });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('upgraded') === 'true') {
      showToast("Welcome to Pro! All features are now unlocked.", "success");
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);

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

  const renderView = () => {
    if (loading) {
      return (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"60vh", flexDirection:"column", gap:16 }}>
          <RefreshCw size={24} color={t.green} style={{ animation:"spin 1s linear infinite" }}/>
          <span style={{ fontSize:13, color:t.text3, fontFamily:"var(--font-mono)" }}>Loading your subscriptions...</span>
        </div>
      );
    }
    switch (active) {
      case "overview":      return <OverviewView t={t} subs={subs} onNav={navTo} />;
      case "subscriptions": return <SubsView t={t} subs={subs} setSubs={setSubs} onAdd={()=>navTo("add")} toast={showToast} />;
      case "analytics":     return <AnalyticsView t={t} subs={subs} />;
      case "ai-summary":    return <AISummaryView t={t} subs={subs} />;
      case "add":           return <AddView t={t} onSuccess={()=>{ navTo("subscriptions"); }} toast={showToast} />;
      case "export":        return <ExportView t={t} subs={subs} toast={showToast} />;
      case "settings":      return <SettingsView t={t} toast={showToast} />;
      case "profile":       return <ProfileView t={t} toast={showToast} />;
      default:              return <OverviewView t={t} subs={subs} onNav={navTo} />;
    }
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:t.bg, color:t.text, fontFamily:"var(--font-display)", transition:"background 0.4s, color 0.4s" }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--font-display:var(--font-inter),system-ui,sans-serif;--font-mono:var(--font-jetbrains-mono),'Courier New',monospace}
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

      <aside className="sidebar-desk" style={{ width:SBW, minHeight:"100vh", background:t.sidebarBg, borderRight:`1px solid ${t.border}`, flexDirection:"column", position:"fixed", left:0, top:0, bottom:0, zIndex:50, transition:"width 0.25s cubic-bezier(0.4,0,0.2,1)", overflow:"hidden", flexShrink:0, display:"flex" }}>
        <div style={{ height:62, display:"flex", alignItems:"center", padding:collapsed?"0 0 0 16px":"0 18px", gap:9, borderBottom:`1px solid ${t.border}`, flexShrink:0 }}>
          <img src="/icon.svg" alt="Subsight" width={28} height={28} style={{ borderRadius:6, flexShrink:0, display:"block" }} />
          {!collapsed && <span style={{ fontFamily:"var(--font-display)", fontSize:17, fontWeight:800, color:t.text, letterSpacing:-0.5, whiteSpace:"nowrap" }}>Subsight</span>}
        </div>
        <nav style={{ flex:1, padding:"10px 0", overflowY:"auto" }}>
          {NAV_MAIN.map(item => <SidebarLink key={item.id} {...item}/>)}
        </nav>
        <div style={{ padding:"10px 0", borderTop:`1px solid ${t.border}`, flexShrink:0 }}>
          {NAV_BOTTOM.map(item => <SidebarLink key={item.id} {...item}/>)}
        </div>
        <button onClick={()=>setCollapsed(!collapsed)} style={{ display:"flex", alignItems:"center", justifyContent:collapsed?"center":"flex-end", padding:"11px 14px", background:"none", border:"none", borderTop:`1px solid ${t.border}`, cursor:"pointer", color:t.text3, transition:"color 0.2s", flexShrink:0 }}
          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color=t.text}
          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color=t.text3}>
          {collapsed ? <ChevronRight size={15}/> : <ChevronLeft size={15}/>}
        </button>
      </aside>

      {mobileSB && (
        <div style={{ position:"fixed", inset:0, zIndex:200 }}>
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.6)" }} onClick={()=>setMobileSB(false)}/>
          <aside style={{ position:"absolute", left:0, top:0, bottom:0, width:236, background:t.sidebarBg, borderRight:`1px solid ${t.border}`, display:"flex", flexDirection:"column", zIndex:201 }}>
            <div style={{ height:62, display:"flex", alignItems:"center", padding:"0 18px", gap:9, borderBottom:`1px solid ${t.border}` }}>
              <img src="/icon.svg" alt="Subsight" width={28} height={28} style={{ borderRadius:6, display:"block" }} />
              <span style={{ fontFamily:"var(--font-display)", fontSize:17, fontWeight:800, color:t.text, letterSpacing:-0.5 }}>Subsight</span>
              <button onClick={()=>setMobileSB(false)} style={{ marginLeft:"auto", background:"none", border:"none", color:t.text3, cursor:"pointer" }}><X size={18}/></button>
            </div>
            <nav style={{ flex:1, padding:"10px 0", overflowY:"auto" }}>
              {NAV_MAIN.map(item => <SidebarLink key={item.id} {...item}/>)}
            </nav>
            <div style={{ padding:"10px 0", borderTop:`1px solid ${t.border}` }}>
              {NAV_BOTTOM.map(item => <SidebarLink key={item.id} {...item}/>)}
            </div>
          </aside>
        </div>
      )}

      <div style={{ flex:1, marginLeft:SBW, minHeight:"100vh", display:"flex", flexDirection:"column", transition:"margin-left 0.25s cubic-bezier(0.4,0,0.2,1)" }} className="sidebar-desk-offset">
        <header style={{ height:62, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", borderBottom:`1px solid ${t.border}`, background:t.navBg, backdropFilter:"blur(14px)", WebkitBackdropFilter:"blur(14px)", position:"sticky", top:0, zIndex:40, flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button className="mob-sb-btn" onClick={()=>setMobileSB(true)} style={{ background:"none", border:"none", color:t.text2, cursor:"pointer", display:"none", alignItems:"center" }}><Menu size={20}/></button>
            <div>
              <div style={{ fontFamily:"var(--font-display)", fontSize:15, fontWeight:700, color:t.text, letterSpacing:-0.3 }}>
                {NAV_MAIN.find(n=>n.id===active)?.label || NAV_BOTTOM.find(n=>n.id===active)?.label || "Dashboard"}
              </div>
              <div style={{ fontSize:10, color:t.text3, fontFamily:"var(--font-mono)", marginTop:1 }}>
                {subs.length} subscriptions · ${subs.filter(s=>s.status==="active").reduce((a,s)=>a+s.amount,0).toFixed(2)}/mo
              </div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <button onClick={()=>{ const n=themeKey==="dark"?"light":"dark" as TK; setThemeKey(n); }} style={{ width:34, height:34, border:`1px solid ${t.border2}`, borderRadius:9, background:t.surface2, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.2s" }}>
              {themeKey==="dark" ? <Sun size={14} color={t.text2}/> : <Moon size={14} color={t.text2}/>}
            </button>
            <button onClick={()=>navTo("add")} style={{ background:t.green, color:"#000", border:"none", borderRadius:9, padding:"8px 16px", fontSize:12, fontWeight:700, fontFamily:"var(--font-display)", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
              <Plus size={12}/> Add
            </button>
          </div>
        </header>

        <main className="main-pad" style={{ flex:1, padding:"28px", overflowY:"auto" }}>
          {renderView()}
        </main>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)} t={t} />}
    </div>
  );
}
