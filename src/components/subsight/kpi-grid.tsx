
"use client";

import { useMemo } from "react";
import type { Subscription } from "@/lib/types";
import { KpiCard } from "@/components/subsight/kpi-card";

interface KpiGridProps {
  subscriptions: Subscription[];
  simulatedSubscriptions: Subscription[];
}

const calculateTotals = (subs: Subscription[]) => {
  const activeSubs = subs.filter((s) => s.activeStatus);
  const monthly = activeSubs
    .filter((s) => s.billingCycle === "monthly")
    .reduce((sum, s) => sum + s.amount, 0);
  const yearly = activeSubs
    .filter((s) => s.billingCycle === "yearly")
    .reduce((sum, s) => sum + s.amount, 0);

  const oneTime = activeSubs
    .filter(
      (s) =>
        s.billingCycle === "one-time" &&
        new Date(s.startDate).getFullYear() === new Date().getFullYear()
    )
    .reduce((sum, s) => sum + s.amount, 0);

  return {
    monthly,
    yearly: monthly * 12 + yearly + oneTime,
    count: activeSubs.length,
  };
};

export function KpiGrid({ subscriptions, simulatedSubscriptions }: KpiGridProps) {
  const originalTotals = useMemo(() => calculateTotals(subscriptions), [subscriptions]);
  const simulatedTotals = useMemo(() => calculateTotals(simulatedSubscriptions), [simulatedSubscriptions]);

  const deltaMonthly = simulatedTotals.monthly - originalTotals.monthly;
  const deltaYearly = simulatedTotals.yearly - originalTotals.yearly;
  const currency = subscriptions[0]?.currency || 'USD';


  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard title="Active Subscriptions" value={simulatedTotals.count.toString()} />
      <KpiCard
        title="Monthly Cost"
        value={simulatedTotals.monthly.toLocaleString("en-US", {
          style: "currency",
          currency: currency,
        })}
        delta={deltaMonthly}
        deltaType={deltaMonthly > 0 ? "increase" : "decrease"}
        deltaText={
          deltaMonthly !== 0
            ? `${deltaMonthly.toLocaleString("en-US", {
                style: "currency",
                currency: currency,
              })} from original`
            : "No change"
        }
      />
      <KpiCard
        title="Annual Cost"
        value={simulatedTotals.yearly.toLocaleString("en-US", {
          style: "currency",
          currency: currency,
        })}
        delta={deltaYearly}
        deltaType={deltaYearly > 0 ? "increase" : "decrease"}
        deltaText={
          deltaYearly !== 0
            ? `${deltaYearly.toLocaleString("en-US", {
                style: "currency",
                currency: currency,
              })} from original`
            : "No change"
        }
      />
      <KpiCard 
        title="Potential Savings"
        value={(-deltaYearly).toLocaleString("en-US", {
          style: "currency",
          currency: currency,
        })}
        delta={-deltaYearly}
        deltaType={-deltaYearly > 0 ? "increase" : "decrease"}
        deltaText="Per year by deactivating"
      />
    </div>
  );
}
