"use client";

import { useMemo } from "react";
import { Subscription } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
} from "recharts";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSubscriptions } from "@/contexts/subscription-context";
import { convertCurrency, formatCurrencyWithConversion } from "@/lib/currency";

interface ChartsGridProps {
  subscriptions: Subscription[];
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface TimelineData {
  month: string;
  total: number;
}

const filterActiveSubscriptions = (
  subscriptions: Subscription[]
): Subscription[] => subscriptions.filter((s) => s.activeStatus);

const calculateAnnualCost = (subscription: Subscription): number => {
  if (subscription.billingCycle === "monthly") return subscription.amount * 12;
  if (subscription.billingCycle === "yearly") return subscription.amount;
  return 0;
};

const CHART_COLORS = [
  "hsl(142, 76%, 36%)", // Primary Green
  "hsl(158, 64%, 52%)", // Emerald
  "hsl(160, 84%, 39%)", // Teal
  "hsl(125, 71%, 66%)", // Light Green
  "hsl(134, 61%, 41%)", // Forest Green
];

const processCategoryData = (
  subscriptions: Subscription[],
  displayCurrency: string
): { data: CategoryData[]; total: number } => {
  const categoryTotals: Record<string, number> = {};
  let totalAnnualCost = 0;

  subscriptions.forEach((subscription) => {
    const category = subscription.category || "Other";
    let annualCost = calculateAnnualCost(subscription);
    
    // Convert to display currency
    annualCost = convertCurrency(annualCost, subscription.currency, displayCurrency as any);
    
    categoryTotals[category] = (categoryTotals[category] || 0) + annualCost;
    totalAnnualCost += annualCost;
  });

  const data = Object.entries(categoryTotals)
    .map(([name, value], index) => ({ 
      name, 
      value, 
      color: CHART_COLORS[index % CHART_COLORS.length] 
    }))
    .sort((a, b) => b.value - a.value);

  return { data, total: totalAnnualCost };
};

const processTimelineData = (subscriptions: Subscription[]): TimelineData[] => {
  const monthlyTotals: Record<string, number> = {};

  subscriptions.forEach((subscription) => {
    if (subscription.billingCycle === "monthly") {
      for (let i = 0; i < 12; i++) {
        const monthKey = format(new Date(new Date().getFullYear(), i, 1), "MMM");
        monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + subscription.amount;
      }
    } else if (subscription.billingCycle === "yearly") {
      const monthKey = format(new Date(subscription.startDate), "MMM");
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + subscription.amount;
    }
  });

  return Array.from({ length: 12 }, (_, i) => {
    const month = format(new Date(0, i), "MMM");
    return { month, total: monthlyTotals[month] || 0 };
  });
};

const formatCurrency = (value: number, currency: string): string =>
  value.toLocaleString("en-US", { style: "currency", currency });

export function ChartsGrid({ subscriptions }: ChartsGridProps) {
  const activeSubs = filterActiveSubscriptions(subscriptions);
  const { displayCurrency } = useSubscriptions();
  const currency = displayCurrency || subscriptions[0]?.currency || "USD";
  const isMobile = useIsMobile();

  const { categoryData, totalAnnualCost } = useMemo(() => {
    const { data, total } = processCategoryData(activeSubs, currency);
    return { categoryData: data, totalAnnualCost: total };
  }, [activeSubs, currency]);

  const timelineData = useMemo(() => processTimelineData(activeSubs), [activeSubs]);

  return (
    <div className="grid gap-4 lg:gap-6 md:grid-cols-2">
      {/* Category Breakdown */}
      <Card className="overflow-hidden border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base lg:text-lg font-semibold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            Spending by Category
          </CardTitle>
          <CardDescription className="text-xs lg:text-sm">
            Annual breakdown • <span className="font-medium text-foreground">{formatCurrency(totalAnnualCost, currency)}</span> total
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-4 lg:pb-6">
          {categoryData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 lg:py-16 text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-muted/50 flex items-center justify-center mb-3 lg:mb-4">
                <svg className="w-6 h-6 lg:w-8 lg:h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                </svg>
              </div>
              <p className="text-xs lg:text-sm font-medium text-muted-foreground">No subscriptions yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Add subscriptions to see breakdown</p>
            </div>
          ) : (
            <div className="space-y-4 lg:space-y-6">
              <div className="relative mx-auto w-36 h-36 lg:w-48 lg:h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={isMobile ? 50 : 60}
                      outerRadius={isMobile ? 70 : 90}
                      strokeWidth={0}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload[0]) {
                          const data = payload[0].payload;
                          const percentage = ((data.value / totalAnnualCost) * 100).toFixed(1);
                          return (
                            <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-2 lg:p-3 shadow-lg">
                              <p className="text-xs lg:text-sm font-medium">{data.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(data.value, currency)} ({percentage}%)
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 lg:space-y-3">
                {categoryData.slice(0, isMobile ? 3 : 4).map((item, index) => {
                  const percentage = ((item.value / totalAnnualCost) * 100).toFixed(1);
                  return (
                    <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2 lg:gap-3">
                        <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs lg:text-sm font-medium truncate">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs lg:text-sm font-semibold">{formatCurrency(item.value, currency)}</p>
                        <p className="text-xs text-muted-foreground">{percentage}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Timeline */}
      <Card className="overflow-hidden border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base lg:text-lg font-semibold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            Monthly Spending
          </CardTitle>
          <CardDescription className="text-xs lg:text-sm">
            Projected spending for <span className="font-medium text-foreground">{new Date().getFullYear()}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-4 lg:pb-6">
          {timelineData.every(d => d.total === 0) ? (
            <div className="flex flex-col items-center justify-center py-12 lg:py-16 text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-muted/50 flex items-center justify-center mb-3 lg:mb-4">
                <svg className="w-6 h-6 lg:w-8 lg:h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-xs lg:text-sm font-medium text-muted-foreground">No data available</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Add subscriptions to see timeline</p>
            </div>
          ) : (
            <div className="h-48 lg:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 5, left: -5, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: isMobile ? 9 : 11, fill: 'hsl(var(--muted-foreground))' }}
                    interval={isMobile ? 2 : 0}
                    tickMargin={isMobile ? 2 : 5}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: isMobile ? 9 : 11, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) => value > 0 ? (isMobile ? `$${Math.round(value/1000)}k` : `$${(value/1000).toFixed(0)}k`) : ''}
                    width={isMobile ? 30 : 40}
                    tickMargin={2}
                  />
                  <ChartTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload[0]) {
                        return (
                          <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-2 lg:p-3 shadow-lg">
                            <p className="text-xs lg:text-sm font-medium">{label}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(payload[0].value as number, currency)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(142, 76%, 36%)"
                    strokeWidth={3}
                    fill="url(#colorGradient)"
                    dot={{ fill: 'hsl(142, 76%, 36%)', strokeWidth: 0, r: 5 }}
                    activeDot={{ r: 7, stroke: 'hsl(142, 76%, 36%)', strokeWidth: 3, fill: 'hsl(var(--background))' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}