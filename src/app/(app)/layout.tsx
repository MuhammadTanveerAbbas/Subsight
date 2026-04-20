import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReactNode } from "react";
import { SubscriptionProvider } from "@/contexts/subscription-context";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <SubscriptionProvider>{children}</SubscriptionProvider>;
}
