"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useSubscriptions } from "@/contexts/subscription-context";
import { useToast } from "@/hooks/use-toast";
import { applyTokens } from "@/lib/design-tokens";
import {
  Sun, Moon, Menu, Plus,
  LayoutDashboard, CreditCard, Sparkles, Download,
  Settings, User, Receipt, MoreHorizontal, ChevronRight, Wallet,
  ChartNoAxesCombined, CalendarDays,
} from "lucide-react";
import {
  DARK, LIGHT, NAV_GROUPS, NAV_BOTTOM, NAV_ALL,
  type TK, type T, type Sub, type SubStatus,
} from "./dashboard-constants";

const VALID_TABS = new Set(NAV_ALL.map((n) => n.id));

import { PlanView }      from "./views/plan-view";
import { CalendarView }  from "./views/calendar-view";
import { OverviewView }  from "./views/overview-view";
import { SubsView }      from "./views/subs-view";
import { AISummaryView } from "./views/ai-summary-view";
import { AddView }       from "./views/add-view";
import { ExportView }    from "./views/export-view";
import { SettingsView }  from "./views/settings-view";
import { ProfileView }   from "./views/profile-view";
import { VaultView }     from "./views/vault-view";
import BillingPage       from "./billing/page";

/* ── Icon map used by sidebar links ───────────────────────────────────── */
const ICON_MAP: Record<string, React.ElementType> = {
  plan:          ChartNoAxesCombined,
  calendar:      CalendarDays,
  overview:      LayoutDashboard,
  subscriptions: CreditCard,
  "ai-summary":  Sparkles,
  add:           Plus,
  vault:         Wallet,
  export:        Download,
  billing:       Receipt,
  settings:      Settings,
  profile:       User,
};

/* ── Skeleton loader component ────────────────────────────────────────── */
function Skeleton({ w = "100%", h = 16, r = 6 }: { w?: string | number; h?: number; r?: number }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: r,
        background: "linear-gradient(90deg,var(--surface2) 25%,var(--surface3) 50%,var(--surface2) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s infinite linear",
        flexShrink: 0,
      }}
    />
  );
}

function LoadingSkeleton({ t }: { t: T }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20,
      ...({
        "--surface": t.surface,
        "--surface2": t.surface2,
        "--surface3": t.surface3,
        "--border": t.border,
        "--border2": t.border2,
      } as React.CSSProperties)
    }}>
      {/* KPI row: same grid + class as the overview so the four boxes sit in one row */}
      <div className="kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Skeleton w="45%" h={10} />
              <Skeleton w={32} h={32} r={8} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Skeleton w="55%" h={26} r={6} />
              <Skeleton w="70%" h={10} />
            </div>
          </div>
        ))}
      </div>

      {/* Chart row: same class and shape as the real cards, no fixed height */}
      <div className="chart-2col" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, minWidth: 0 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Skeleton w={130} h={12} />
              <Skeleton w={175} h={9} />
            </div>
            <Skeleton w={76} h={24} r={6} />
          </div>
          <Skeleton w="100%" h={180} r={8} />
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 22px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
            <Skeleton w={100} h={12} />
            <Skeleton w={120} h={9} />
          </div>
          <div style={{ display: "flex", justifyContent: "center", height: 120, alignItems: "center" }}>
            <Skeleton w={108} h={108} r={54} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 8 }}>
            {[0,1,2,3,4].map(i => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <Skeleton w={7} h={7} r={2} />
                <Skeleton w={`${[60,48,55,42,50][i]}%`} h={9} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent subscriptions table placeholder */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 20px", borderBottom: "1px solid var(--border)" }}>
          <Skeleton w={130} h={12} />
          <Skeleton w={60} h={10} />
        </div>
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 480 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 24, padding: "11px 16px", background: "var(--surface2)", borderBottom: "1px solid var(--border)" }}>
              <div style={{ flex: 2 }}><Skeleton w="60%" h={9} /></div>
              <div style={{ flex: 1.4 }}><Skeleton w="55%" h={9} /></div>
              <div style={{ flex: 1.4 }}><Skeleton w="50%" h={9} /></div>
              <div style={{ flex: 1.6 }}><Skeleton w="60%" h={9} /></div>
              <div style={{ flex: 1 }}><Skeleton w="45%" h={9} /></div>
            </div>
            {[0,1,2,3,4].map(i => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 24, padding: "11px 16px", borderBottom: i < 4 ? "1px solid var(--border)" : "none" }}>
                <div style={{ flex: 2 }}><Skeleton w="75%" h={11} /></div>
                <div style={{ flex: 1.4 }}><Skeleton w="65%" h={10} /></div>
                <div style={{ flex: 1.4 }}><Skeleton w="60%" h={11} /></div>
                <div style={{ flex: 1.6 }}><Skeleton w="70%" h={10} /></div>
                <div style={{ flex: 1 }}><Skeleton w={54} h={18} r={9} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [emailSent, setEmailSent] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const { subscriptions, loading: subsLoading, refetchSubscriptions } = useSubscriptions();
  const { toast: shadcnToast } = useToast();
  const [themeKey, setThemeKey] = useState<TK>("light");
  const [themeReady, setThemeReady] = useState(false);
  const [active, setActive] = useState("overview");
  const [vaultTab, setVaultTab] = useState<"items" | "analytics" | "settings">("items");
  const [collapsed, setCollapsed] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t = themeKey === "dark" ? DARK : LIGHT;

  const loading = authLoading || subsLoading;

  /* ── Theme: read the stored value before applying tokens, so the
        skeleton paints in the right theme on the first frame ─────────── */
  useEffect(() => {
    const stored = localStorage.getItem("subsight-theme");
    const initial: TK = stored === "dark" ? "dark" : "light";
    setThemeKey(initial);
    applyTokens(initial);
    setThemeReady(true);
  }, []);

  useEffect(() => {
    if (!themeReady) return;
    localStorage.setItem("subsight-theme", themeKey);
    applyTokens(themeKey);
  }, [themeKey, themeReady]);

  /* ── Map Supabase subscriptions ➜ local Sub shape ─────────────────── */
  useEffect(() => {
    if (!subscriptions || subscriptions.length === 0) { setSubs([]); return; }
    const mappedSubs = subscriptions.map((raw) => {
      const s = raw as unknown as {
        id: string; name: string; category: string | null; amount: number;
        billingCycle: string | null; nextRenewalDate: string | null;
        activeStatus: boolean | null; autoRenew: boolean | null;
        currency: string | null; provider: string | null; notes: string | null;
        cancel_by_date?: string | null; cancel_state?: string | null;
      };
      return {
      id: s.id,
      name: s.name,
      category: s.category || "Other",
      amount: Number(s.amount),
      cycle: s.billingCycle || "monthly",
      nextDate: s.nextRenewalDate || "",
      status: (s.activeStatus ? "active" : "inactive") as SubStatus,
      autoRenew: s.autoRenew ?? true,
      currency: s.currency || "USD",
      provider: s.provider || "",
      notes: s.notes || "",
        cancelByDate: s.cancel_by_date ?? null,
        cancelState: (s.cancel_state as Sub["cancelState"]) ?? "none",
      };
    });
    setSubs(mappedSubs);
  }, [subscriptions]);

  /* ── URL param handling ───────────────────────────────────────────── */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab) {
      const resolved = tab === "analytics" ? "overview" : tab;
      if (VALID_TABS.has(resolved)) setActive(resolved);
    }
    if (params.get("upgraded") === "true") showToast("All features are available", "success");
    if (tab || params.get("upgraded") === "true") window.history.replaceState({}, "", "/dashboard");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Tablet auto-collapse at ≤1024px ──────────────────────────────── */
  useEffect(() => {
    const mq = window.matchMedia("(max-width:1024px)");
    const handler = (e: MediaQueryListEvent) => setCollapsed(e.matches);
    setCollapsed(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const showToast = useCallback(
    (msg: string, type: "success" | "error" | "info" | "warning" = "success") => {
      shadcnToast({
        // Pass the type directly as the variant toast.tsx handles all four
        variant: type as "success" | "error" | "info" | "warning",
        description: msg,
      });
    },
    [shadcnToast],
  );

  const navTo = useCallback((id: string, tab?: string) => {
    setActive(id);
    if (id === "vault") {
      setVaultTab(tab === "analytics" || tab === "settings" ? tab : "items");
    }
    setMoreOpen(false);
  }, []);

  const SBW = collapsed ? 64 : 228;

  /* ── Sidebar link ─────────────────────────────────────────────────── */
  const SidebarLink = ({
    id, label, Icon, section,
  }: {
    id: string; label: string; Icon: React.ElementType; section: "main" | "bottom";
  }) => {
    const isActive = active === id;
    const isHovered = hoveredNav === id;

    return (
      <div style={{ position: "relative", padding: "2px 8px" }}>
        <button
          onClick={() => navTo(id)}
          onMouseEnter={() => {
            if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
            setHoveredNav(id);
          }}
          onMouseLeave={() => {
            tooltipTimerRef.current = setTimeout(() => setHoveredNav(null), 100);
          }}
          aria-label={label}
          aria-current={isActive ? "page" : undefined}
          title={collapsed ? label : undefined}
          style={{
            width: "100%",
            minHeight: 40,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: collapsed ? "0 8px" : "0 12px",
            justifyContent: collapsed ? "center" : "flex-start",
            background: isActive ? t.greenDim : "transparent",
            border: `1px solid ${isActive ? t.greenBorder : "transparent"}`,
            cursor: "pointer",
            color: isActive ? t.greenInk : isHovered ? t.text : t.text2,
            transition: "background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease",
            borderRadius: 8,
            outline: "none",
            textAlign: "left",
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 24,
              height: 24,
              borderRadius: 6,
              background: isActive ? t.greenDim : t.surface2,
              border: `1px solid ${isActive ? t.greenBorder : "transparent"}`,
              flexShrink: 0,
            }}
          >
            <Icon size={17} strokeWidth={1.5} aria-hidden="true" />
          </span>
          {!collapsed && (
            <span
              style={{
                fontSize: 13,
                fontWeight: isActive ? 500 : 400,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                minWidth: 0,
                fontFamily: "var(--font-display)",
              }}
            >
              {label}
            </span>
          )}
        </button>

        {collapsed && isHovered && (
          <div
            style={{
              position: "absolute",
              left: 72,
              top: "50%",
              transform: "translateY(-50%)",
              background: t.surface,
              border: `1px solid ${t.border2}`,
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 500,
              color: t.text,
              fontFamily: "var(--font-display)",
              whiteSpace: "nowrap",
              zIndex: 200,
              boxShadow: `0 2px 8px ${t.shadow}`,
              pointerEvents: "none",
            }}
          >
            {label}
            <span
              style={{
                position: "absolute",
                left: -5,
                top: "50%",
                transform: "translateY(-50%) rotate(45deg)",
                width: 8,
                height: 8,
                background: t.surface,
                border: `1px solid ${t.border2}`,
                borderRight: "none",
                borderTop: "none",
              }}
            />
          </div>
        )}
      </div>
    );
  };

  /* ── Render view with skeleton loader ─────────────────────────────── */
  const renderView = () => {
    if (loading) return <LoadingSkeleton t={t} />;
    switch (active) {
      case "plan":          return <PlanView t={t} subs={subs} />;
      case "calendar":      return <CalendarView t={t} subs={subs} />;
      case "overview":      return <OverviewView t={t} subs={subs} onNav={navTo} />;
      case "subscriptions": return <SubsView t={t} subs={subs} setSubs={setSubs} onAdd={() => navTo("add")} toast={showToast} />;
      case "ai-summary":    return <AISummaryView t={t} subs={subs} />;
      case "add":           return <AddView t={t} onSuccess={async () => { await refetchSubscriptions(); navTo("subscriptions"); }} toast={showToast} />;
      case "vault":         return <VaultView t={t} toast={showToast} initialTab={vaultTab} />;
      case "export":        return <ExportView t={t} subs={subs} toast={showToast} onNav={navTo} />;
      case "settings":      return <SettingsView t={t} toast={showToast} onNav={navTo} />;
      case "billing":       return <BillingPage />;
      case "profile":       return <ProfileView t={t} toast={showToast} />;
      default:              return <OverviewView t={t} subs={subs} onNav={navTo} />;
    }
  };

  const activeMonthly = subs.filter((s) => s.status === "active").reduce((a, s) => a + s.amount, 0);
  const activeLabel = NAV_ALL.find((n) => n.id === active)?.label || "Dashboard";

  /* ── Sidebar inner content (desktop only) ─────────────────────────── */
  const groupLabel: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 500,
    color: t.text3,
    fontFamily: "var(--font-display)",
    padding: "12px 20px 6px",
  };

  const SidebarContent = () => (
    <>
      {/* Wordmark */}
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          padding: collapsed ? "0" : "0 12px",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: 12,
          borderBottom: `1px solid ${t.border}`,
          flexShrink: 0,
        }}
      >
        <img
          src="/Subsight.png"
          alt=""
          width={32}
          height={32}
          style={{ display: "block", borderRadius: 8, flexShrink: 0 }}
        />
        {!collapsed && (
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 17,
              fontWeight: 500,
              color: t.text,
              whiteSpace: "nowrap",
            }}
          >
            Subsight
          </span>
        )}
      </div>

      <nav data-lenis-prevent style={{ flex: 1, padding: "8px 0", overflowY: "auto", overflowX: "hidden" }} role="navigation" aria-label="Main navigation">
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label}>
            {gi > 0 && (
              <div style={{ height: 1, background: t.border, margin: "12px 20px 4px" }} />
            )}
            {!collapsed && <div style={groupLabel}>{group.label}</div>}
            {group.items.map((item) => (
              <SidebarLink key={item.id} section="main" {...item} />
            ))}
          </div>
        ))}
      </nav>

      <div style={{ padding: "8px 0", borderTop: `1px solid ${t.border}`, flexShrink: 0 }}>
        {!collapsed && <div style={groupLabel}>Account</div>}
        {NAV_BOTTOM.map((item) => (
          <SidebarLink key={item.id} section="bottom" {...item} />
        ))}
      </div>

      <div style={{ padding: "8px", borderTop: `1px solid ${t.border}`, flexShrink: 0 }}>
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            width: "100%",
            minHeight: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: 12,
            padding: collapsed ? "0 8px" : "0 12px",
            background: "transparent",
            border: `1px solid ${t.border}`,
            borderRadius: 8,
            cursor: "pointer",
            color: t.text3,
            transition: "background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.color = t.text;
            el.style.borderColor = t.border2;
            el.style.background = t.surface2;
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.color = t.text3;
            el.style.borderColor = t.border;
            el.style.background = "transparent";
          }}
        >
          <span style={{ display: "flex", width: 24, height: 24, borderRadius: 6, background: t.surface2, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Menu size={17} strokeWidth={1.5} aria-hidden="true" />
          </span>
          {!collapsed && (
            <span style={{ fontSize: 13, fontFamily: "var(--font-display)", fontWeight: 400, whiteSpace: "nowrap" }}>
              Collapse
            </span>
          )}
        </button>
      </div>
    </>
  );

  /* ── Bottom nav items for mobile ──────────────────────────────────── */
  /* Primary 4 tabs + an "Add" FAB-style centre button */
  const MOB_PRIMARY = [
    { id: "overview",      label: "Home",   Icon: LayoutDashboard },
    { id: "subscriptions", label: "Subs",   Icon: CreditCard },
    { id: "add",           label: "Add",    Icon: Plus },
    { id: "vault",         label: "Vault",  Icon: Wallet },
    { id: "more",          label: "More",   Icon: MoreHorizontal },
  ] as const;

  /* Items that appear in the More sheet */
  const MOB_MORE = [
    { id: "plan",       label: "Plan",       Icon: ChartNoAxesCombined },
    { id: "calendar",   label: "Calendar",   Icon: CalendarDays },
    { id: "ai-summary", label: "AI summary", Icon: Sparkles },
    { id: "export",     label: "Export",     Icon: Download },
    { id: "settings",   label: "Settings",   Icon: Settings },
    { id: "profile",    label: "Profile",    Icon: User },
  ] as const;

  /* Is the active tab one of the "More" items? */
  const moreIsActive = MOB_MORE.some((m) => m.id === active);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: t.bg,
        color: t.text,
        fontFamily: "var(--font-display)",
        transition: "background 0.3s, color 0.3s",
      }}
    >
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideInUp{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes dropdownSlideDown{from{opacity:0;transform:translateY(-6px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
        a{color:inherit;text-decoration:none}
        input,select,textarea{color-scheme:${themeKey};font-family:var(--font-mono),'Courier New',monospace}
        button:focus-visible{outline:2px solid var(--green);outline-offset:2px}
        a:focus-visible{outline:2px solid var(--green);outline-offset:2px}
        .sidebar-desk{display:flex!important}
        @media(max-width:820px){ .kpi-grid{grid-template-columns:1fr 1fr!important} }
        @media(max-width:768px){
          .sidebar-desk{display:none!important}
          .main-content-wrap{margin-left:0!important;width:100%!important}
          .main-pad{padding:16px 16px 88px!important}
          .add-grid{grid-template-columns:1fr!important}
          .header-pad{padding:0 16px!important}
          .email-verify-banner{display:none!important}
          .topbar-add-btn{display:none!important}
          .mob-bottom-nav{display:flex!important}
          .mob-logo{display:block!important}
        }
        @media(max-width:900px){ .cal-layout{grid-template-columns:1fr!important} }
        @media(max-width:640px){
          .chart-2col{grid-template-columns:1fr!important}
          .ana-2col{grid-template-columns:1fr!important}
          .add-inner-grid{grid-template-columns:1fr!important}
          .billing-stat-grid{grid-template-columns:1fr!important}
        }
        @media(max-width:480px){
          .kpi-grid{grid-template-columns:1fr!important}
          .main-pad{padding:12px 12px 88px!important}
        }
      `}</style>

      {/* ── Desktop Sidebar ──────────────────────────────────────────── */}
      <aside
        className="sidebar-desk"
        style={{
          width: SBW,
          minHeight: "100vh",
          background: t.sidebarBg,
          borderRight: `1px solid ${t.border}`,
          flexDirection: "column",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 50,
          overflow: "visible",
          flexShrink: 0,
          display: "flex",
        }}
      >
        <SidebarContent />
      </aside>

      {/* ── More Sheet Overlay (mobile) ──────────────────────────────── */}
      {moreOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 300 }}
          role="dialog"
          aria-modal="true"
          aria-label="More navigation"
        >
          {/* Backdrop */}
          <div
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)" }}
            onClick={() => setMoreOpen(false)}
          />
          {/* Sheet */}
          <div
            style={{
              position: "absolute",
              bottom: 64,
              left: 12,
              right: 12,
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: 16,
              padding: "8px",
              zIndex: 301,
              boxShadow: `0 2px 8px ${t.shadow}`,
              animation: "slideInUp 0.22s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {/* Sheet handle */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: t.border2 }} />
            </div>
            <div style={{ fontSize: 12, fontWeight: 500, color: t.text3, fontFamily: "var(--font-display)", padding: "8px 12px 4px" }}>
              More
            </div>
            {MOB_MORE.map((item) => {
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { navTo(item.id); }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "8px 12px",
                    background: isActive ? t.surface2 : "transparent",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    color: isActive ? t.greenInk : t.text2,
                    transition: "background-color 0.15s ease, color 0.15s ease",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = t.surface2; }}
                  onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <span
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: 20, height: 20, flexShrink: 0,
                    }}
                  >
                    <item.Icon size={16} strokeWidth={1.5} />
                  </span>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: isActive ? 500 : 400, fontFamily: "var(--font-display)" }}>
                    {item.label}
                  </span>
                  <ChevronRight size={16} strokeWidth={1.5} color={t.text3} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div
        className="main-content-wrap"
        style={{
          flex: 1,
          marginLeft: SBW,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Topbar */}
        <header
          className="header-pad"
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 28px",
            borderBottom: `1px solid ${t.border}`,
            background: t.bg,
            position: "sticky",
            top: 0,
            zIndex: 40,
            flexShrink: 0,
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            {/* Mobile logo (visible only on mobile since sidebar is hidden) */}
            <img
              src="/Subsight.png"
              className="brand-mark mob-logo"
              alt="Subsight"
              width={28}
              height={28}
              style={{ display: "none", borderRadius: 8, flexShrink: 0 }}
            />

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 15,
                  fontWeight: 500,
                  color: t.text,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {activeLabel}
              </div>
              <div style={{ fontSize: 10, color: t.text3, fontFamily: "var(--font-mono)", marginTop: 1, lineHeight: 1.4 }}>
                {subs.filter((s) => s.status === "active").length} active ·{" "}
                <span style={{ color: t.greenInk }}>${activeMonthly.toFixed(2)}/mo</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {/* Email verify banner */}
            {user && !user.emailConfirmed && (
              <div
                className="email-verify-banner"
                style={{
                  fontSize: 11, color: t.amber, background: t.amberDim,
                  border: `1px solid ${t.amber}44`, borderRadius: 8,
                  padding: "7px 12px", fontFamily: "var(--font-mono)",
                  display: "flex", alignItems: "center", gap: 8, lineHeight: 1.4,
                }}
              >
                <span>Verify email</span>
                <button
                  onClick={async () => {
                    const { createClient } = await import("@/lib/supabase/client");
                    const supabase = createClient();
                    const { error } = await supabase.auth.resend({
                      type: "signup",
                      email: user.email,
                      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
                    });
                    if (error) showToast(error.message, "error");
                    else { setEmailSent(true); showToast("Verification email sent", "success"); }
                  }}
                  disabled={emailSent}
                  style={{
                    background: "none", border: "none", color: t.amber,
                    textDecoration: "underline", cursor: emailSent ? "default" : "pointer",
                    fontFamily: "var(--font-mono)", fontSize: 11, opacity: emailSent ? 0.7 : 1,
                  }}
                >
                  {emailSent ? "Sent" : "Resend"}
                </button>
              </div>
            )}

            {/* Theme toggle */}
            <button
              onClick={() => setThemeKey(themeKey === "dark" ? "light" : "dark" as TK)}
              aria-label={`Switch to ${themeKey === "dark" ? "light" : "dark"} mode`}
              style={{
                width: 36, height: 36, border: `1px solid ${t.border2}`, borderRadius: 8,
                background: t.surface2, display: "flex", alignItems: "center",
                justifyContent: "center", cursor: "pointer",
                transition: "background-color 0.15s ease, border-color 0.15s ease", flexShrink: 0,
              }}
            >
              {themeKey === "dark" ? <Sun size={16} strokeWidth={1.5} color={t.text2} /> : <Moon size={16} strokeWidth={1.5} color={t.text2} />}
            </button>

            {/* Add button hidden on mobile (Add is in bottom bar) */}
            <button
              className="topbar-add-btn"
              onClick={() => navTo("add")}
              aria-label="Add new subscription"
              style={{
                background: t.green, color: "#000", border: "none", borderRadius: 9,
                minHeight: 36, padding: "0 13px 0 7px", fontSize: 13, fontWeight: 500,
                fontFamily: "var(--font-display)", cursor: "pointer", lineHeight: 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                flexShrink: 0, whiteSpace: "nowrap",
                transition: "background-color 0.15s ease",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = t.green2; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = t.green; }}
            >
              <span style={{ display: "flex", width: 22, height: 22, borderRadius: 5, background: "rgba(0,0,0,0.12)", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Plus size={15} strokeWidth={1.7} />
              </span>
              Add
            </button>
          </div>
        </header>

        {/* Page content */}
        <main
          className="main-pad"
          style={{ flex: 1, padding: "28px", overflowY: "auto", overflowX: "hidden", animation: "fadeIn 0.2s ease" }}
          key={active}
        >
          {renderView()}
        </main>
      </div>

      {/* ── Mobile Bottom Nav Bar ────────────────────────────────────── */}
      <nav
        className="mob-bottom-nav"
        aria-label="Mobile navigation"
        style={{
          display: "none", /* shown via CSS on ≤768px */
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: 64,
          zIndex: 100,
          background: t.bg,
          borderTop: `1px solid ${t.border}`,
          alignItems: "center",
          justifyContent: "space-around",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {MOB_PRIMARY.map((item) => {
          const isAdd = item.id === "add";
          const isMore = item.id === "more";
          const isActive = isMore ? (moreOpen || moreIsActive) : (active === item.id && !moreOpen);

          return (
            <button
              key={item.id}
              onClick={() => {
                if (isMore) {
                  setMoreOpen((o) => !o);
                } else {
                  setMoreOpen(false);
                  navTo(item.id);
                }
              }}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: isAdd ? 0 : 4,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "6px 8px",
                borderRadius: 12,
                minWidth: 52,
                position: "relative",
                transition: "background-color 0.15s ease",
                outline: "none",
              }}
            >
              {isAdd ? (
                /* FAB-style Add button */
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: t.green,
                    transition: "background-color 0.15s ease",
                  }}
                >
                  <item.Icon size={16} strokeWidth={1.5} color="#000" />
                </span>
              ) : (
                <>
                  {/* Icon */}
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      position: "relative",
                      transition: "background-color 0.15s ease",
                    }}
                  >
                    {/* Active pill indicator */}
                    {isActive && (
                      <span
                        style={{
                          position: "absolute",
                          inset: 0,
                          borderRadius: 8,
                          background: t.greenDim,
                          border: `1px solid ${t.greenBorder}`,
                        }}
                      />
                    )}
                    <item.Icon
                      size={16}
                      strokeWidth={1.5}
                      color={isActive ? t.greenInk : t.text3}
                      style={{ position: "relative", zIndex: 1 }}
                    />
                  </span>
                  {/* Label */}
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: isActive ? 500 : 400,
                      color: isActive ? t.greenInk : t.text3,
                      fontFamily: "var(--font-display)",
                      lineHeight: 1.2,
                      transition: "color 0.15s ease",
                    }}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
