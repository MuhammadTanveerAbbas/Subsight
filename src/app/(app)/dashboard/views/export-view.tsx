"use client";

import { useEffect, useState } from "react";
import {
  FileJson, TableProperties, FileDown, Wallet, RefreshCw, Plus,
} from "lucide-react";
import type { T } from "@/app/(app)/dashboard/dashboard-constants";
import type { Sub } from "@/app/(app)/dashboard/dashboard-types";
import type { VaultItem } from "@/lib/types";
import { fetchVault } from "@/lib/vault-api";
import {
  exportSubscriptionsJSON,
  exportSubscriptionsCSV,
  exportSubscriptionsPDF,
  exportSubscriptionsICS,
  exportVaultCSV,
  importWallosJSON,
  type ExportFilter,
} from "@/lib/export";
import { createSubscription } from "@/lib/subscriptions-api";

type Toast = (m: string, tp: "success" | "error" | "info" | "warning") => void;

interface FormatOption {
  key: string;
  title: string;
  label: string;
  desc: string;
  Icon: React.ElementType;
  enabled: boolean;
  run: () => Promise<void>;
  success: string;
}

export function ExportView({
  t, subs, toast, onNav,
}: {
  t: T;
  subs: Sub[];
  toast: Toast;
  onNav?: (id: string) => void;
}) {
  const [vault, setVault] = useState<VaultItem[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [preview, setPreview] = useState<Sub[] | null>(null);
  const [importing, setImporting] = useState(false);

  const filter: ExportFilter = {
    category: category || undefined,
    fromDate: fromDate || undefined,
  };

  useEffect(() => {
    let alive = true;
    fetchVault()
      .then((data) => { if (alive) setVault(data.items); })
      .catch(() => { /* subscriptions still export without vault data */ });
    return () => { alive = false; };
  }, []);

  const options: FormatOption[] = [
    {
      key: "json",
      title: "JSON",
      label: "JSON backup",
      desc: "Every field in one structured file, including vault items. Use it to back up or move your data.",
      Icon: FileJson,
      enabled: subs.length > 0 || vault.length > 0,
      run: async () => exportSubscriptionsJSON(subs, vault, filter),
      success: "JSON backup downloaded",
    },
    {
      key: "csv",
      title: "CSV",
      label: "Subscriptions CSV",
      desc: "Spreadsheet rows for every subscription. Opens in Excel, Google Sheets and Numbers.",
      Icon: TableProperties,
      enabled: subs.length > 0,
      run: async () => exportSubscriptionsCSV(subs, filter),
      success: "Subscriptions CSV downloaded",
    },
    {
      key: "vault-csv",
      title: "VAULT",
      label: "Vault CSV",
      desc: "Your private expense items as a separate spreadsheet. Personal data stays in its own file.",
      Icon: Wallet,
      enabled: vault.length > 0,
      run: async () => exportVaultCSV(vault),
      success: "Vault CSV downloaded",
    },
    {
      key: "pdf",
      title: "PDF",
      label: "PDF report",
      desc: "Formatted document with a summary and paginated tables. Vault items appear on their own page.",
      Icon: FileDown,
      enabled: subs.length > 0 || vault.length > 0,
      run: async () => exportSubscriptionsPDF(subs, vault, filter),
      success: "PDF report downloaded",
    },
    {
      key: "ics",
      title: "ICS",
      label: "Renewal calendar",
      desc: "All dated renewals as an all-day calendar file for your calendar app.",
      Icon: FileDown,
      enabled: subs.some((sub) => Boolean(sub.nextDate)),
      run: async () => exportSubscriptionsICS(subs, filter),
      success: "Calendar file downloaded",
    },
  ];

  const exportData = async (opt: FormatOption) => {
    setBusy(opt.key);
    try {
      await opt.run();
      toast(opt.success, "success");
    } catch (error) {
      toast(error instanceof Error ? error.message : `${opt.title} export failed. Try again.`, "error");
    } finally {
      setBusy(null);
    }
  };

  const noData = subs.length === 0 && vault.length === 0;
  const categories = Array.from(new Set(subs.map((s) => s.category).filter(Boolean))).sort();

  const handleWallosFile = async (file?: File) => {
    if (!file) return;
    try {
      setPreview(importWallosJSON(await file.text()));
    } catch {
      toast("Could not read that Wallos file", "error");
    }
  };

  const confirmImport = async () => {
    if (!preview?.length) return;
    setImporting(true);
    try {
      for (const sub of preview) {
        await createSubscription({
          name: sub.name,
          amount: sub.amount,
          billingCycle: sub.cycle,
          category: sub.category || null,
          provider: sub.provider || null,
          startDate: sub.nextDate || undefined,
          currency: sub.currency,
          notes: sub.notes || null,
          autoRenew: true,
        });
      }
      toast(`${preview.length} subscriptions imported`, "success");
      setPreview(null);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Import failed", "error");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, color: t.text, letterSpacing: 0 }}>
          Export Data
        </h2>
        <p style={{ fontSize: 11.5, color: t.text3, fontFamily: "var(--font-mono)", marginTop: 3, lineHeight: 1.5 }}>
          Download subscriptions and vault items in a format you can keep
        </p>
      </div>

      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end" }}>
        <div style={{ minWidth: 160, flex: 1 }}>
          <label htmlFor="export-category" style={{ fontSize: 12, color: t.text3, fontFamily: "var(--font-display)", display: "block", marginBottom: 4 }}>
            Category
          </label>
          <select id="export-category" value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: "100%", background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 8, padding: "10px 12px", fontSize: 13, color: t.text }}>
            <option value="">All categories</option>
            {categories.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>
        <div style={{ minWidth: 160, flex: 1 }}>
          <label htmlFor="export-from" style={{ fontSize: 12, color: t.text3, fontFamily: "var(--font-display)", display: "block", marginBottom: 4 }}>
            Renewing from
          </label>
          <input id="export-from" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ width: "100%", background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 8, padding: "10px 12px", fontSize: 13, color: t.text }} />
        </div>
        <div style={{ minWidth: 200 }}>
          <label htmlFor="wallos-file" style={{ fontSize: 12, color: t.text3, fontFamily: "var(--font-display)", display: "block", marginBottom: 4 }}>
            Import Wallos JSON
          </label>
          <input id="wallos-file" type="file" accept="application/json,.json" onChange={(e) => handleWallosFile(e.target.files?.[0])} style={{ fontSize: 12, color: t.text2, maxWidth: 220 }} />
        </div>
      </div>

      {preview && (
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, color: t.text, marginBottom: 12 }}>
            {preview.length} subscription{preview.length === 1 ? "" : "s"} ready to import
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 16, maxHeight: 180, overflowY: "auto" }}>
            {preview.map((sub) => (
              <div key={sub.id} style={{ display: "flex", gap: 12, fontSize: 12, color: t.text2, padding: "6px 0", borderBottom: `1px solid ${t.border}` }}>
                <span style={{ flex: 1 }}>{sub.name}</span>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>{sub.currency} {sub.amount.toFixed(2)}</span>
                <span style={{ color: t.text3 }}>{sub.cycle}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={confirmImport} disabled={importing || preview.length === 0} style={{ background: t.green, color: "#000", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
              {importing ? "Importing" : "Confirm import"}
            </button>
            <button onClick={() => setPreview(null)} style={{ background: "transparent", color: t.text2, border: `1px solid ${t.border2}`, borderRadius: 8, padding: "10px 16px", fontSize: 13, cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 14 }}>
        {options.map((opt) => {
          const isBusy = busy === opt.key;
          const disabled = !opt.enabled || busy !== null;
          return (
            <div
              key={opt.key}
              style={{
                background: t.surface,
                border: `1px solid ${t.border}`,
                borderRadius: 12,
                padding: "22px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <span style={{
                width: 40, height: 40, borderRadius: 10,
                background: t.greenDim, border: `1px solid ${t.greenBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <opt.Icon size={18} color={t.greenInk} strokeWidth={1.6} aria-hidden="true" />
              </span>

              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 500, color: t.text, marginBottom: 7 }}>
                  {opt.label}
                </div>
                <div style={{ fontSize: 12, color: t.text2, fontFamily: "var(--font-mono)", lineHeight: 1.65 }}>
                  {opt.desc}
                </div>
              </div>

              <button
                onClick={() => exportData(opt)}
                disabled={disabled}
                aria-label={`Export ${opt.title}`}
                style={{
                  background: disabled ? t.surface2 : t.green,
                  color: disabled ? t.text3 : "#000",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 0",
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: "var(--font-display)",
                  cursor: disabled ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  opacity: isBusy ? 0.8 : 1,
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!disabled) (e.currentTarget as HTMLElement).style.background = t.green2;
                }}
                onMouseLeave={(e) => {
                  if (!disabled) (e.currentTarget as HTMLElement).style.background = t.green;
                }}
              >
                {isBusy
                  ? <><RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} /> Exporting…</>
                  : <><FileDown size={13} aria-hidden="true" /> Export {opt.title}</>}
              </button>
            </div>
          );
        })}
      </div>

      {noData && (
        <div style={{
          background: t.surface,
          border: `1px solid ${t.border}`,
          borderRadius: 12,
          padding: "28px 24px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 13, color: t.text2, fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>
            Nothing to export yet. Add a subscription or a vault item first.
          </div>
          {onNav && (
            <button
              onClick={() => onNav("add")}
              style={{
                marginTop: 14, background: t.green, color: "#000", border: "none",
                borderRadius: 8, padding: "10px 18px", fontSize: 12.5, fontWeight: 500,
                fontFamily: "var(--font-display)", cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 6,
              }}
            >
              <Plus size={13} /> Add subscription
            </button>
          )}
        </div>
      )}
    </div>
  );
}
