"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useSubscriptions } from "@/contexts/subscription-context";
import { Sun, Moon, Menu, X, RefreshCw, Plus, Bell, CheckCircle, XCircle } from "lucide-react";
import {
  DARK,
  LIGHT,
  NAV_MAIN,
  NAV_BOTTOM,
  type TK,
  type T,
  type Sub,
  type SubStatus,
} from "./dashboard-constants";
import { OverviewView } from "./views/overview-view";
import { SubsView } from "./views/subs-view";
import { AnalyticsView } from "./views/analytics-view";
import { AISummaryView } from "./views/ai-summary-view";
import { AddView } from "./views/add-view";
import { ExportView } from "./views/export-view";
import { SettingsView } from "./views/settings-view";
import { ProfileView } from "./views/profile-view";
import BillingPage from "./billing/page";

function Toast({
  msg,
  type,
  onClose,
  t,
}: {
  msg: string;
  type: "success" | "error" | "info";
  onClose: () => void;
  t: T;
}) {
  const col = { success: t.green, error: t.red, info: t.blue }[type];
  const Ico = { success: CheckCircle, error: XCircle, info: Bell }[type];
  useEffect(() => {
    const id = setTimeout(onClose, 4000);
    return () => clearTimeout(id);
  }, [onClose]);
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 1000,
        background: t.surface,
        border: `1px solid ${col}44`,
        borderLeft: `3px solid ${col}`,
        borderRadius: 10,
        padding: "13px 17px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: `0 8px 32px ${t.shadow}`,
        animation: "slideUp 0.3s ease",
        maxWidth: 360,
        minWidth: 260,
      }}
    >
      <Ico size={14} color={col} style={{ flexShrink: 0 }} />
      <span
        style={{
          fontSize: 13,
          color: t.text,
          fontFamily: "var(--font-mono)",
          flex: 1,
        }}
      >
        {msg}
      </span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: t.text3,
          cursor: "pointer",
          padding: 2,
          display: "flex",
        }}
      >
        <X size={13} />
      </button>
    </div>
  );
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { subscriptions, loading: subsLoading } = useSubscriptions();
  const [themeKey, setThemeKey] = useState<TK>("dark");
  const [active, setActive] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSB, setMobileSB] = useState(false);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const t = themeKey === "dark" ? DARK : LIGHT;

  const loading = authLoading || subsLoading;

  useEffect(() => {
    const stored = (localStorage.getItem("subsight-theme") || "dark") as TK;
    setThemeKey(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem("subsight-theme", themeKey);
    document.documentElement.setAttribute("data-theme", themeKey);
  }, [themeKey]);

  useEffect(() => {
    if (!subscriptions || subscriptions.length === 0) {
      setSubs([]);
      return;
    }

    // Map context subscriptions to dashboard format
    const mappedSubs = subscriptions.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category || "Other",
      amount: Number(s.amount),
      cycle: s.billingCycle || "Monthly",
      nextDate: s.nextRenewalDate || "",
      status: (s.activeStatus ? "active" : "inactive") as SubStatus,
      autoRenew: s.autoRenew ?? true,
      currency: s.currency || "USD",
      provider: s.provider || "",
      notes: s.notes || "",
    }));

    setSubs(mappedSubs);
  }, [subscriptions]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgraded") === "true") {
      showToast("Welcome to Pro! All features are now unlocked.", "success");
      window.history.replaceState({}, "", "/dashboard");
    }
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "e") {
          e.preventDefault();
          setActive("export");
        }
        if (e.key === "s") {
          e.preventDefault();
          setActive("export");
        }
        if (e.key === "a") {
          e.preventDefault();
          setActive("add");
        }
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const showToast = useCallback(
    (msg: string, type: "success" | "error" | "info" = "success") => {
      setToast({ msg, type });
    },
    [],
  );

  const navTo = useCallback((id: string) => {
    setActive(id);
    setMobileSB(false);
  }, []);

  const SBW = collapsed ? 62 : 226;

  const SidebarLink = ({
    id,
    label,
    Icon,
  }: {
    id: string;
    label: string;
    Icon: React.ElementType;
  }) => {
    const isActive = active === id;
    return (
      <button
        onClick={() => navTo(id)}
        title={collapsed ? label : undefined}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: collapsed ? "11px 0 11px 18px" : "9px 14px",
          background: isActive ? t.greenDim : "transparent",
          borderLeft: isActive
            ? `3px solid ${t.green}`
            : "3px solid transparent",
          border: "none",
          cursor: "pointer",
          color: isActive ? t.green : t.text2,
          transition: "all 0.15s",
        }}
      >
        <Icon
          size={17}
          strokeWidth={isActive ? 2 : 1.5}
          style={{ flexShrink: 0 }}
        />
        {!collapsed && (
          <span
            style={{
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              whiteSpace: "nowrap",
              fontFamily: "var(--font-display)",
            }}
          >
            {label}
          </span>
        )}
      </button>
    );
  };

  const renderView = () => {
    if (loading) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "60vh",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <RefreshCw
            size={24}
            color={t.green}
            style={{ animation: "spin 1s linear infinite" }}
          />
          <span
            style={{
              fontSize: 13,
              color: t.text3,
              fontFamily: "var(--font-mono)",
            }}
          >
            Loading your subscriptions...
          </span>
        </div>
      );
    }
    switch (active) {
      case "overview":
        return <OverviewView t={t} subs={subs} onNav={navTo} />;
      case "subscriptions":
        return (
          <SubsView
            t={t}
            subs={subs}
            setSubs={setSubs}
            onAdd={() => navTo("add")}
            toast={showToast}
          />
        );
      case "analytics":
        return <AnalyticsView t={t} subs={subs} />;
      case "ai-summary":
        return <AISummaryView t={t} subs={subs} />;
      case "add":
        return (
          <AddView
            t={t}
            onSuccess={() => {
              navTo("subscriptions");
            }}
            toast={showToast}
          />
        );
      case "export":
        return <ExportView t={t} subs={subs} toast={showToast} />;
      case "settings":
        return <SettingsView t={t} toast={showToast} />;
      case "billing":
        return <BillingPage />;
      case "profile":
        return <ProfileView t={t} toast={showToast} />;
      default:
        return <OverviewView t={t} subs={subs} onNav={navTo} />;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: t.bg,
        color: t.text,
        fontFamily: "var(--font-display)",
        transition: "background 0.4s, color 0.4s",
      }}
    >
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
          .main-content{margin-left:0!important}
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
          transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
          overflow: "hidden",
          flexShrink: 0,
          display: "flex",
        }}
      >
        <div
          style={{
            height: 62,
            display: "flex",
            alignItems: "center",
            padding: collapsed ? "0 0 0 16px" : "0 18px",
            gap: 9,
            borderBottom: `1px solid ${t.border}`,
            flexShrink: 0,
          }}
        >
          <img
            src="/icon.svg"
            alt="Subsight"
            width={28}
            height={28}
            style={{ borderRadius: 6, flexShrink: 0, display: "block" }}
          />
          {!collapsed && (
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 17,
                fontWeight: 800,
                color: t.text,
                letterSpacing: -0.5,
                whiteSpace: "nowrap",
              }}
            >
              Subsight
            </span>
          )}
        </div>
        <nav style={{ flex: 1, padding: "10px 0", overflowY: "auto" }}>
          {NAV_MAIN.map((item) => (
            <SidebarLink key={item.id} {...item} />
          ))}
        </nav>
        <div
          style={{
            padding: "10px 0",
            borderTop: `1px solid ${t.border}`,
            flexShrink: 0,
          }}
        >
          {NAV_BOTTOM.map((item) => (
            <SidebarLink key={item.id} {...item} />
          ))}
        </div>
      </aside>

      {mobileSB && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
            }}
            onClick={() => setMobileSB(false)}
          />
          <aside
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 236,
              background: t.sidebarBg,
              borderRight: `1px solid ${t.border}`,
              display: "flex",
              flexDirection: "column",
              zIndex: 201,
            }}
          >
            <div
              style={{
                height: 62,
                display: "flex",
                alignItems: "center",
                padding: "0 18px",
                gap: 9,
                borderBottom: `1px solid ${t.border}`,
              }}
            >
              <img
                src="/icon.svg"
                alt="Subsight"
                width={28}
                height={28}
                style={{ borderRadius: 6, display: "block" }}
              />
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 17,
                  fontWeight: 800,
                  color: t.text,
                  letterSpacing: -0.5,
                }}
              >
                Subsight
              </span>
              <button
                onClick={() => setMobileSB(false)}
                style={{
                  marginLeft: "auto",
                  background: "none",
                  border: "none",
                  color: t.text3,
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>
            <nav style={{ flex: 1, padding: "10px 0", overflowY: "auto" }}>
              {NAV_MAIN.map((item) => (
                <SidebarLink key={item.id} {...item} />
              ))}
            </nav>
            <div
              style={{ padding: "10px 0", borderTop: `1px solid ${t.border}` }}
            >
              {NAV_BOTTOM.map((item) => (
                <SidebarLink key={item.id} {...item} />
              ))}
            </div>
          </aside>
        </div>
      )}

      <div
        style={{
          flex: 1,
          marginLeft: SBW,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
        }}
        className="sidebar-desk-offset main-content"
      >
        <header
          style={{
            height: 62,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 28px",
            borderBottom: `1px solid ${t.border}`,
            background: t.navBg,
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            position: "sticky",
            top: 0,
            zIndex: 40,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              className="mob-sb-btn"
              onClick={() => setMobileSB(true)}
              style={{
                background: "none",
                border: "none",
                color: t.text2,
                cursor: "pointer",
                display: "none",
                alignItems: "center",
              }}
            >
              <Menu size={20} />
            </button>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 15,
                  fontWeight: 700,
                  color: t.text,
                  letterSpacing: -0.3,
                }}
              >
                {NAV_MAIN.find((n) => n.id === active)?.label ||
                  NAV_BOTTOM.find((n) => n.id === active)?.label ||
                  "Dashboard"}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: t.text3,
                  fontFamily: "var(--font-mono)",
                  marginTop: 1,
                }}
              >
                {subs.length} subscriptions · $
                {subs
                  .filter((s) => s.status === "active")
                  .reduce((a, s) => a + s.amount, 0)
                  .toFixed(2)}
                /mo
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => {
                const n = themeKey === "dark" ? "light" : ("dark" as TK);
                setThemeKey(n);
              }}
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
              }}
            >
              {themeKey === "dark" ? (
                <Sun size={14} color={t.text2} />
              ) : (
                <Moon size={14} color={t.text2} />
              )}
            </button>
            <button
              onClick={() => navTo("add")}
              style={{
                background: t.green,
                color: "#000",
                border: "none",
                borderRadius: 9,
                padding: "8px 16px",
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "var(--font-display)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Plus size={12} /> Add
            </button>
          </div>
        </header>

        <main
          className="main-pad"
          style={{ flex: 1, padding: "28px", overflowY: "auto" }}
        >
          {renderView()}
        </main>
      </div>

      {toast && (
        <Toast
          msg={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
          t={t}
        />
      )}
    </div>
  );
}
