import { SubscriptionProvider } from "@/contexts/subscription-context";
import { ProtectedRoute } from "@/components/protected-route";
import { UpgradePromptGate } from "@/components/subsight/upgrade-prompt-gate";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <SubscriptionProvider>
        {children}
        <UpgradePromptGate />
      </SubscriptionProvider>
    </ProtectedRoute>
  );
}