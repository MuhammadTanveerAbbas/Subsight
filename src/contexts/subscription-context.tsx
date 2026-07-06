"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import type {
  Subscription,
  SpendingGoal,
  CustomCategory,
  Currency,
} from "@/lib/types";
import { useAuth } from "./auth-context";
import { logError } from "@/lib/error-logger";
import { createClient } from "@/lib/supabase/client";
import {
  createSubscription as createSubscriptionApi,
  updateSubscription as updateSubscriptionApi,
  deleteSubscription as deleteSubscriptionApi,
} from "@/lib/subscriptions-api";
import { useToast } from "@/hooks/use-toast";

const IS_SERVER = typeof window === "undefined";

function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (IS_SERVER) return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      logError(error, { key, operation: "localStorage.getItem" });
      return initialValue;
    }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = useCallback(
    (value) => {
      if (IS_SERVER) return;
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error: any) {
        if (error?.name === "QuotaExceededError") {
          window.dispatchEvent(new CustomEvent("subsight:quota-exceeded"));
        }
        logError(error, { key, operation: "localStorage.setItem" });
      }
    },
    [key, storedValue],
  );

  return [storedValue, setValue];
}

interface SubscriptionContextType {
  subscriptions: Subscription[];
  addSubscription: (subscription: Omit<Subscription, "id">) => Promise<void>;
  updateSubscription: (
    id: string,
    updates: Partial<Subscription>,
  ) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  importSubscriptions: (newSubscriptions: Subscription[]) => void;
  incrementUsage: (id: string) => Promise<void>;
  upgradePromptOpen: boolean;
  upgradePromptMessage: string;
  showUpgradePrompt: (message?: string) => void;
  dismissUpgradePrompt: () => void;
  spendingGoals: SpendingGoal[];
  addSpendingGoal: (goal: Omit<SpendingGoal, "id">) => void;
  updateSpendingGoal: (id: string, updates: Partial<SpendingGoal>) => void;
  deleteSpendingGoal: (id: string) => void;
  customCategories: CustomCategory[];
  addCustomCategory: (category: Omit<CustomCategory, "id">) => void;
  deleteCustomCategory: (id: string) => void;
  displayCurrency: Currency;
  setDisplayCurrency: (currency: Currency) => void;
  loading: boolean;
  refetchSubscriptions: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined,
);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgradePromptOpen, setUpgradePromptOpen] = useState(false);
  const [upgradePromptMessage, setUpgradePromptMessage] = useState(
    "You have reached the 5 subscription limit on the free plan.",
  );
  const [spendingGoals, setSpendingGoals] = useLocalStorage<SpendingGoal[]>(
    "spendingGoals",
    [],
  );
  const [customCategories, setCustomCategories] = useLocalStorage<
    CustomCategory[]
  >("customCategories", []);
  const [displayCurrency, setDisplayCurrency] = useLocalStorage<Currency>(
    "displayCurrency",
    "USD",
  );

  useEffect(() => {
    const handler = () => toast({
      variant: "destructive",
      title: "Storage full",
      description: "Export your data and remove some subscriptions to free up space.",
    });
    window.addEventListener("subsight:quota-exceeded", handler);
    return () => window.removeEventListener("subsight:quota-exceeded", handler);
  }, [toast]);

  const refetchSubscriptions = useCallback(async () => {
    if (!user) {
      setSubscriptions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("subscriptions")
        .select(
          "id, name, provider, category, icon, start_date, billing_cycle, amount, currency, notes, active_status, auto_renew, reminder_enabled, reminder_days_before, next_renewal_date, last_reminder_sent, usage_count, last_used",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedSubs = data.map((sub) => ({
          id: sub.id,
          name: sub.name,
          provider: sub.provider,
          category: sub.category,
          icon: sub.icon,
          startDate: sub.start_date,
          billingCycle: sub.billing_cycle as any,
          amount: Number(sub.amount),
          currency: sub.currency as any,
          notes: sub.notes || "",
          activeStatus: sub.active_status,
          autoRenew: sub.auto_renew,
          reminderEnabled: sub.reminder_enabled ?? false,
          reminderDaysBefore: sub.reminder_days_before ?? 3,
          nextRenewalDate: sub.next_renewal_date ?? null,
          lastReminderSent: sub.last_reminder_sent ?? null,
          usageCount: sub.usage_count,
          lastUsed: sub.last_used,
        }));
        setSubscriptions(formattedSubs);
      }
    } catch (error) {
      logError(error, { context: "fetchSubscriptions", userId: user.id });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refetchSubscriptions();
  }, [refetchSubscriptions]);

  const addSubscription = useCallback(
    async (subscription: Omit<Subscription, "id">) => {
      if (!user) throw new Error("User not authenticated");

      try {
        await createSubscriptionApi({
          name: subscription.name,
          amount: subscription.amount,
          billingCycle: subscription.billingCycle,
          category: subscription.category || null,
          provider: subscription.provider || null,
          startDate: subscription.startDate?.split("T")[0],
          currency: subscription.currency,
          autoRenew: subscription.autoRenew,
          notes: subscription.notes || null,
        });
        await refetchSubscriptions();
      } catch (error) {
        if ((error as Error & { upgrade?: boolean })?.upgrade) {
          setUpgradePromptMessage(
            "You have reached the 5 subscription limit on the free plan.",
          );
          setUpgradePromptOpen(true);
        }
        logError(error, { context: "addSubscription" });
        throw error instanceof Error ? error : new Error(String(error));
      }
    },
    [user, refetchSubscriptions],
  );

  const updateSubscription = useCallback(
    async (id: string, updates: Partial<Subscription>) => {
      if (!user) return;

      try {
        await updateSubscriptionApi(id, {
          name: updates.name,
          provider: updates.provider,
          category: updates.category,
          startDate: updates.startDate?.split("T")[0],
          billingCycle: updates.billingCycle,
          amount: updates.amount,
          currency: updates.currency,
          notes: updates.notes,
          activeStatus: updates.activeStatus,
          autoRenew: updates.autoRenew,
          reminderEnabled: updates.reminderEnabled,
          reminderDaysBefore: updates.reminderDaysBefore,
        });

        await refetchSubscriptions();
      } catch (error) {
        if ((error as Error & { upgrade?: boolean })?.upgrade) {
          setUpgradePromptMessage(
            "Email reminders are available on the Pro plan.",
          );
          setUpgradePromptOpen(true);
        }
        logError(error, { context: "updateSubscription", id });
        throw error;
      }
    },
    [user, refetchSubscriptions],
  );

  const deleteSubscription = useCallback(
    async (id: string) => {
      if (!user) return;

      try {
        await deleteSubscriptionApi(id);
        setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));
      } catch (error) {
        logError(error, { context: "deleteSubscription", id });
        throw error;
      }
    },
    [user],
  );

  const incrementUsage = useCallback(
    async (id: string) => {
      const sub = subscriptions.find((s) => s.id === id);
      if (!sub) return;
      await updateSubscription(id, {
        usageCount: (sub.usageCount || 0) + 1,
        lastUsed: new Date().toISOString(),
      });
    },
    [subscriptions, updateSubscription],
  );

  const addSpendingGoal = useCallback(
    (goal: Omit<SpendingGoal, "id">) => {
      const newGoal = { ...goal, id: crypto.randomUUID() };
      setSpendingGoals((prev: SpendingGoal[]) => [...prev, newGoal]);
    },
    [setSpendingGoals],
  );

  const updateSpendingGoal = useCallback(
    (id: string, updates: Partial<SpendingGoal>) => {
      setSpendingGoals((prev: SpendingGoal[]) =>
        prev.map((goal: SpendingGoal) =>
          goal.id === id ? { ...goal, ...updates } : goal,
        ),
      );
    },
    [setSpendingGoals],
  );

  const deleteSpendingGoal = useCallback(
    (id: string) => {
      setSpendingGoals((prev: SpendingGoal[]) =>
        prev.filter((goal: SpendingGoal) => goal.id !== id),
      );
    },
    [setSpendingGoals],
  );

  const addCustomCategory = useCallback(
    (category: Omit<CustomCategory, "id">) => {
      const newCategory = { ...category, id: crypto.randomUUID() };
      setCustomCategories((prev: CustomCategory[]) => [...prev, newCategory]);
    },
    [setCustomCategories],
  );

  const deleteCustomCategory = useCallback(
    (id: string) => {
      setCustomCategories((prev: CustomCategory[]) =>
        prev.filter((cat: CustomCategory) => cat.id !== id),
      );
    },
    [setCustomCategories],
  );

  const importSubscriptions = useCallback(
    async (newSubscriptions: Subscription[]) => {
      if (!user || !Array.isArray(newSubscriptions)) {
        logError(new Error("Import failed: no user or data is not an array"), {
          context: "importSubscriptions",
        });
        return;
      }

      try {
        const validSubs = newSubscriptions.filter((s) => s.name && s.amount);
        for (const sub of validSubs) {
          await addSubscription({
            name: sub.name,
            provider: sub.provider,
            category: sub.category,
            icon: sub.icon,
            startDate: sub.startDate,
            billingCycle: sub.billingCycle,
            amount: sub.amount,
            currency: sub.currency,
            notes: sub.notes,
            activeStatus: sub.activeStatus,
            autoRenew: sub.autoRenew,
            usageCount: sub.usageCount,
          });
        }
      } catch (error) {
        logError(error, { context: "importSubscriptions" });
      }
    },
    [user, addSubscription],
  );

  const value = useMemo(
    () => ({
      subscriptions,
      addSubscription,
      updateSubscription,
      deleteSubscription,
      importSubscriptions,
      incrementUsage,
      upgradePromptOpen,
      upgradePromptMessage,
      showUpgradePrompt: (message?: string) => {
        if (message) setUpgradePromptMessage(message);
        setUpgradePromptOpen(true);
      },
      dismissUpgradePrompt: () => setUpgradePromptOpen(false),
      spendingGoals,
      addSpendingGoal,
      updateSpendingGoal,
      deleteSpendingGoal,
      customCategories,
      addCustomCategory,
      deleteCustomCategory,
      displayCurrency,
      setDisplayCurrency,
      loading,
      refetchSubscriptions,
    }),
    [
      subscriptions,
      addSubscription,
      updateSubscription,
      deleteSubscription,
      importSubscriptions,
      incrementUsage,
      upgradePromptOpen,
      upgradePromptMessage,
      spendingGoals,
      addSpendingGoal,
      updateSpendingGoal,
      deleteSpendingGoal,
      customCategories,
      addCustomCategory,
      deleteCustomCategory,
      displayCurrency,
      setDisplayCurrency,
      loading,
      refetchSubscriptions,
    ],
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptions() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      "useSubscriptions must be used within a SubscriptionProvider",
    );
  }
  return context;
}
