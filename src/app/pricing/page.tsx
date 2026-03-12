"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { useState } from "react";

export default function PricingPage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);

  const startCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data?.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  };

  const isPro = profile?.subscription_tier === "pro";

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <section className="text-center">
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight font-headline">
            Simple, honest pricing
          </h1>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Free forever for light users. Pro for people serious about cutting
            their subscription spend.
          </p>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border bg-card p-6 sm:p-8">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-semibold">Free</h2>
              <div className="text-2xl font-semibold">$0</div>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">forever</p>

            <ul className="mt-6 space-y-3 text-sm">
              <li>Track up to 5 subscriptions</li>
              <li>Manual entry</li>
              <li>Budget simulation</li>
              <li>JSON/CSV/PDF export</li>
              <li>Basic charts</li>
            </ul>

            <div className="mt-8">
              <Button asChild variant="outline" className="w-full">
                <Link href={user ? "/dashboard" : "/auth/signup"}>
                  Start free
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/40 bg-zinc-950 text-zinc-50 p-6 sm:p-8">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-semibold">Pro</h2>
              <div className="text-2xl font-semibold">$9</div>
            </div>
            <p className="mt-1 text-sm text-zinc-300">per month</p>

            <ul className="mt-6 space-y-3 text-sm text-zinc-200">
              <li>Unlimited subscriptions</li>
              <li>AI auto fill (powered by Groq)</li>
              <li>AI spending analysis</li>
              <li>Email reminders before renewal</li>
              <li>All export formats</li>
              <li>Priority support</li>
              <li>or $79/year (save 27%)</li>
            </ul>

            <div className="mt-8 grid gap-2">
              {isPro ? (
                <Button asChild className="w-full">
                  <Link href="/dashboard">You're on Pro</Link>
                </Button>
              ) : user ? (
                <Button
                  onClick={startCheckout}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Redirecting…" : "Upgrade to Pro"}
                </Button>
              ) : (
                <Button asChild className="w-full">
                  <Link href="/auth/signup">Start Pro</Link>
                </Button>
              )}
              {user && (
                <p className="text-xs text-zinc-400">
                  Manage anytime in settings after upgrading.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-14">
          <h3 className="text-xl font-semibold">FAQ</h3>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border bg-card p-5">
              <p className="font-medium">What counts as a subscription?</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Anything you pay for on a recurring basis apps, tools, streaming
                services, gym memberships, newsletters.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <p className="font-medium">
                Can I export my data if I downgrade?
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Yes. Your data is always yours. Export everything as JSON, CSV,
                or PDF at any time, on any plan.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <p className="font-medium">How does the AI auto fill work?</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Type a service name and our AI instantly fills in the typical
                price, category, and billing cycle. You can edit anything before
                saving.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <p className="font-medium">What payment methods do you accept?</p>
              <p className="mt-2 text-sm text-muted-foreground">
                All major credit/debit cards via Stripe. Your payment info is
                never stored on our servers.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-14 rounded-2xl border bg-card p-8 text-center">
          <h3 className="text-2xl font-semibold">
            Start free, upgrade anytime
          </h3>
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild>
              <Link href={user ? "/dashboard" : "/auth/signup"}>
                Get started
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Back home</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
