import type { Sub } from "@/app/(app)/dashboard/dashboard-types";

export function buildMonthlyData(subs: Sub[]) {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return months.map((month, i) => {
    const spend = subs
      .filter((s) => s.status === "active")
      .reduce((acc, s) => {
        if (s.cycle === "Monthly" || s.cycle === "Daily" || s.cycle === "Weekly")
          return acc + s.amount;
        if (s.cycle === "Annually") return acc + s.amount / 12;
        if (s.cycle === "Quarterly") return acc + s.amount / 3;
        return acc;
      }, 0);
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
  const colors = [
    "#22c55e", "#3b82f6", "#f59e0b", "#ef4444",
    "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6",
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
