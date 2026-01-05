import { Dashboard } from "@/components/subsight/dashboard";
import { OnboardingTour } from "@/components/onboarding-tour";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your subscriptions, view spending analytics, and optimize your recurring payments.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardPage() {
  return (
    <main>
      <Dashboard />
      <OnboardingTour />
    </main>
  );
}
