"use client";

import { FileText, BarChart3, Download } from "lucide-react";
import type { T } from "@/app/(app)/dashboard/dashboard-constants";
import type { Sub } from "@/app/(app)/dashboard/dashboard-types";

export function ExportView({
  t,
  subs,
  toast,
}: {
  t: T;
  subs: Sub[];
  toast: (m: string, tp: "success" | "error" | "info") => void;
}) {
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(subs, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subsight-subscriptions.json";
    a.click();
    toast("Exported as JSON", "success");
  };

  const exportCSV = () => {
    const headers = [
      "Name", "Category", "Amount", "Currency", "Cycle",
      "NextDate", "Status", "AutoRenew", "Provider",
    ];
    const rows = subs.map((s) =>
      [
        s.name, s.category, s.amount, s.currency, s.cycle,
        s.nextDate || "", s.status, s.autoRenew, s.provider,
      ].join(","),
    );
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subsight-subscriptions.csv";
    a.click();
    toast("Exported as CSV", "success");
  };

  const exportPDF = () => {
    window.print();
    toast("PDF export triggered  check print dialog", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
          Export Data
        </h2>
        <p
          style={{
            fontSize: 11.5,
            color: t.text3,
            fontFamily: "var(--font-mono)",
            marginTop: 3,
          }}
        >
          Download your subscription data in multiple formats
        </p>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))",
          gap: 16,
        }}
      >
        {[
          {
            title: "JSON Export",
            desc: "Full data with all fields and metadata. Ideal for backup or migrating to another tool.",
            Icon: FileText,
            action: exportJSON,
            shortcut: "Ctrl+E",
          },
          {
            title: "CSV Export",
            desc: "Spreadsheet-compatible. Open directly in Excel, Google Sheets, or Numbers.",
            Icon: BarChart3,
            action: exportCSV,
            shortcut: "Ctrl+S",
          },
          {
            title: "PDF Export",
            desc: "Print-ready document with a clean summary of all your subscriptions.",
            Icon: Download,
            action: exportPDF,
            shortcut: "Ctrl+P",
          },
        ].map((opt) => (
          <div
            key={opt.title}
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: 12,
              padding: "24px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: t.greenDim,
                  border: `1px solid ${t.greenBorder}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <opt.Icon size={18} color={t.green} strokeWidth={1.5} />
              </div>
              <span
                style={{
                  fontSize: 10,
                  color: t.text3,
                  background: t.surface2,
                  border: `1px solid ${t.border}`,
                  borderRadius: 5,
                  padding: "3px 8px",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {opt.shortcut}
              </span>
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 15,
                  fontWeight: 700,
                  color: t.text,
                  marginBottom: 7,
                }}
              >
                {opt.title}
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: t.text2,
                  fontFamily: "var(--font-mono)",
                  lineHeight: 1.65,
                }}
              >
                {opt.desc}
              </div>
            </div>
            <button
              onClick={opt.action}
              style={{
                background: t.green,
                color: "#000",
                border: "none",
                borderRadius: 8,
                padding: "11px",
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "var(--font-display)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background = t.green2)
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background = t.green)
              }
            >
              <Download size={13} /> {opt.title.split(" ")[0]}
            </button>
          </div>
        ))}
      </div>
      <div
        style={{
          background: t.surface,
          border: `1px solid ${t.border}`,
          borderRadius: 12,
          padding: "22px",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: t.text,
            fontFamily: "var(--font-display)",
            marginBottom: 16,
          }}
        >
          Keyboard Shortcuts
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            ["Ctrl + E", "Export JSON"],
            ["Ctrl + S", "Export CSV"],
            ["Ctrl + P", "Export PDF"],
            ["Ctrl + A", "Add New Subscription"],
          ].map(([k, v]) => (
            <div
              key={k}
              style={{ display: "flex", alignItems: "center", gap: 14 }}
            >
              <kbd
                style={{
                  background: t.surface2,
                  border: `1px solid ${t.border2}`,
                  borderRadius: 5,
                  padding: "4px 10px",
                  fontSize: 11,
                  color: t.text,
                  fontFamily: "var(--font-mono)",
                  whiteSpace: "nowrap",
                }}
              >
                {k}
              </kbd>
              <span
                style={{
                  fontSize: 12,
                  color: t.text2,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {v}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
