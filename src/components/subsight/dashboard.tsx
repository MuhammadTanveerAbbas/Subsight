"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from 'next/dynamic';
import { useSubscriptions } from "@/contexts/subscription-context";
import { AppHeader } from "@/components/subsight/header";
import { KpiGrid } from "@/components/subsight/kpi-grid";
import { SubscriptionsTable } from "@/components/subsight/subscriptions-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useLoading } from "@/contexts/loading-context";
import { useToast } from "@/hooks/use-toast";
import { exportToJSON, exportToCSV, exportToPDF } from "@/lib/export";

const ChartsGrid = dynamic(() => import('@/components/subsight/charts-grid').then(mod => mod.ChartsGrid), {
  ssr: false,
  loading: () => <div className="grid gap-4 md:grid-cols-2">
    <Skeleton className="h-[300px] sm:h-[360px] rounded-lg" />
    <Skeleton className="h-[300px] sm:h-[360px] rounded-lg" />
  </div>
});

export function Dashboard() {
  const { subscriptions } = useSubscriptions();
  const { setIsLoading } = useLoading();
  const { toast } = useToast();
  const [simulation, setSimulation] = useState<Record<string, boolean>>({});
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, [setIsLoading]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger if not in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'e':
            event.preventDefault();
            if (subscriptions.length > 0) {
              exportToJSON(subscriptions);
              toast({ title: "Export", description: "Data exported to JSON" });
            }
            break;
          case 's':
            event.preventDefault();
            if (subscriptions.length > 0) {
              exportToCSV(subscriptions);
              toast({ title: "Export", description: "Data exported to CSV" });
            }
            break;
          case 'p':
            event.preventDefault();
            if (subscriptions.length > 0) {
              exportToPDF(subscriptions);
              toast({ title: "Export", description: "Data exported to PDF" });
            }
            break;
          case 'r':
            event.preventDefault();
            setSimulation({});
            toast({ title: "Reset", description: "Simulation reset" });
            break;
          case 'a':
            event.preventDefault();
            // Trigger add subscription - would need to be implemented in header
            toast({ title: "Shortcut", description: "Use Add Subscription button" });
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [subscriptions, toast]);

  const simulatedSubscriptions = useMemo(() => 
    subscriptions.map((sub) => ({
      ...sub,
      activeStatus:
        simulation[sub.id] === undefined ? sub.activeStatus : simulation[sub.id],
    })),
    [subscriptions, simulation]
  );

  return (
    <div className="min-h-screen w-full flex flex-col">
      <AppHeader />
      <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          <KpiGrid
            subscriptions={subscriptions}
            simulatedSubscriptions={simulatedSubscriptions}
          />
          <ChartsGrid subscriptions={simulatedSubscriptions} />
          <SubscriptionsTable
            subscriptions={subscriptions}
            simulation={simulation}
            setSimulation={setSimulation}
          />
        </div>
      </main>
    </div>
  );
}
