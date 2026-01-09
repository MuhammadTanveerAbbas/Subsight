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
import type { Subscription, SpendingGoal, CustomCategory, Currency } from "@/lib/types";
import { logError } from "@/lib/error-logger";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./auth-context";

const IS_SERVER = typeof window === "undefined";

function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (IS_SERVER) {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      logError(error as Error, { key, operation: 'localStorage.getItem' });
      return initialValue;
    }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = useCallback((value) => {
    if (IS_SERVER) {
      console.warn(`Tried to set localStorage key "${key}" on the server.`);
      return;
    }
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error: any) {
      if (error?.name === 'QuotaExceededError') {
        alert('Storage quota exceeded. Please export your data and clear some subscriptions.');
      }
      logError(error as Error, { key, operation: 'localStorage.setItem' });
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

interface SubscriptionContextType {
  subscriptions: Subscription[];
  addSubscription: (subscription: Omit<Subscription, "id">) => void;
  updateSubscription: (id: string, updates: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;
  importSubscriptions: (newSubscriptions: Subscription[]) => void;
  incrementUsage: (id: string) => void;
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
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [spendingGoals, setSpendingGoals] = useLocalStorage<SpendingGoal[]>("spendingGoals", []);
  const [customCategories, setCustomCategories] = useLocalStorage<CustomCategory[]>("customCategories", []);
  const [displayCurrency, setDisplayCurrency] = useLocalStorage<Currency>("displayCurrency", "USD");

  // Fetch subscriptions from Supabase
  useEffect(() => {
    if (!user) {
      setSubscriptions([]);
      setLoading(false);
      return;
    }

    const fetchSubscriptions = async () => {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const formattedSubs = data.map(sub => ({
            id: sub.id,
            name: sub.name,
            provider: sub.provider,
            category: sub.category,
            icon: sub.icon,
            startDate: sub.start_date,
            billingCycle: sub.billing_cycle as any,
            amount: Number(sub.amount),
            currency: sub.currency as any,
            notes: sub.notes || '',
            activeStatus: sub.active_status,
            autoRenew: sub.auto_renew,
            usageCount: sub.usage_count,
            lastUsed: sub.last_used,
          }));
          setSubscriptions(formattedSubs);
        }
      } catch (error) {
        logError(error as Error, { operation: 'fetchSubscriptions' });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [user]);

  const addSubscription = useCallback(
    async (subscription: Omit<Subscription, "id">) => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            name: subscription.name,
            provider: subscription.provider,
            category: subscription.category,
            icon: subscription.icon,
            start_date: subscription.startDate,
            billing_cycle: subscription.billingCycle,
            amount: subscription.amount,
            currency: subscription.currency,
            notes: subscription.notes,
            active_status: subscription.activeStatus,
            auto_renew: subscription.autoRenew,
            usage_count: subscription.usageCount || 0,
          })
          .select()
          .single();

        if (error) throw error;

        if (data) {
          const newSub: Subscription = {
            id: data.id,
            name: data.name,
            provider: data.provider,
            category: data.category,
            icon: data.icon,
            startDate: data.start_date,
            billingCycle: data.billing_cycle as any,
            amount: Number(data.amount),
            currency: data.currency as any,
            notes: data.notes || '',
            activeStatus: data.active_status,
            autoRenew: data.auto_renew,
            usageCount: data.usage_count,
            lastUsed: data.last_used,
          };
          setSubscriptions((prev) => [newSub, ...prev]);
        }

        if (typeof window !== 'undefined' && (window as any).analytics) {
          (window as any).analytics.track('subscription_added', {
            category: subscription.category,
            billingCycle: subscription.billingCycle,
            currency: subscription.currency,
          });
        }
      } catch (error) {
        logError(error as Error, { operation: 'addSubscription' });
        throw error;
      }
    },
    [user]
  );

  const updateSubscription = useCallback(
    async (id: string, updates: Partial<Subscription>) => {
      if (!user) return;

      try {
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.provider !== undefined) dbUpdates.provider = updates.provider;
        if (updates.category !== undefined) dbUpdates.category = updates.category;
        if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
        if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
        if (updates.billingCycle !== undefined) dbUpdates.billing_cycle = updates.billingCycle;
        if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
        if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
        if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
        if (updates.activeStatus !== undefined) dbUpdates.active_status = updates.activeStatus;
        if (updates.autoRenew !== undefined) dbUpdates.auto_renew = updates.autoRenew;
        if (updates.usageCount !== undefined) dbUpdates.usage_count = updates.usageCount;
        if (updates.lastUsed !== undefined) dbUpdates.last_used = updates.lastUsed;

        const { error } = await supabase
          .from('subscriptions')
          .update(dbUpdates)
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;

        setSubscriptions((prev) =>
          prev.map((sub) => (sub.id === id ? { ...sub, ...updates } : sub))
        );

        if (typeof window !== 'undefined' && (window as any).analytics) {
          (window as any).analytics.track('subscription_updated', { id });
        }
      } catch (error) {
        logError(error as Error, { operation: 'updateSubscription' });
        throw error;
      }
    },
    [user]
  );

  const deleteSubscription = useCallback(
    async (id: string) => {
      if (!user) return;

      try {
        const { error } = await supabase
          .from('subscriptions')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;

        setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));

        if (typeof window !== 'undefined' && (window as any).analytics) {
          (window as any).analytics.track('subscription_deleted', { id });
        }
      } catch (error) {
        logError(error as Error, { operation: 'deleteSubscription' });
        throw error;
      }
    },
    [user]
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
    [subscriptions, updateSubscription]
  );

  const addSpendingGoal = useCallback((goal: Omit<SpendingGoal, "id">) => {
    const newGoal = { ...goal, id: crypto.randomUUID() };
    setSpendingGoals((prev: SpendingGoal[]) => [...prev, newGoal]);
  }, [setSpendingGoals]);

  const updateSpendingGoal = useCallback((id: string, updates: Partial<SpendingGoal>) => {
    setSpendingGoals((prev: SpendingGoal[]) =>
      prev.map((goal: SpendingGoal) => (goal.id === id ? { ...goal, ...updates } : goal))
    );
  }, [setSpendingGoals]);

  const deleteSpendingGoal = useCallback((id: string) => {
    setSpendingGoals((prev: SpendingGoal[]) => prev.filter((goal: SpendingGoal) => goal.id !== id));
  }, [setSpendingGoals]);

  const addCustomCategory = useCallback((category: Omit<CustomCategory, "id">) => {
    const newCategory = { ...category, id: crypto.randomUUID() };
    setCustomCategories((prev: CustomCategory[]) => [...prev, newCategory]);
  }, [setCustomCategories]);

  const deleteCustomCategory = useCallback((id: string) => {
    setCustomCategories((prev: CustomCategory[]) => prev.filter((cat: CustomCategory) => cat.id !== id));
  }, [setCustomCategories]);

  const importSubscriptions = useCallback(
    async (newSubscriptions: Subscription[]) => {
      if (!user || !Array.isArray(newSubscriptions)) {
        console.error("Import failed: no user or data is not an array.");
        return;
      }

      try {
        const validSubs = newSubscriptions.filter(s => s.name && s.amount);
        
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
        logError(error as Error, { operation: 'importSubscriptions' });
      }
    },
    [user, addSubscription]
  );

  const value = useMemo(
    () => ({
      subscriptions,
      addSubscription,
      updateSubscription,
      deleteSubscription,
      importSubscriptions,
      incrementUsage,
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
    }),
    [
      subscriptions,
      addSubscription,
      updateSubscription,
      deleteSubscription,
      importSubscriptions,
      incrementUsage,
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
    ]
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
      "useSubscriptions must be used within a SubscriptionProvider"
    );
  }
  return context;
}
