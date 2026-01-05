import { SubscriptionProvider } from "@/contexts/subscription-context";
import { ProtectedRoute } from "@/components/protected-route";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <SubscriptionProvider>
        {children}
      </SubscriptionProvider>
    </ProtectedRoute>
  );
}