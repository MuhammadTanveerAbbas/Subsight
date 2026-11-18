/**
 * Export helpers for Subsight.
 *
 * Formats:
 * - JSON: structured backup of subscriptions and, when supplied, vault items.
 * - CSV: spreadsheet-ready rows with a UTF-8 BOM for Excel compatibility.
 * - PDF: generated with the MIT-licensed jsPDF + jspdf-autotable packages.
 *   Both packages are loaded on demand so the dashboard bundle stays small.
 *
 * All exports run in the browser. No data is sent to a server.
 */

import type { Sub } from "@/app/(app)/dashboard/dashboard-types";
import type { VaultItem } from "@/lib/types";

/* ── shared helpers ────────────────────────────────────────────────────── */

/** Create a browser download from text and release the object URL afterwards. */
function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Sortable file name suffix, for example 2026-11-18T09-30-12. */
function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

/** Quote a value only when the CSV grammar requires it. */
function csvCell(v: string | number | boolean | null | undefined): string {
  const s = v == null ? "" : String(v);
  return /[,"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function csv(headers: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  return "\uFEFF" + [headers.map(csvCell).join(","), ...rows.map((r) => r.map(csvCell).join(","))].join("\r\n");
}

/** Normalize a billing cycle to an approximate monthly amount for summaries. */
function monthlyAmount(s: Sub): number {
  switch (s.cycle.toLowerCase()) {
    case "yearly":
    case "annually": return s.amount / 12;
    case "weekly": return s.amount * 4.33;
    case "quarterly": return s.amount / 3;
    case "daily": return s.amount * 30;
    default: return s.amount;
  }
}

/* ── JSON ──────────────────────────────────────────────────────────────── */

/**
 * Download a structured backup. Vault data is included when provided so a
 * single file can restore both trackers.
 */
export function exportSubscriptionsJSON(subs: Sub[], vault: VaultItem[] = []): void {
  const payload = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    totalCount: subs.length,
    activeCount: subs.filter((s) => s.status === "active").length,
    subscriptions: subs.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      amount: s.amount,
      currency: s.currency,
      cycle: s.cycle,
      nextDate: s.nextDate,
      status: s.status,
      autoRenew: s.autoRenew,
      provider: s.provider,
      notes: s.notes,
    })),
    vault: {
      count: vault.length,
      items: vault.map((i) => ({
        id: i.id,
        name: i.name,
        category: i.category,
        amount: i.amount,
        currency: i.currency,
        purchaseDate: i.purchaseDate,
        notes: i.notes,
      })),
    },
  };

  downloadBlob(
    JSON.stringify(payload, null, 2),
    `subsight-export-${timestamp()}.json`,
    "application/json",
  );
}

/* ── CSV ──────────────────────────────────────────────────────────────── */

const SUB_HEADERS = [
  "Name", "Category", "Amount", "Currency", "Billing Cycle",
  "Next Renewal", "Status", "Auto Renew", "Provider", "Notes",
];

/** Download subscriptions as a UTF-8 CSV with quoted values where needed. */
export function exportSubscriptionsCSV(subs: Sub[]): void {
  const rows = subs.map((s) => [
    s.name, s.category, s.amount, s.currency, s.cycle,
    s.nextDate, s.status, s.autoRenew ? "Yes" : "No", s.provider, s.notes,
  ]);
  downloadBlob(
    csv(SUB_HEADERS, rows),
    `subsight-subscriptions-${timestamp()}.csv`,
    "text/csv;charset=utf-8",
  );
}

const VAULT_HEADERS = ["Item", "Category", "Amount", "Currency", "Date", "Notes"];

/** Download vault items as a separate CSV so the two trackers stay distinct. */
export function exportVaultCSV(items: VaultItem[]): void {
  const rows = items.map((i) => [
    i.name, i.category, i.amount, i.currency, i.purchaseDate, i.notes,
  ]);
  downloadBlob(
    csv(VAULT_HEADERS, rows),
    `subsight-vault-${timestamp()}.csv`,
    "text/csv;charset=utf-8",
  );
}

/* ── PDF ──────────────────────────────────────────────────────────────── */

/**
 * Download a real PDF file. jsPDF and jspdf-autotable are imported on demand.
 * If vault items are provided they appear on their own page.
 */
export async function exportSubscriptionsPDF(
  subs: Sub[],
  vault: VaultItem[] = [],
): Promise<void> {
  const [{ jsPDF }, { autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const left = 40;
  const generated = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const active = subs.filter((s) => s.status === "active");
  const monthly = active.reduce((sum, s) => sum + monthlyAmount(s), 0);
  const currency = subs[0]?.currency || "USD";

  doc.setTextColor(17, 17, 17);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Subsight", left, 48);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 110);
  doc.text(`Subscription export  ·  Generated ${generated}`, left, 64);

  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text(
    `${subs.length} subscriptions  ·  ${active.length} active  ·  ${currency} ${monthly.toFixed(2)} estimated / month`,
    left, 88,
  );

  const rows = subs
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((s) => [
      s.name,
      s.category || "-",
      `${s.currency} ${s.amount.toFixed(2)}`,
      s.cycle,
      s.nextDate || "-",
      s.status.replace("_", " "),
    ]);

  autoTable(doc, {
    startY: 104,
    head: [["Name", "Category", "Amount", "Cycle", "Next renewal", "Status"]],
    body: rows,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 5, overflow: "linebreak" },
    headStyles: { fillColor: [243, 244, 246], textColor: [31, 41, 55], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    columnStyles: { 2: { halign: "right" } },
    margin: { left, right: left },
  });

  if (vault.length > 0) {
    doc.addPage();
    doc.setTextColor(17, 17, 17);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Personal vault", left, 48);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(110, 110, 110);
    doc.text(`${vault.length} private items  ·  Not included in the subscription total`, left, 64);

    const vaultRows = vault
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((i) => [
        i.name, i.category, `${i.currency} ${i.amount.toFixed(2)}`,
        i.purchaseDate, i.notes || "-",
      ]);

    autoTable(doc, {
      startY: 80,
      head: [["Item", "Category", "Amount", "Date", "Notes"]],
      body: vaultRows,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 5, overflow: "linebreak" },
      headStyles: { fillColor: [243, 244, 246], textColor: [31, 41, 55], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      columnStyles: { 2: { halign: "right" } },
      margin: { left, right: left },
    });
  }

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Exported from Subsight", left, pageHeight - 20);
    doc.text(`${i} / ${pages}`, pageWidth - left, pageHeight - 20, { align: "right" });
  }

  doc.save(`subsight-export-${timestamp()}.pdf`);
}
