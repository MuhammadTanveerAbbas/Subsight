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
          
          {/* Keyboard shortcuts help */}
          <div className="hidden lg:block text-xs text-muted-foreground p-3 sm:p-4 bg-muted/20 rounded-lg border border-border/50">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div className="flex flex-wrap gap-x-6 gap-y-1">
                <span className="whitespace-nowrap"><kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Ctrl+E</kbd> Export JSON</span>
                <span className="whitespace-nowrap"><kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Ctrl+S</kbd> Export CSV</span>
                <span className="whitespace-nowrap"><kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Ctrl+P</kbd> Export PDF</span>
                <span className="whitespace-nowrap"><kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Ctrl+R</kbd> Reset Simulation</span>
                <span className="whitespace-nowrap"><kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Ctrl+A</kbd> Add Subscription</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
