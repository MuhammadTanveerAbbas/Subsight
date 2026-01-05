"use client";

import { Target } from "lucide-react";
import { useLoading } from "@/contexts/loading-context";

export function LoadingScreen() {
  const { isLoading } = useLoading();

  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative">
        {/* Outer ring */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-32 w-32 rounded-full border-2 border-primary/10"></div>
        </div>

        {/* Animated ring */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-32 w-32 animate-spin rounded-full border-2 border-transparent border-t-primary border-r-primary/50"></div>
        </div>

        {/* Inner pulsing ring */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-20 w-20 animate-pulse rounded-full border border-primary/30"></div>
        </div>

        {/* Center icon */}
        <div className="relative flex h-32 w-32 items-center justify-center">
          <div className="relative">
            <Target className="h-12 w-12 text-primary animate-pulse" />
            <div className="absolute inset-0 h-12 w-12 rounded-full bg-primary/20 animate-ping"></div>
          </div>
        </div>

        {/* Loading text */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
        </div>
      </div>
    </div>
  );
}
