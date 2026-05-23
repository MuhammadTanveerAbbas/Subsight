"use client";

import { useState } from "react";
import {
  Sparkles, Copy, Check, RefreshCw, DollarSign, CreditCard,
  AlertTriangle, Target, Download,
} from "lucide-react";
import type { T } from "@/app/(app)/dashboard/dashboard-constants";
import type { Sub } from "@/app/(app)/dashboard/dashboard-types";

export function AISummaryView({ t, subs }: { t: T; subs: Sub[] }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const monthly = subs
    .filter((s) => s.status === "active")
    .reduce((a, s) => a + s.amount, 0);
  const dueSoon = subs.filter(
    (s) => s.status === "warning" || s.status === "renewal_passed",
  ).length;

  const generate = async () => {
    if (subs.length === 0) {
      setError("Add some subscriptions first to generate an AI summary.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = subs
        .filter((s) => s.status === "active")
        .map((s) => ({
          name: s.name,
          amount: s.amount,
          billingCycle: s.cycle,
          category: s.category,
        }));
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptions: payload }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate summary");
      }
      const data = await res.json();
      setSummary(data.summary);
    } catch (err: any) {
      setError(
        err.message || "AI service unavailable. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const download = () => {
    if (!summary) return;
    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subsight-ai-summary.txt";
    a.click();
  };

  const renderSummary = (text: string) =>
    text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
      i % 2 === 0 ? (
        part
      ) : (
        <strong key={i} style={{ color: t.text, fontWeight: 700 }}>
          {part}
        </strong>
      ),
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              fontWeight: 800,
              color: t.text,
              letterSpacing: -0.5,
            }}
          >
            AI Summary
          </h2>
          <p
            style={{
              fontSize: 11.5,
              color: t.text3,
              fontFamily: "var(--font-mono)",
              marginTop: 3,
            }}
          >
            AI-powered spending insights via Groq · Llama 3.3 70B
          </p>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          style={{
            background: t.green,
            color: "#000",
            border: "none",
            borderRadius: 9,
            padding: "11px 20px",
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "var(--font-display)",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 7,
            opacity: loading ? 0.75 : 1,
            transition: "background 0.2s",
          }}
        >
          {loading ? (
            <>
              <RefreshCw
                size={13}
                style={{ animation: "spin 1s linear infinite" }}
              />{" "}
              Analyzing…
            </>
          ) : (
            <>
              <Sparkles size={13} /> Generate Summary
            </>
          )}
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(195px,1fr))",
          gap: 13,
        }}
      >
        {[
          {
            Icon: DollarSign,
            label: "Monthly Total",
            value: `$${monthly.toFixed(2)}`,
            col: t.green,
            bg: t.greenDim,
          },
          {
            Icon: CreditCard,
            label: "Active Subs",
            value: `${subs.filter((s) => s.status === "active").length}`,
            col: t.blue,
            bg: t.blueDim,
          },
          {
            Icon: AlertTriangle,
            label: "Due Soon",
            value: `${dueSoon} sub${dueSoon !== 1 ? "s" : ""}`,
            col: dueSoon > 0 ? t.red : t.text3,
            bg: dueSoon > 0 ? t.redDim : t.surface2,
          },
          {
            Icon: Target,
            label: "Annual Projected",
            value: `$${(monthly * 12).toFixed(0)}`,
            col: t.amber,
            bg: t.amberDim,
          },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: 12,
              padding: "18px 20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: card.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <card.Icon size={14} color={card.col} strokeWidth={1.5} />
              </div>
              <span
                style={{
                  fontSize: 10.5,
                  color: t.text3,
                  fontFamily: "var(--font-mono)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {card.label}
              </span>
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 22,
                fontWeight: 800,
                color: t.text,
              }}
            >
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div
          style={{
            background: t.redDim,
            border: `1px solid ${t.red}44`,
            borderRadius: 10,
            padding: "14px 18px",
            fontSize: 13,
            color: t.red,
            fontFamily: "var(--font-mono)",
          }}
        >
          {error}
        </div>
      )}

      {summary ? (
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 12,
            padding: "24px 26px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 18,
            }}
          >
            <Sparkles size={14} color={t.green} />
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: t.text,
                fontFamily: "var(--font-display)",
              }}
            >
              AI Analysis
            </span>
            <span
              style={{
                fontSize: 10,
                color: t.text3,
                fontFamily: "var(--font-mono)",
                marginLeft: "auto",
              }}
            >
              Powered by Groq · Llama 3.3 70B
            </span>
          </div>
          <div
            style={{
              fontSize: 13.5,
              color: t.text2,
              fontFamily: "var(--font-mono)",
              lineHeight: 1.82,
              whiteSpace: "pre-wrap",
            }}
          >
            {renderSummary(summary)}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button
              onClick={copy}
              style={{
                background: t.surface2,
                border: `1px solid ${t.border2}`,
                borderRadius: 7,
                padding: "8px 14px",
                fontSize: 12,
                color: t.text2,
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {copied ? (
                <>
                  <Check size={12} color={t.green} /> Copied!
                </>
              ) : (
                <>
                  <Copy size={12} /> Copy
                </>
              )}
            </button>
            <button
              onClick={download}
              style={{
                background: t.surface2,
                border: `1px solid ${t.border2}`,
                borderRadius: 7,
                padding: "8px 14px",
                fontSize: 12,
                color: t.text2,
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Download size={12} /> Download
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            background: t.surface,
            border: `1px dashed ${t.border2}`,
            borderRadius: 12,
            padding: "52px 24px",
            textAlign: "center",
          }}
        >
          <Sparkles size={28} color={t.text3} style={{ marginBottom: 14 }} />
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: t.text2,
              fontFamily: "var(--font-display)",
              marginBottom: 8,
            }}
          >
            No summary yet
          </div>
          <div
            style={{
              fontSize: 13,
              color: t.text3,
              fontFamily: "var(--font-mono)",
            }}
          >
            Click &quot;Generate Summary&quot; to get personalized spending insights
          </div>
        </div>
      )}
    </div>
  );
}
