"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useSubscriptions } from "@/contexts/subscription-context";
import { useToast } from "@/hooks/use-toast";
import { applyTokens } from "@/lib/design-tokens";
import {
  Sun, Moon, Menu, X, RefreshCw, Plus, ChevronLeft, ChevronRight,
  LayoutDashboard, CreditCard, BarChart3, Sparkles, Download,
  Settings, User, Receipt,
} from "lucide-react";
import {
  DARK, LIGHT, NAV_MAIN, NAV_BOTTOM,
  type TK, type Sub, type SubStatus,
} from "./dashboard-constants";

const VALID_TABS = new Set([
  ...NAV_MAIN.map((n) => n.id),
  ...NAV_BOTTOM.map((n) => n.id),
]);

import { OverviewView }  from "./views/overview-view";
import { SubsView }      from "./views/subs-view";
import { AnalyticsView } from "./views/analytics-view";
import { AISummaryView } from "./views/ai-summary-view";
import { AddView }       from "./views/add-view";
import { ExportView }    from "./views/export-view";
import { SettingsView }  from "./views/settings-view";
import { ProfileView }   from "./views/profile-view";
import BillingPage       from "./billing/page";

/* ── Icon map used by sidebar links ───────────────────────────────────── */
const ICON_MAP: Record<string, React.ElementType> = {
  overview:      LayoutDashboard,
  subscriptions: CreditCard,
  analytics:     BarChart3,
  "ai-summary":  Sparkles,
  add:           Plus,
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

function LoadingSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Skeleton w="55%" h={10} />
              <Skeleton w={32} h={32} r={8} />
            </div>
            <Skeleton w="40%" h={28} r={6} />
            <Skeleton w="65%" h={10} />
          </div>
        ))}
      </div>
      {/* Chart row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "22px", height: 260, display: "flex", flexDirection: "column", gap: 14 }}>
          <Skeleton w="35%" h={14} />
          <Skeleton w="100%" h={180} r={8} />
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "22px", height: 260, display: "flex", flexDirection: "column", gap: 14 }}>
          <Skeleton w="55%" h={14} />
          <Skeleton w="100%" h={140} r={8} />
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
  const [themeKey, setThemeKey] = useState<TK>("dark");
  const [active, setActive] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSB, setMobileSB] = useState(false);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t = themeKey === "dark" ? DARK : LIGHT;

  const loading = authLoading || subsLoading;

  /* ── Theme: read from localStorage then apply tokens ──────────────── */
  useEffect(() => {
    const stored = (localStorage.getItem("subsight-theme") || "dark") as TK;
    setThemeKey(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem("subsight-theme", themeKey);
    applyTokens(themeKey);
  }, [themeKey]);

  /* ── Map Supabase subscriptions ➜ local Sub shape ─────────────────── */
  useEffect(() => {
    if (!subscriptions || subscriptions.length === 0) { setSubs([]); return; }
    const mappedSubs = subscriptions.map((s) => ({
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
    }));
    setSubs(mappedSubs);
  }, [subscriptions]);

  /* ── URL param handling ───────────────────────────────────────────── */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && VALID_TABS.has(tab)) setActive(tab);
    if (params.get("upgraded") === "true") showToast("All features are now unlocked enjoy!", "success");
    if (tab || params.get("upgraded") === "true") window.history.replaceState({}, "", "/dashboard");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Global keyboard shortcuts ────────────────────────────────────── */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "e") { e.preventDefault(); setActive("export"); }
        if (e.key === "s") { e.preventDefault(); setActive("export"); }
        if (e.key === "a") { e.preventDefault(); setActive("add"); }
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
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
    (msg: string, type: "success" | "error" | "info" = "success") => {
      const variant = type === "error" ? "destructive" as const : undefined;
      shadcnToast({
        title: type === "success" ? "Success" : type === "error" ? "Error" : "Info",
        description: msg,
        variant,
      });
    },
    [shadcnToast],
  );

  const navTo = useCallback((id: string) => {
    setActive(id);
    setMobileSB(false);
  }, []);

  const SBW = collapsed ? 64 : 228;

  /* ── Professional Sidebar Link ────────────────────────────────────── */
  const SidebarLink = ({
    id, label, Icon, section,
  }: {
    id: string; label: string; Icon: React.ElementType; section: "main" | "bottom";
  }) => {
    const isActive = active === id;
    const isHovered = hoveredNav === id;

    return (
      <div style={{ position: "relative" }}>
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
          title={collapsed ? label : undefined}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: collapsed ? "10px 0" : "9px 12px",
            paddingLeft: collapsed ? 0 : 12,
            justifyContent: collapsed ? "center" : "flex-start",
            background: isActive
              ? `linear-gradient(90deg, ${t.greenDim} 0%, transparent 100%)`
              : isHovered
              ? t.surface2
              : "transparent",
            borderLeft: isActive ? `2px solid ${t.green}` : "2px solid transparent",
            cursor: "pointer",
            color: isActive ? t.green : isHovered ? t.text : t.text2,
            transition: "all 0.18s ease",
            borderRadius: collapsed ? 0 : "0 10px 10px 0",
            marginRight: collapsed ? 0 : 8,
            position: "relative",
            outline: "none",
          }}
        >
          {/* Icon with enhanced styling */}
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 30,
              height: 30,
              borderRadius: 8,
              background: isActive ? t.greenDim : isHovered ? t.surface3 : "transparent",
              border: isActive ? `1.5px solid ${t.green}` : isHovered ? `1px solid ${t.border2}` : "1px solid transparent",
              transition: "all 0.18s ease",
              flexShrink: 0,
              filter: isActive ? `drop-shadow(0 0 6px ${t.green}66)` : "none",
            }}
          >
            <Icon
              size={15}
              strokeWidth={isActive ? 2.2 : 1.6}
              style={{ transition: "all 0.18s ease" }}
            />
          </span>

          {/* Label */}
          {!collapsed && (
            <span
              style={{
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                whiteSpace: "nowrap",
                fontFamily: "var(--font-display)",
                letterSpacing: isActive ? -0.1 : 0,
                transition: "all 0.18s ease",
              }}
            >
              {label}
            </span>
          )}
        </button>

        {/* Tooltip for collapsed mode */}
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
              boxShadow: `0 4px 24px ${t.shadow}`,
              pointerEvents: "none",
            }}
          >
            {label}
            {/* Arrow */}
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
    if (loading) return <LoadingSkeleton />;
    switch (active) {
      case "overview":      return <OverviewView t={t} subs={subs} onNav={navTo} />;
      case "subscriptions": return <SubsView t={t} subs={subs} setSubs={setSubs} onAdd={() => navTo("add")} toast={showToast} />;
      case "analytics":     return <AnalyticsView t={t} subs={subs} />;
      case "ai-summary":    return <AISummaryView t={t} subs={subs} />;
      case "add":           return <AddView t={t} onSuccess={async () => { await refetchSubscriptions(); navTo("subscriptions"); }} toast={showToast} />;
      case "export":        return <ExportView t={t} subs={subs} toast={showToast} />;
      case "settings":      return <SettingsView t={t} toast={showToast} />;
      case "billing":       return <BillingPage />;
      case "profile":       return <ProfileView t={t} toast={showToast} />;
      default:              return <OverviewView t={t} subs={subs} onNav={navTo} />;
    }
  };

  const activeMonthly = subs.filter((s) => s.status === "active").reduce((a, s) => a + s.amount, 0);
  const activeLabel = NAV_MAIN.find((n) => n.id === active)?.label
    || NAV_BOTTOM.find((n) => n.id === active)?.label
    || "Dashboard";

  /* ── Shared sidebar inner content ─────────────────────────────────── */
  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {/* Logo / Brand */}
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          padding: collapsed && !mobile ? "0" : "0 16px",
          justifyContent: collapsed && !mobile ? "center" : "flex-start",
          gap: 10,
          borderBottom: `1px solid ${t.border}`,
          flexShrink: 0,
          position: "relative",
        }}
      >
        <img
          src="/icon.svg"
          alt="Subsight"
          width={36}
          height={36}
          style={{
            display: "block",
            borderRadius: 10,
            flexShrink: 0,
            boxShadow: `0 4px 16px ${t.greenGlow}`,
          }}
        />
        {(!collapsed || mobile) && (
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 18,
              fontWeight: 800,
              color: t.text,
              letterSpacing: -0.6,
              whiteSpace: "nowrap",
              background: `linear-gradient(135deg, ${t.green} 0%, ${t.green2} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Subsight
          </span>
        )}
        {mobile && (
          <button
            onClick={() => setMobileSB(false)}
            style={{ marginLeft: "auto", background: "none", border: "none", color: t.text3, cursor: "pointer", padding: 4 }}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Main nav */}
      <nav style={{ flex: 1, padding: "10px 0", overflowY: "auto", overflowX: "hidden" }} role="navigation" aria-label="Main navigation">
        {!collapsed && !mobile && (
          <div
            style={{
              fontSize: 9.5,
              fontWeight: 600,
              color: t.text3,
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "6px 16px 8px",
            }}
          >
            Menu
          </div>
        )}
        {NAV_MAIN.map((item) => (
          <SidebarLink key={item.id} section="main" {...item} />
        ))}
      </nav>

      {/* Bottom nav */}
      <div
        style={{
          padding: "10px 0",
          borderTop: `1px solid ${t.border}`,
          flexShrink: 0,
        }}
      >
        {!collapsed && !mobile && (
          <div
            style={{
              fontSize: 9.5,
              fontWeight: 600,
              color: t.text3,
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "6px 16px 8px",
            }}
          >
            Account
          </div>
        )}
        {NAV_BOTTOM.map((item) => (
          <SidebarLink key={item.id} section="bottom" {...item} />
        ))}
      </div>



      {/* Collapse toggle desktop only */}
      {!mobile && (
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            position: "absolute",
            bottom: 100,
            right: -12,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: t.surface,
            border: `1px solid ${t.border2}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: t.text3,
            transition: "all 0.2s",
            zIndex: 10,
            boxShadow: `0 2px 8px ${t.shadow}`,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = t.green;
            (e.currentTarget as HTMLElement).style.borderColor = t.greenBorder;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = t.text3;
            (e.currentTarget as HTMLElement).style.borderColor = t.border2;
          }}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      )}
    </>
  );

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
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        a{color:inherit;text-decoration:none}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:var(--border2);border-radius:4px}
        *{scrollbar-width:thin;scrollbar-color:var(--border2) transparent}
        input,select,textarea{color-scheme:${themeKey};font-family:var(--font-mono),'Courier New',monospace}
        button:focus-visible{outline:2px solid var(--green);outline-offset:2px}
        a:focus-visible{outline:2px solid var(--green);outline-offset:2px}
        .sidebar-desk{display:flex!important}
        .mob-sb-btn{display:none!important}
        @media(max-width:768px){
          .sidebar-desk{display:none!important}
          .mob-sb-btn{display:flex!important}
          .main-content-wrap{margin-left:0!important;width:100%!important}
          .main-pad{padding:16px!important}
          .add-grid{grid-template-columns:1fr!important}
          .header-pad{padding:0 16px!important}
          .email-verify-banner{display:none!important}
        }
        @media(max-width:640px){
          .kpi-grid{grid-template-columns:1fr 1fr!important}
          .chart-2col{grid-template-columns:1fr!important}
          .ana-2col{grid-template-columns:1fr!important}
          .add-inner-grid{grid-template-columns:1fr!important}
          .billing-stat-grid{grid-template-columns:1fr!important}
        }
        @media(max-width:480px){
          .kpi-grid{grid-template-columns:1fr!important}
          .main-pad{padding:12px!important}
        }
      `}</style>

      {/* ── Desktop Sidebar ──────────────────────────────────────────── */}
      <aside
        className="sidebar-desk"
        style={{
          width: SBW,
          minHeight: "100vh",
          background: themeKey === "dark"
            ? "linear-gradient(180deg, #0c0c0e 0%, #0a0a0c 100%)"
            : "linear-gradient(180deg, #f0f0ee 0%, #eaeae8 100%)",
          borderRight: `1px solid ${t.border}`,
          flexDirection: "column",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 50,
          transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
          overflow: "visible",
          flexShrink: 0,
          display: "flex",
        }}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Overlay ───────────────────────────────────── */}
      {mobileSB && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 200 }}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
            onClick={() => setMobileSB(false)}
          />
          <aside
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 240,
              background: themeKey === "dark"
                ? "linear-gradient(180deg, #0c0c0e 0%, #0a0a0c 100%)"
                : "linear-gradient(180deg, #f0f0ee 0%, #eaeae8 100%)",
              borderRight: `1px solid ${t.border}`,
              display: "flex",
              flexDirection: "column",
              zIndex: 201,
              boxShadow: `4px 0 32px ${t.shadow}`,
              animation: "slideUp 0.2s ease",
            }}
          >
            <SidebarContent mobile />
          </aside>
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
          transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
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
            background: themeKey === "dark"
              ? "rgba(8,8,10,0.92)"
              : "rgba(248,248,246,0.92)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            position: "sticky",
            top: 0,
            zIndex: 40,
            flexShrink: 0,
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            {/* Mobile menu button */}
            <button
              className="mob-sb-btn"
              onClick={() => setMobileSB(true)}
              aria-label="Open navigation menu"
              style={{
                background: "none",
                border: "none",
                color: t.text2,
                cursor: "pointer",
                display: "none",
                alignItems: "center",
                flexShrink: 0,
                padding: 4,
                borderRadius: 6,
              }}
            >
              <Menu size={20} />
            </button>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 15,
                  fontWeight: 700,
                  color: t.text,
                  letterSpacing: -0.3,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {activeLabel}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: t.text3,
                  fontFamily: "var(--font-mono)",
                  marginTop: 1,
                  lineHeight: 1.4,
                }}
              >
                {subs.filter((s) => s.status === "active").length} active ·{" "}
                <span style={{ color: t.green }}>${activeMonthly.toFixed(2)}/mo</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {/* Email verify banner */}
            {user && !user.emailConfirmed && (
              <div
                className="email-verify-banner"
                style={{
                  fontSize: 11,
                  color: t.amber,
                  background: t.amberDim,
                  border: `1px solid ${t.amber}44`,
                  borderRadius: 8,
                  padding: "7px 12px",
                  fontFamily: "var(--font-mono)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  lineHeight: 1.4,
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
                    background: "none",
                    border: "none",
                    color: t.amber,
                    textDecoration: "underline",
                    cursor: emailSent ? "default" : "pointer",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    opacity: emailSent ? 0.7 : 1,
                  }}
                >
                  {emailSent ? "Sent ✓" : "Resend"}
                </button>
              </div>
            )}

            {/* Theme toggle */}
            <button
              onClick={() => setThemeKey(themeKey === "dark" ? "light" : "dark" as TK)}
              aria-label={`Switch to ${themeKey === "dark" ? "light" : "dark"} mode`}
              style={{
                width: 34,
                height: 34,
                border: `1px solid ${t.border2}`,
                borderRadius: 9,
                background: t.surface2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
            >
              {themeKey === "dark"
                ? <Sun size={14} color={t.text2} />
                : <Moon size={14} color={t.text2} />}
            </button>

            {/* Add button */}
            <button
              onClick={() => navTo("add")}
              aria-label="Add new subscription"
              style={{
                background: t.green,
                color: "#000",
                border: "none",
                borderRadius: 9,
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "var(--font-display)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                flexShrink: 0,
                whiteSpace: "nowrap",
                transition: "background 0.2s, transform 0.1s",
                boxShadow: `0 2px 8px ${t.green}44`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = t.green2;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = t.green;
              }}
            >
              <Plus size={12} strokeWidth={2.5} /> Add
            </button>
          </div>
        </header>

        {/* Page content */}
        <main
          className="main-pad"
          style={{
            flex: 1,
            padding: "28px",
            overflowY: "auto",
            overflowX: "hidden",
            animation: "fadeIn 0.2s ease",
          }}
          key={active}
        >
          {renderView()}
        </main>
      </div>
    </div>
  );
}
