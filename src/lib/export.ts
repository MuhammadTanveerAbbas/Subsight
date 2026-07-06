export interface ExportSubscription {
  name: string;
  category: string;
  amount: number;
  currency: string;
  cycle: string;
  nextDate?: string;
  status: string;
  autoRenew: boolean;
  provider: string;
}

export function escapeCSVValue(v: string | number | boolean): string {
  const s = String(v);
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

export function subscriptionsToJSON(subs: ExportSubscription[]): string {
  return JSON.stringify(subs, null, 2);
}

export function subscriptionsToCSV(subs: ExportSubscription[]): string {
  const headers = [
    "Name", "Category", "Amount", "Currency", "Cycle",
    "NextDate", "Status", "AutoRenew", "Provider",
  ];
  const rows = subs.map((s) =>
    [
      s.name, s.category, s.amount, s.currency, s.cycle,
      s.nextDate || "", s.status, s.autoRenew, s.provider,
    ]
      .map(escapeCSVValue)
      .join(","),
  );
  return "\uFEFF" + [headers.join(","), ...rows].join("\n");
}

function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportSubscriptionsJSON(subs: ExportSubscription[]): void {
  downloadBlob(
    subscriptionsToJSON(subs),
    "subsight-subscriptions.json",
    "application/json",
  );
}

export function exportSubscriptionsCSV(subs: ExportSubscription[]): void {
  downloadBlob(
    subscriptionsToCSV(subs),
    "subsight-subscriptions.csv",
    "text/csv;charset=utf-8",
  );
}

export function exportSubscriptionsPDF(): void {
  window.print();
}
