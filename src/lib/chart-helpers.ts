import type { Sub } from "@/app/(app)/dashboard/dashboard-types";

function cycleMultiplier(cycle: string): number {
  const c = cycle.toLowerCase();
  if (c === "daily" || c === "weekly" || c === "monthly") return 1;
  if (c === "quarterly") return 1 / 3;
  if (c === "annually" || c === "yearly") return 1 / 12;
  if (c === "one-time") return 0;
  return 0;
}

export function buildMonthlyData(subs: Sub[]) {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return months.map((month) => {
    const spend = subs
      .filter((s) => s.status === "active")
      .reduce((acc, s) => acc + s.amount * cycleMultiplier(s.cycle), 0);
    return { month, spend: Math.round(spend * 100) / 100 };
  });
}

export function buildCatData(subs: Sub[]) {
  const active = subs.filter((s) => s.status === "active");
  const total = active.reduce((a, s) => a + s.amount, 0);
  if (total === 0) return [];
  const catMap: Record<string, number> = {};
  active.forEach((s) => {
    const cat = s.category || "Other";
    catMap[cat] = (catMap[cat] || 0) + s.amount;
  });
  // One accent leads; the rest are neutral steps of the same ramp.
  const colors = [
    "#22c55e", "#6b7280", "#9ca3af", "#4b5563",
    "#d1d5db", "#374151", "#e5e7eb", "#1f2937",
  ];
  return Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value], i) => ({
      name,
      value: Math.round((value / total) * 100),
      color: colors[i % colors.length],
    }));
}
