"use client";

import { FileJson, TableProperties, FileDown } from "lucide-react";
import type { T } from "@/app/(app)/dashboard/dashboard-constants";
import type { Sub } from "@/app/(app)/dashboard/dashboard-types";
import {
  exportSubscriptionsJSON,
  exportSubscriptionsCSV,
  exportSubscriptionsPDF,
} from "@/lib/export";

export function ExportView({
  t,
  subs,
  toast,
}: {
  t: T;
  subs: Sub[];
  toast: (m: string, tp: "success" | "error" | "info" | "warning") => void;
}) {
  const options = [
    {
      title: "JSON",
      label: "JSON Export",
      desc: "Full structured export with all fields and metadata. Ideal for backup or importing into another tool.",
      Icon: FileJson,
      action: () => {
        try {
          exportSubscriptionsJSON(subs);
          toast("Exported as JSON", "success");
        } catch {
          toast("JSON export failed. Please try again.", "error");
        }
      },
    },
    {
      title: "CSV",
      label: "CSV Export",
      desc: "Spreadsheet-compatible export with all columns. Opens directly in Excel, Google Sheets, or Numbers.",
      Icon: TableProperties,
      action: () => {
        try {
          exportSubscriptionsCSV(subs);
          toast("Exported as CSV", "success");
        } catch {
          toast("CSV export failed. Please try again.", "error");
        }
      },
    },
    {
      title: "PDF",
      label: "PDF Export",
      desc: "Print-ready document with a summary table and spending overview. Use your browser's Save as PDF option.",
      Icon: FileDown,
      action: () => {
        try {
          exportSubscriptionsPDF(subs);
          toast("PDF preview opened use Save as PDF to export.", "info");
        } catch {
          toast("PDF export failed. Please try again.", "error");
        }
      },
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: t.text, letterSpacing: -0.5 }}>
          Export Data
        </h2>
        <p style={{ fontSize: 11.5, color: t.text3, fontFamily: "var(--font-mono)", marginTop: 3, lineHeight: 1.5 }}>
          Download your subscription data in multiple formats
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
        {options.map((opt) => (
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
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: t.greenDim, border: `1px solid ${t.greenBorder}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <opt.Icon size={20} color={t.green} strokeWidth={1.5} aria-hidden="true" />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 7 }}>
                {opt.label}
              </div>
              <div style={{ fontSize: 12.5, color: t.text2, fontFamily: "var(--font-mono)", lineHeight: 1.65 }}>
                {opt.desc}
              </div>
            </div>

            <button
              onClick={opt.action}
              disabled={subs.length === 0}
              aria-label={opt.label}
              style={{
                background: subs.length === 0 ? t.surface2 : t.green,
                color: subs.length === 0 ? t.text3 : "#000",
                border: "none",
                borderRadius: 8,
                padding: "10px 0",
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "var(--font-display)",
                cursor: subs.length === 0 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                transition: "background 0.2s",
                boxShadow: subs.length === 0 ? "none" : `0 2px 8px ${t.green}44`,
              }}
              onMouseEnter={(e) => {
                if (subs.length > 0) (e.currentTarget as HTMLElement).style.background = t.green2;
              }}
              onMouseLeave={(e) => {
                if (subs.length > 0) (e.currentTarget as HTMLElement).style.background = t.green;
              }}
            >
              <FileDown size={13} aria-hidden="true" />
              Export {opt.title}
            </button>
          </div>
        ))}
      </div>

      {subs.length === 0 && (
        <div style={{
          background: t.surface,
          border: `1px solid ${t.border}`,
          borderRadius: 12,
          padding: "28px 24px",
          textAlign: "center",
          color: t.text3,
          fontFamily: "var(--font-mono)",
          fontSize: 13,
        }}>
          No subscriptions to export yet.
        </div>
      )}
    </div>
  );
}
