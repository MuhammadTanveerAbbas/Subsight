import type { Sub } from "@/app/(app)/dashboard/dashboard-types";

/* ── helpers ──────────────────────────────────────────────────────────── */

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

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

function csvCell(v: string | number | boolean | null | undefined): string {
  const s = v == null ? "" : String(v);
  return /[,"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/* ── JSON ─────────────────────────────────────────────────────────────── */

export function exportSubscriptionsJSON(subs: Sub[]): void {
  const payload = {
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
  };
  downloadBlob(
    JSON.stringify(payload, null, 2),
    `subsight-export-${timestamp()}.json`,
    "application/json",
  );
}

/* ── CSV ──────────────────────────────────────────────────────────────── */

const CSV_HEADERS = [
  "Name", "Category", "Amount", "Currency", "Billing Cycle",
  "Next Renewal", "Status", "Auto Renew", "Provider", "Notes",
];

export function exportSubscriptionsCSV(subs: Sub[]): void {
  const rows = subs.map((s) =>
    [
      s.name, s.category, s.amount, s.currency, s.cycle,
      s.nextDate, s.status, s.autoRenew ? "Yes" : "No", s.provider, s.notes,
    ].map(csvCell).join(","),
  );
  const csv = "\uFEFF" + [CSV_HEADERS.map(csvCell).join(","), ...rows].join("\r\n");
  downloadBlob(
    csv,
    `subsight-export-${timestamp()}.csv`,
    "text/csv;charset=utf-8",
  );
}

/* ── PDF ──────────────────────────────────────────────────────────────── */

export function exportSubscriptionsPDF(subs: Sub[]): void {
  const activeSubs  = subs.filter((s) => s.status === "active");
  const totalMonthly = activeSubs.reduce((acc, s) => {
    const amt = s.cycle === "yearly" ? s.amount / 12
              : s.cycle === "weekly" ? s.amount * 4.33
              : s.amount;
    return acc + amt;
  }, 0);

  const statusColor: Record<string, string> = {
    active: "#22c55e",
    inactive: "#6b7280",
    warning: "#f59e0b",
    renewal_passed: "#ef4444",
  };

  const rows = subs
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((s) => `
      <tr>
        <td>${esc(s.name)}</td>
        <td>${esc(s.category)}</td>
        <td style="text-align:right">${esc(s.currency)} ${s.amount.toFixed(2)}</td>
        <td>${esc(s.cycle)}</td>
        <td>${esc(s.nextDate || "—")}</td>
        <td><span class="badge" style="background:${statusColor[s.status] ?? "#6b7280"}22;color:${statusColor[s.status] ?? "#6b7280"};border:1px solid ${statusColor[s.status] ?? "#6b7280"}44">${esc(s.status)}</span></td>
        <td>${s.autoRenew ? "Yes" : "No"}</td>
        <td>${esc(s.provider || "—")}</td>
      </tr>
    `).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Subsight | Subscription Export</title>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;font-size:12px;color:#111;background:#fff;padding:36px 40px}
    h1{font-size:22px;font-weight:800;letter-spacing:-0.5px;margin-bottom:2px}
    .sub{font-size:11px;color:#555;margin-bottom:24px}
    .summary{display:flex;gap:24px;margin-bottom:28px;flex-wrap:wrap}
    .card{border:1px solid #e5e7eb;border-radius:8px;padding:14px 18px;min-width:140px}
    .card-label{font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px}
    .card-value{font-size:18px;font-weight:700}
    table{width:100%;border-collapse:collapse;font-size:11px}
    th{background:#f3f4f6;text-align:left;padding:8px 10px;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:#374151;border-bottom:2px solid #e5e7eb}
    td{padding:8px 10px;border-bottom:1px solid #f3f4f6;vertical-align:middle}
    tr:last-child td{border-bottom:none}
    tr:nth-child(even) td{background:#fafafa}
    .badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;text-transform:capitalize}
    .footer{margin-top:24px;font-size:10px;color:#9ca3af;border-top:1px solid #f3f4f6;padding-top:12px}
    @media print{body{padding:20px 24px}@page{margin:12mm}}
  </style>
</head>
<body>
  <h1>Subsight</h1>
  <div class="sub">Subscription Export &nbsp;·&nbsp; Generated ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}</div>

  <div class="summary">
    <div class="card"><div class="card-label">Total</div><div class="card-value">${subs.length}</div></div>
    <div class="card"><div class="card-label">Active</div><div class="card-value" style="color:#22c55e">${activeSubs.length}</div></div>
    <div class="card"><div class="card-label">Est. Monthly</div><div class="card-value">$${totalMonthly.toFixed(2)}</div></div>
    <div class="card"><div class="card-label">Est. Annual</div><div class="card-value">$${(totalMonthly * 12).toFixed(2)}</div></div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Name</th><th>Category</th><th style="text-align:right">Amount</th>
        <th>Cycle</th><th>Next Renewal</th><th>Status</th><th>Auto Renew</th><th>Provider</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="footer">Exported from Subsight &nbsp;·&nbsp; ${subs.length} subscription${subs.length !== 1 ? "s" : ""} &nbsp;·&nbsp; ${new Date().toISOString()}</div>

  <script>window.onload=()=>{window.print()}<\/script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) {
    // Fallback: download as HTML if popup is blocked
    downloadBlob(html, `subsight-export-${timestamp()}.html`, "text/html;charset=utf-8");
    return;
  }
  win.document.write(html);
  win.document.close();
}

/* ── internal ─────────────────────────────────────────────────────────── */

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
