"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Bell,
  Check,
  Circle,
  Lock,
  Package,
  Shield,
  Sparkles,
  Target,
  User,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  avatarUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type ProfileForm = z.infer<typeof profileSchema>;

function SettingsContent() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile, updateProfile } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile?.full_name || "",
      avatarUrl: profile?.avatar_url || "",
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true);
    try {
      await updateProfile({
        full_name: data.fullName,
        avatar_url: data.avatarUrl || undefined,
      });
    } catch (error) {
      // Error handled in context
    } finally {
      setIsLoading(false);
    }
  };

  const isPro = profile?.subscription_tier === "pro";

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center gap-2 sm:gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <Target className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <h1 className="text-lg sm:text-2xl font-semibold tracking-tight font-headline">
            Subsight
          </h1>
        </Link>
      </header>

      <main className="container max-w-4xl mx-auto p-3 sm:p-4 md:p-8 space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl">
              Profile Settings
            </CardTitle>
            <CardDescription className="text-sm">
              Update your profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 sm:space-y-6"
            >
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="text-base sm:text-lg bg-primary text-primary-foreground">
                    {profile?.full_name ? (
                      getInitials(profile.full_name)
                    ) : (
                      <User className="w-8 h-8" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-medium text-base sm:text-lg">
                    {profile?.full_name || "User"}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground break-all">
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  {...register("fullName")}
                  disabled={isLoading}
                  className="h-10 sm:h-11"
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatarUrl" className="text-sm">
                  Avatar URL (optional)
                </Label>
                <Input
                  id="avatarUrl"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  {...register("avatarUrl")}
                  disabled={isLoading}
                  className="h-10 sm:h-11"
                />
                {errors.avatarUrl && (
                  <p className="text-sm text-destructive">
                    {errors.avatarUrl.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Provide a URL to your profile picture
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto h-10 sm:h-11"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  className="w-full sm:w-auto h-10 sm:h-11"
                >
                  <Link href="/dashboard">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Subscription Section */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Subscription
                </CardTitle>
                <CardDescription className="text-sm">
                  Manage your subscription plan
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                <div>
                  <p className="font-medium text-sm sm:text-base flex items-center gap-2">
                    {isPro ? (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Pro Plan
                      </>
                    ) : (
                      <>
                        <Package className="w-4 h-4" />
                        Free Plan
                      </>
                    )}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {isPro
                      ? "You have access to all Pro features"
                      : "Limited to 5 subscriptions"}
                  </p>
                </div>
              </div>

              {!isPro && (
                <div className="space-y-3">
                  <div className="text-sm space-y-2">
                    <p className="font-medium">Pro features:</p>
                    <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        Unlimited subscriptions
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        Email reminders
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        AI auto fill
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        AI spending analysis
                      </li>
                    </ul>
                  </div>
                  <Button asChild className="w-full h-10 sm:h-11 gap-2">
                    <Link href="/pricing">
                      <Zap className="w-4 h-4" />
                      Upgrade to Pro
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Features Section */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Features
            </CardTitle>
            <CardDescription className="text-sm">
              Available features on your plan
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid gap-3 sm:gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Email Reminders</span>
                </div>
                <span
                  className={`text-xs font-medium flex items-center gap-1 ${isPro ? "text-green-600" : "text-muted-foreground"}`}
                >
                  {isPro ? (
                    <>
                      <Check className="w-4 h-4" />
                      Pro
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4" />
                      Free
                    </>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">AI auto fill</span>
                </div>
                <span
                  className={`text-xs font-medium flex items-center gap-1 ${isPro ? "text-green-600" : "text-muted-foreground"}`}
                >
                  {isPro ? (
                    <>
                      <Check className="w-4 h-4" />
                      Pro
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4" />
                      Free
                    </>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">AI Spending Analysis</span>
                </div>
                <span
                  className={`text-xs font-medium flex items-center gap-1 ${isPro ? "text-green-600" : "text-muted-foreground"}`}
                >
                  {isPro ? (
                    <>
                      <Check className="w-4 h-4" />
                      Pro
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4" />
                      Free
                    </>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Unlimited Subscriptions</span>
                </div>
                <span
                  className={`text-xs font-medium flex items-center gap-1 ${isPro ? "text-green-600" : "text-muted-foreground"}`}
                >
                  {isPro ? (
                    <>
                      <Check className="w-4 h-4" />
                      Pro
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4" />
                      Free (5 max)
                    </>
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security Section */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy & Security
            </CardTitle>
            <CardDescription className="text-sm">
              Your data is secure and private
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">End to End Encrypted</p>
                  <p className="text-xs text-muted-foreground">
                    Your data is encrypted in transit and at rest
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">No Third Party Sharing</p>
                  <p className="text-xs text-muted-foreground">
                    We never sell or share your data
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Lock className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Supabase Powered</p>
                  <p className="text-xs text-muted-foreground">
                    Enterprise grade security with PostgreSQL
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Bell className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Smart Reminders</p>
                  <p className="text-xs text-muted-foreground">
                    Never miss a subscription renewal again
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">AI Powered Insights</p>
                  <p className="text-xs text-muted-foreground">
                    Real-time analysis powered by Groq
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}
