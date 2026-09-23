"use client";

import { useState } from "react";
import {
  Sparkles, Copy, Check, RefreshCw, DollarSign, CreditCard,
  AlertTriangle, Target, Download, AlertCircle,
} from "lucide-react";
import type { T } from "@/app/(app)/dashboard/dashboard-constants";
import type { Sub } from "@/app/(app)/dashboard/dashboard-types";
import { fetchWithTimeout } from "@/lib/fetch-client";

export function AISummaryView({ t, subs }: { t: T; subs: Sub[] }) {
  const [loading, setLoading]   = useState(false);
  const [summary, setSummary]   = useState<string | null>(null);
  const [copied, setCopied]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const monthly  = subs.filter((s) => s.status === "active").reduce((a, s) => a + s.amount, 0);
  const dueSoon  = subs.filter((s) => s.status === "warning" || s.status === "renewal_passed").length;
  const activeCt = subs.filter((s) => s.status === "active").length;

  const generate = async () => {
    if (subs.length === 0) {
      setError("Add some subscriptions first to generate an AI summary.");
      return;
    }
    setLoading(true);
    setError(null);
    setProgress(0);

    // Simulate progress ticks while the AI call runs
    const ticker = setInterval(() => setProgress((p) => Math.min(p + 8, 90)), 500);

    try {
      const payload = subs
        .filter((s) => s.status === "active")
        .map((s) => ({ name: s.name, amount: s.amount, billingCycle: s.cycle, category: s.category }));
      const res = await fetchWithTimeout("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptions: payload }),
        timeoutMs: 55_000,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate summary");
      }
      const data = await res.json();
      setProgress(100);
      setSummary(data.summary);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "AI service unavailable. Please try again later.");
    } finally {
      clearInterval(ticker);
      setTimeout(() => setProgress(0), 600);
      setLoading(false);
    }
  };

  const copy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    if (!summary) return;
    const blob = new Blob([summary], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "subsight-ai-summary.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderSummary = (text: string) =>
    text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
      i % 2 === 0
        ? part
        : <strong key={i} style={{ color: t.text, fontWeight: 700 }}>{part}</strong>,
    );

  const statCards = [
    { Icon: DollarSign,  label: "Monthly Total",    value: `$${monthly.toFixed(2)}`,        col: t.green,  bg: t.greenDim },
    { Icon: CreditCard,  label: "Active Subs",       value: String(activeCt),                col: t.blue,   bg: t.blueDim },
    { Icon: AlertTriangle, label: "Due Soon",        value: `${dueSoon} sub${dueSoon !== 1 ? "s" : ""}`, col: dueSoon > 0 ? t.red : t.text3, bg: dueSoon > 0 ? t.redDim : t.surface2 },
    { Icon: Target,      label: "Annual Projected",  value: `$${(monthly * 12).toFixed(0)}`, col: t.amber,  bg: t.amberDim },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: t.text, letterSpacing: -0.5 }}>
            AI Summary
          </h2>
          <p style={{ fontSize: 11.5, color: t.text3, fontFamily: "var(--font-mono)", marginTop: 3, lineHeight: 1.5 }}>
            AI-powered spending insights powered by Groq Llama
          </p>
        </div>

        {/* Generate button with progress bar */}
        <div style={{ position: "relative" }}>
          <button
            onClick={generate}
            disabled={loading}
            aria-label="Generate AI spending summary"
            style={{
              background: t.green, color: "#000", border: "none",
              borderRadius: 9, padding: "11px 20px",
              fontSize: 13, fontWeight: 700, fontFamily: "var(--font-display)",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 7,
              opacity: loading ? 0.85 : 1,
              transition: "background 0.2s",
              overflow: "hidden",
              position: "relative",
              boxShadow: `0 2px 10px ${t.green}44`,
              minWidth: 160,
              justifyContent: "center",
            }}
            onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.background = t.green2; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = t.green; }}
          >
            {/* Progress bar inside button */}
            {loading && progress > 0 && (
              <span
                style={{
                  position: "absolute", bottom: 0, left: 0,
                  height: 3, width: `${progress}%`,
                  background: "rgba(0,0,0,0.3)",
                  transition: "width 0.4s ease",
                  borderRadius: 2,
                }}
              />
            )}
            {loading
              ? <><RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} /> Analyzing…</>
              : <><Sparkles size={13} /> Generate Summary</>
            }
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(185px,1fr))", gap: 13 }}>
        {statCards.map((card) => (
          <div
            key={card.label}
            style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: "18px 20px" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: card.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <card.Icon size={14} color={card.col} strokeWidth={1.5} aria-hidden="true" />
              </div>
              <span style={{ fontSize: 10.5, color: t.text3, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", lineHeight: 1.4 }}>
                {card.label}
              </span>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: t.text }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          style={{
            background: t.redDim, border: `1px solid ${t.red}44`,
            borderRadius: 10, padding: "13px 16px",
            fontSize: 13, color: t.red, fontFamily: "var(--font-mono)",
            display: "flex", alignItems: "flex-start", gap: 9, lineHeight: 1.5,
          }}
        >
          <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          {error}
        </div>
      )}

      {/* Loading shimmer placeholder */}
      {loading && !summary && (
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: "24px 26px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Sparkles size={14} color={t.green} />
            <span style={{ fontSize: 13, fontWeight: 700, color: t.text, fontFamily: "var(--font-display)" }}>
              Analyzing your subscriptions…
            </span>
          </div>
          {[100, 85, 92, 70, 78].map((w, i) => (
            <div
              key={i}
              style={{
                height: 12, borderRadius: 6, width: `${w}%`,
                background: `linear-gradient(90deg,${t.surface2} 25%,${t.surface3} 50%,${t.surface2} 75%)`,
                backgroundSize: "200% 100%",
                animation: `shimmer 1.4s infinite linear ${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Summary output */}
      {summary && !loading && (
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: "24px 26px", animation: "fadeIn 0.3s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <Sparkles size={14} color={t.green} />
            <span style={{ fontSize: 13, fontWeight: 700, color: t.text, fontFamily: "var(--font-display)" }}>
              AI Analysis
            </span>
            <span style={{ fontSize: 10, color: t.text3, fontFamily: "var(--font-mono)", marginLeft: "auto" }}>
              Powered by Groq AI
            </span>
          </div>
          <div style={{ fontSize: 13.5, color: t.text2, fontFamily: "var(--font-mono)", lineHeight: 1.85, whiteSpace: "pre-wrap" }}>
            {renderSummary(summary)}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
            <button
              onClick={copy}
              aria-label="Copy summary to clipboard"
              style={{
                background: t.surface2, border: `1px solid ${t.border2}`, borderRadius: 7,
                padding: "8px 14px", fontSize: 12, color: t.text2, cursor: "pointer",
                fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", gap: 6,
                transition: "all 0.15s",
              }}
            >
              {copied ? <><Check size={12} color={t.green} /> Copied!</> : <><Copy size={12} /> Copy</>}
            </button>
            <button
              onClick={download}
              aria-label="Download summary as text file"
              style={{
                background: t.surface2, border: `1px solid ${t.border2}`, borderRadius: 7,
                padding: "8px 14px", fontSize: 12, color: t.text2, cursor: "pointer",
                fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", gap: 6,
                transition: "all 0.15s",
              }}
            >
              <Download size={12} /> Download
            </button>
            <button
              onClick={generate}
              aria-label="Regenerate AI summary"
              style={{
                background: t.surface2, border: `1px solid ${t.border2}`, borderRadius: 7,
                padding: "8px 14px", fontSize: 12, color: t.text2, cursor: "pointer",
                fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", gap: 6,
                transition: "all 0.15s",
              }}
            >
              <RefreshCw size={12} /> Regenerate
            </button>
          </div>
        </div>
      )}

      {/* Empty placeholder */}
      {!summary && !loading && !error && (
        <div style={{ background: t.surface, border: `1px dashed ${t.border2}`, borderRadius: 12, padding: "52px 24px", textAlign: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: t.greenDim, border: `1px solid ${t.greenBorder}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Sparkles size={22} color={t.green} strokeWidth={1.5} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: t.text2, fontFamily: "var(--font-display)", marginBottom: 8 }}>
            No summary yet
          </div>
          <div style={{ fontSize: 13, color: t.text3, fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>
            Click <strong style={{ color: t.green }}>Generate Summary</strong> to get personalized spending insights from AI
          </div>
        </div>
      )}
    </div>
  );
}
