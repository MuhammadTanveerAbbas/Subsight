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
    <div className="min-h-screen w-full">
      <AppHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
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
        
        {/* Keyboard shortcuts help */}
        <div className="hidden md:block text-xs text-muted-foreground mt-4 p-3 bg-muted/30 rounded-md">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div className="flex-1 flex justify-between">
              <span>Ctrl+E: Export JSON</span>
              <span>Ctrl+S: Export CSV</span>
              <span>Ctrl+P: Export PDF</span>
              <span>Ctrl+R: Reset Simulation</span>
              <span>Ctrl+A: Add Subscription</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
