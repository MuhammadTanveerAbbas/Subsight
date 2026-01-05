"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import type { Subscription, SpendingGoal, CustomCategory, Currency } from "@/lib/types";
import { logError } from "@/lib/error-logger";

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
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscriptions, setSubscriptions] = useLocalStorage<Subscription[]>("subscriptions", []);
  const [spendingGoals, setSpendingGoals] = useLocalStorage<SpendingGoal[]>("spendingGoals", []);
  const [customCategories, setCustomCategories] = useLocalStorage<CustomCategory[]>("customCategories", []);
  const [displayCurrency, setDisplayCurrency] = useLocalStorage<Currency>("displayCurrency", "USD");

  const addSubscription = useCallback(
    (subscription: Omit<Subscription, "id">) => {
      const newSubscription = { ...subscription, id: crypto.randomUUID() };
      setSubscriptions((prev: Subscription[]) => [...prev, newSubscription]);
      
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('subscription_added', {
          category: subscription.category,
          billingCycle: subscription.billingCycle,
          currency: subscription.currency,
        });
      }
    },
    [setSubscriptions]
  );

  const updateSubscription = useCallback(
    (id: string, updates: Partial<Subscription>) => {
      setSubscriptions((prev: Subscription[]) =>
        prev.map((sub: Subscription) => (sub.id === id ? { ...sub, ...updates } : sub))
      );
      
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('subscription_updated', { id });
      }
    },
    [setSubscriptions]
  );

  const deleteSubscription = useCallback((id: string) => {
    setSubscriptions((prev: Subscription[]) => prev.filter((sub: Subscription) => sub.id !== id));
    
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('subscription_deleted', { id });
    }
  }, [setSubscriptions]);

  const incrementUsage = useCallback((id: string) => {
    setSubscriptions((prev: Subscription[]) =>
      prev.map((sub: Subscription) => 
        sub.id === id 
          ? { ...sub, usageCount: (sub.usageCount || 0) + 1, lastUsed: new Date().toISOString() }
          : sub
      )
    );
  }, [setSubscriptions]);

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

  const importSubscriptions = useCallback((newSubscriptions: Subscription[]) => {
    if (Array.isArray(newSubscriptions)) {
        const validSubs = newSubscriptions.filter(s => s.id && s.name && s.amount);
        setSubscriptions(validSubs);
    } else {
        console.error("Import failed: data is not an array.");
    }
  }, [setSubscriptions]);

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
