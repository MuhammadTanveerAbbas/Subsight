"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { logError } from "@/lib/error-logger";

interface User {
  id: string;
  email: string;
}

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: "free" | "pro" | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: {
    full_name?: string;
    avatar_url?: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    let sessionChecked = false;

    // Listen for auth changes first to avoid missing events during init
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email! });
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    // Then check active session to hydrate initial state
    const initSession = async () => {
      if (!isMounted || sessionChecked) return;
      sessionChecked = true;

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email! });
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        logError(error, { context: "initSession" });
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, full_name, avatar_url, subscription_tier, stripe_customer_id, stripe_subscription_id, subscription_status, current_period_end, created_at, updated_at",
        )
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      if (data) setProfile(data);
    } catch (error: any) {
      logError(error, { context: "fetchProfile", userId });
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          full_name: fullName,
          avatar_url: null,
          subscription_tier: "free",
        });

        if (profileError) throw profileError;

        toast({
          title: "Success",
          description: "Account created successfully!",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign Up Error",
        description: error.message,
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Signed in successfully!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign In Error",
        description: error.message,
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setProfile(null);

      toast({
        title: "Success",
        description: "Signed out successfully!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign Out Error",
        description: error.message,
      });
    }
  };

  const updateProfile = async (updates: {
    full_name?: string;
    avatar_url?: string;
  }) => {
    try {
      if (!user) throw new Error("No user logged in");

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;

      await fetchProfile(user.id);

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Error",
        description: error.message,
      });
      throw error;
    }
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
