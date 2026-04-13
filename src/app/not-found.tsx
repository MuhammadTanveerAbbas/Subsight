"use client";

import Link from "next/link";
import { Ghost, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-8">
      {/* Glowing icon */}
      <div className="relative flex items-center justify-center">
        <div className="absolute w-32 h-32 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative p-6 rounded-2xl border border-border bg-card">
          <Ghost className="w-16 h-16 text-primary" strokeWidth={1.5} />
        </div>
      </div>

      {/* 404 */}
      <div className="flex flex-col items-center gap-2">
        <span className="font-mono text-7xl font-bold text-primary leading-none">
          404
        </span>
        <span className="text-muted-foreground text-sm tracking-widest uppercase">
          Page not found
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Home className="w-4 h-4" />
          Home
        </Link>
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>
    </div>
  );
}
