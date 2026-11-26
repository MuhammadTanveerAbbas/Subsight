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

export interface ExportFilter {
  category?: string;
  fromDate?: string;
}

function filterSubs(subs: Sub[], filter: ExportFilter = {}): Sub[] {
  return subs.filter((sub) => {
    if (filter.category && sub.category !== filter.category) return false;
    if (filter.fromDate && sub.nextDate && sub.nextDate < filter.fromDate) return false;
    return true;
  });
}

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
export function exportSubscriptionsJSON(subs: Sub[], vault: VaultItem[] = [], filter: ExportFilter = {}): void {
  subs = filterSubs(subs, filter);
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
export function exportSubscriptionsCSV(subs: Sub[], filter: ExportFilter = {}): void {
  const rows = filterSubs(subs, filter).map((s) => [
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
  filter: ExportFilter = {},
): Promise<void> {
  subs = filterSubs(subs, filter);
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

/* ── ICS ───────────────────────────────────────────────────────────────── */

function icsEscape(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\r?\n/g, "\\n");
}

function nextDay(date: string): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  parsed.setUTCDate(parsed.getUTCDate() + 1);
  return parsed.toISOString().slice(0, 10).replace(/-/g, "");
}

/** Build a calendar file of dated renewals. Undated subscriptions are skipped. */
export function buildICS(subs: Sub[], filter: ExportFilter = {}): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Subsight//EN"];
  for (const sub of filterSubs(subs, filter)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(sub.nextDate)) continue;
    const start = sub.nextDate.replace(/-/g, "");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${sub.id}@subsight`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${nextDay(sub.nextDate)}`,
      `SUMMARY:${icsEscape(sub.name)}`,
      `DESCRIPTION:${icsEscape(`${sub.amount.toFixed(2)} ${sub.currency} · ${sub.cycle}`)}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}

export function exportSubscriptionsICS(subs: Sub[], filter: ExportFilter = {}): void {
  downloadBlob(
    buildICS(subs, filter),
    `subsight-renewals-${timestamp()}.ics`,
    "text/calendar;charset=utf-8",
  );
}

/* ── Wallos import ─────────────────────────────────────────────────────── */

/** Parse a Wallos JSON backup into preview rows. Invalid rows are dropped. */
export function importWallosJSON(text: string): Sub[] {
  const parsed = JSON.parse(text) as unknown;
  const rows = Array.isArray(parsed)
    ? parsed
    : ((parsed as { subscriptions?: unknown[] })?.subscriptions ?? []);

  return rows.flatMap((value, index): Sub[] => {
    const row = value as Record<string, unknown>;
    const name = String(row.name ?? "").trim();
    const amount = Number(row.amount ?? row.price ?? 0);
    if (!name || !Number.isFinite(amount) || amount <= 0) return [];
    const cycle = String(row.billing_cycle ?? row.billingCycle ?? row.cycle ?? "monthly").toLowerCase();
    const nextDate = String(
      row.next_renewal_date ?? row.nextRenewalDate ?? row.nextDate ?? "",
    ).slice(0, 10);
    return [{
      id: `wallos-${index}`,
      name: name.slice(0, 100),
      category: String(row.category ?? "Other").slice(0, 50),
      amount,
      currency: String(row.currency ?? "USD").slice(0, 10),
      cycle,
      nextDate: /^\d{4}-\d{2}-\d{2}$/.test(nextDate) ? nextDate : "",
      status: "active",
      autoRenew: true,
      provider: String(row.provider ?? "").slice(0, 100),
      notes: String(row.notes ?? "").slice(0, 500),
    }];
  });
}
