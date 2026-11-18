"use client";

import { AlertCircle, ArrowRight } from "lucide-react";
import {
  AuthCard,
  AuthShell,
  PrimaryButton,
  StatusView,
} from "@/components/auth/auth-ui";

export default function AuthError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <AuthShell>
      <AuthCard>
        <StatusView
          icon={AlertCircle}
          title="Something went wrong"
          description="An unexpected error occurred. Try again to continue."
          tone="error"
        >
          <div className="mt-6">
            <PrimaryButton onClick={reset}>
              Try again <ArrowRight size={15} />
            </PrimaryButton>
          </div>
        </StatusView>
      </AuthCard>
    </AuthShell>
  );
}
