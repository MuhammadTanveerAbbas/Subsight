"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  delta?: number;
  deltaType?: "increase" | "decrease";
  deltaText?: string;
}

export function KpiCard({
  title,
  value,
  delta,
  deltaType,
  deltaText,
}: KpiCardProps) {
  const hasDelta = delta !== undefined && delta !== 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-2xl md:text-3xl font-bold tracking-tight" suppressHydrationWarning>{value}</div>
        {deltaText && (
            <div className="text-xs text-muted-foreground flex items-center gap-1" suppressHydrationWarning>
                 {hasDelta && deltaType === "increase" && (
                    <ArrowUp className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
                )}
                {hasDelta && deltaType === "decrease" && (
                    <ArrowDown className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                )}
                <p className="line-clamp-1">{deltaText}</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
