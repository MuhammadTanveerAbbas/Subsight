"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLoading } from "@/contexts/loading-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  Check,
  Sparkles,
  TrendingUp,
  ShieldX,
  Server,
  FileCog,
  Bell,
  Github,
  Linkedin,
  Database,
  LogIn,
  X,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    {...props}
  >
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

export function LandingPage() {
  const router = useRouter();
  const { setIsLoading } = useLoading();

  const handleStartClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsLoading(true);
    router.push("/dashboard");
  };

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ backgroundColor: "#000000" }}
    >
      <header className="px-3 sm:px-4 lg:px-6 h-14 sm:h-16 flex items-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50 border-b">
        <Link href="#" className="flex items-center justify-center gap-2">
          <div className="relative w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-primary"></div>
            <div className="absolute inset-[6px] rounded-full border-2 border-primary"></div>
            <div className="absolute inset-[12px] rounded-full bg-primary"></div>
          </div>
          <span className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight font-headline">
            Subsight
          </span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            href="/auth/signin"
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Sign In</span>
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section
          id="hero"
          className="relative w-full py-12 md:py-16 lg:py-20 overflow-hidden"
        >
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-3 md:space-y-4 pt-4 md:pt-6">
                <div className="inline-block mb-2">
                  <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 md:px-3 md:py-1.5 rounded-full text-xs font-semibold border border-primary/20">
                    <Sparkles className="w-3 h-3" />
                    AI Powered Insights • Open Source
                  </span>
                </div>
                <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl font-headline px-4">
                  Stop Wasting Money on <br className="hidden sm:block" />
                  <span className="gradient-text">Forgotten Subscriptions</span>
                </h1>
                <p className="max-w-[600px] text-muted-foreground text-sm sm:text-base md:text-lg mx-auto leading-relaxed px-4">
                  Track, manage, and optimize all your recurring payments with
                  AI powered insights. Free and open source.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 md:pt-6 w-full sm:w-auto px-4">
                <Button
                  size="lg"
                  className="text-sm md:text-base px-6 md:px-8 w-full sm:w-auto"
                  asChild
                >
                  <Link href="/auth/signup">
                    Get Started Free{" "}
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-sm md:text-base px-6 md:px-8 w-full sm:w-auto"
                  asChild
                >
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
              </div>
              {/* Info Boxes Section */}
              <div className="pt-8 md:pt-12 lg:pt-14 w-full max-w-5xl">
                <div className="mx-auto grid gap-4 sm:gap-6 grid-cols-3 lg:grid-cols-3 px-4">
                  <Card className="bg-card/50 backdrop-blur-sm border-primary/10 h-full hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
                    <CardHeader className="items-center pb-3">
                      <div className="p-2 rounded-full bg-primary/10 mb-2">
                        <Server className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle className="text-xs sm:text-sm text-center">
                        Export & Analytics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pt-0">
                      <p className="text-muted-foreground text-xs hidden sm:block">
                        Export to JSON, CSV, PDF formats and visualize spending
                        with interactive charts.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-card/50 backdrop-blur-sm border-primary/10 h-full hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
                    <CardHeader className="items-center pb-3">
                      <div className="p-2 rounded-full bg-primary/10 mb-2">
                        <FileCog className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle className="text-xs sm:text-sm text-center">
                        Simulation Mode
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pt-0">
                      <p className="text-muted-foreground text-xs hidden sm:block">
                        Preview budget changes by toggling subscriptions on/off
                        before making decisions.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-card/50 backdrop-blur-sm border-primary/10 h-full hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
                    <CardHeader className="items-center pb-3">
                      <div className="p-2 rounded-full bg-primary/10 mb-2">
                        <Bell className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle className="text-xs sm:text-sm text-center">
                        Keyboard Shortcuts
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pt-0">
                      <p className="text-muted-foreground text-xs hidden sm:block">
                        Power user features: Ctrl+E (JSON), Ctrl+S (CSV), Ctrl+P
                        (PDF), Ctrl+R (Reset).
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-16 lg:py-20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-3 md:space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-background px-3 py-1 text-xs sm:text-sm">
                  Key Features
                </div>
                <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl px-4">
                  Your All In One Subscription Dashboard
                </h2>
                <p className="max-w-[900px] text-muted-foreground text-sm sm:text-base md:text-lg px-4">
                  From AI powered data entry to powerful analytics, we give you
                  the tools to take back control.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-6 sm:gap-8 py-8 sm:py-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-4">
              <Card className="h-full bg-background border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5 group">
                <CardHeader className="items-center">
                  <div className="p-3 sm:p-4 rounded-full bg-primary/10 mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
                    <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <CardTitle className="text-base sm:text-lg">
                    Analytics Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Interactive charts showing monthly/annual spending patterns
                    and trends.
                  </p>
                </CardContent>
              </Card>
              <Card className="h-full bg-background border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5 group">
                <CardHeader className="items-center">
                  <div className="p-3 sm:p-4 rounded-full bg-primary/10 mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
                    <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <CardTitle className="text-base sm:text-lg">
                    AI Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    AI helps auto-fill subscription details and analyze spending
                    patterns.
                  </p>
                </CardContent>
              </Card>
              <Card className="h-full bg-background border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5 group sm:col-span-2 lg:col-span-1">
                <CardHeader className="items-center">
                  <div className="p-3 sm:p-4 rounded-full bg-primary/10 mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
                    <ShieldX className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <CardTitle className="text-base sm:text-lg">
                    Export & Import
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Export to JSON, CSV, PDF formats. Import from JSON/CSV
                    files.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Honest Limitations Section */}
        <section className="w-full py-12 md:py-16 lg:py-20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-3 md:space-y-4 text-center mb-8 md:mb-12">
              <div className="inline-block rounded-lg bg-orange-100 dark:bg-orange-900/20 px-3 py-1 text-xs sm:text-sm text-orange-800 dark:text-orange-200">
                Honest Disclosure
              </div>
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl px-4">
                What Subsight <span className="text-orange-600">Cannot</span> Do
              </h2>
              <p className="max-w-[700px] text-muted-foreground text-sm sm:text-base md:text-lg px-4">
                We believe in transparency. Here are the current limitations:
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-4">
              <Card className="h-full bg-background border-orange-200 dark:border-orange-800">
                <CardHeader className="items-center">
                  <div className="p-3 sm:p-4 rounded-full bg-orange-100 dark:bg-orange-900/20 mb-3 sm:mb-4">
                    <X className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-orange-800 dark:text-orange-200 text-sm sm:text-base">
                    No Bank Integration
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Cannot automatically detect subscriptions from your bank
                    account. Manual entry required.
                  </p>
                </CardContent>
              </Card>
              <Card className="h-full bg-background border-orange-200 dark:border-orange-800">
                <CardHeader className="items-center">
                  <div className="p-3 sm:p-4 rounded-full bg-orange-100 dark:bg-orange-900/20 mb-3 sm:mb-4">
                    <X className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-orange-800 dark:text-orange-200 text-sm sm:text-base">
                    No Auto-Cancellation
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Cannot automatically cancel subscriptions for you. You must
                    cancel them yourself.
                  </p>
                </CardContent>
              </Card>
              <Card className="h-full bg-background border-orange-200 dark:border-orange-800 sm:col-span-2 lg:col-span-1">
                <CardHeader className="items-center">
                  <div className="p-3 sm:p-4 rounded-full bg-orange-100 dark:bg-orange-900/20 mb-3 sm:mb-4">
                    <X className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-orange-800 dark:text-orange-200 text-sm sm:text-base">
                    AI Requires Setup
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    AI features require you to provide your own Google Gemini
                    API key.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="w-full py-12 md:py-16 lg:py-20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-3 md:space-y-4 text-center mb-8 md:mb-12">
              <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-xs sm:text-sm">
                Why Choose Subsight?
              </div>
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl px-4">
                Better Than The Rest
              </h2>
            </div>
            <div className="mx-auto max-w-5xl">
              {/* Mobile View */}
              <div className="block lg:hidden space-y-4">
                <Card className="border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Check className="w-5 h-5 text-primary" />
                      Account Required
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Both Subsight and competitors require account signup
                  </CardContent>
                </Card>
                <Card className="border-muted">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <X className="w-5 h-5 text-muted-foreground" />
                      Bank Integration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Subsight: No | Others: Yes
                  </CardContent>
                </Card>
                <Card className="border-muted">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <X className="w-5 h-5 text-muted-foreground" />
                      Auto-Cancel
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Subsight: No | Others: Some
                  </CardContent>
                </Card>
                <Card className="border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Check className="w-5 h-5 text-primary" />
                      Simulation Mode
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Subsight: Yes | Others: No
                  </CardContent>
                </Card>
                <Card className="border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Check className="w-5 h-5 text-primary" />
                      Keyboard Shortcuts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Subsight: Full | Others: Limited
                  </CardContent>
                </Card>
                <Card className="border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Check className="w-5 h-5 text-primary" />
                      Export Formats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Subsight: JSON/CSV/PDF | Others: Limited
                  </CardContent>
                </Card>
                <Card className="border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Check className="w-5 h-5 text-primary" />
                      100% Free Forever
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Subsight: Yes | Others: $5-15/mo
                  </CardContent>
                </Card>
                <Card className="border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Check className="w-5 h-5 text-primary" />
                      Open Source
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Subsight: Yes | Others: No
                  </CardContent>
                </Card>
              </div>

              {/* Desktop View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="p-4 text-left font-semibold text-sm">
                        Feature
                      </th>
                      <th className="p-4 text-center font-semibold">
                        <div className="flex items-center justify-center gap-2">
                          <div className="relative w-5 h-5 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-2 border-primary"></div>
                            <div className="absolute inset-[4px] rounded-full border-[1.5px] border-primary"></div>
                            <div className="absolute inset-[8px] rounded-full bg-primary"></div>
                          </div>
                          <span className="gradient-text">Subsight</span>
                        </div>
                      </th>
                      <th className="p-4 text-center font-semibold text-muted-foreground text-sm">
                        Others
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-sm">Account Required</td>
                      <td className="p-4 text-center">
                        <Check className="w-5 h-5 text-primary mx-auto" />
                      </td>
                      <td className="p-4 text-center">
                        <Check className="w-5 h-5 text-primary mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b border-border/50 bg-secondary/30 hover:bg-secondary/50 transition-colors">
                      <td className="p-4 text-sm">Bank Integration</td>
                      <td className="p-4 text-center">
                        <X className="w-5 h-5 text-muted-foreground mx-auto" />
                      </td>
                      <td className="p-4 text-center">
                        <Check className="w-5 h-5 text-primary mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-sm">Auto-Cancel Subscriptions</td>
                      <td className="p-4 text-center">
                        <X className="w-5 h-5 text-muted-foreground mx-auto" />
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-muted-foreground text-xs">
                          Some
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-border/50 bg-primary/5 hover:bg-primary/10 transition-colors">
                      <td className="p-4 text-sm font-medium">
                        Simulation Mode
                      </td>
                      <td className="p-4 text-center">
                        <Check className="w-5 h-5 text-primary mx-auto" />
                      </td>
                      <td className="p-4 text-center">
                        <X className="w-5 h-5 text-muted-foreground mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b border-border/50 bg-primary/5 hover:bg-primary/10 transition-colors">
                      <td className="p-4 text-sm font-medium">
                        Keyboard Shortcuts
                      </td>
                      <td className="p-4 text-center">
                        <Check className="w-5 h-5 text-primary mx-auto" />
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-muted-foreground text-xs">
                          Limited
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-border/50 bg-primary/5 hover:bg-primary/10 transition-colors">
                      <td className="p-4 text-sm font-medium">
                        Export Formats
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-primary text-xs font-medium">
                          JSON/CSV/PDF
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-muted-foreground text-xs">
                          Limited
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-border/50 bg-primary/5 hover:bg-primary/10 transition-colors">
                      <td className="p-4 text-sm font-medium">
                        100% Free Forever
                      </td>
                      <td className="p-4 text-center">
                        <Check className="w-5 h-5 text-primary mx-auto" />
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-muted-foreground text-xs">
                          $5-15/mo
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-sm">AI Setup Required</td>
                      <td className="p-4 text-center">
                        <span className="text-orange-600 text-xs font-medium">
                          API Key
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-primary text-xs">Built-in</span>
                      </td>
                    </tr>
                    <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-sm">Cloud Data Storage</td>
                      <td className="p-4 text-center">
                        <Check className="w-5 h-5 text-primary mx-auto" />
                      </td>
                      <td className="p-4 text-center">
                        <Check className="w-5 h-5 text-primary mx-auto" />
                      </td>
                    </tr>
                    <tr className="bg-primary/5 hover:bg-primary/10 transition-colors">
                      <td className="p-4 text-sm font-medium">Open Source</td>
                      <td className="p-4 text-center">
                        <Check className="w-5 h-5 text-primary mx-auto" />
                      </td>
                      <td className="p-4 text-center">
                        <X className="w-5 h-5 text-muted-foreground mx-auto" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-20 lg:py-26">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Take Control of Your{" "}
                  <span className="gradient-text">Subscriptions Today</span>
                </h2>
                <p className="text-muted-foreground text-lg md:text-xl">
                  Start managing your subscriptions with powerful analytics and
                  insights.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Button size="lg" className="text-base px-8" asChild>
                  <Link href="/auth/signup">
                    Start Tracking Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <p className="text-sm text-muted-foreground">
                  Sign up required • 100% Free • Open Source
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-12 md:py-16 lg:py-20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Get Started in 3 Simple Steps
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Gain clarity on your spending in under five minutes.
              </p>
            </div>
            <div className="mx-auto grid gap-8 sm:max-w-4xl sm:grid-cols-3 md:gap-12 mt-12">
              <div className="grid gap-1 text-center">
                <h3 className="text-lg font-bold">1. Add Your Subscriptions</h3>
                <p className="text-sm text-muted-foreground">
                  Quickly add your services manually or let our AI assistant do
                  the heavy lifting for you.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <h3 className="text-lg font-bold">
                  2. Visualize Your Spending
                </h3>
                <p className="text-sm text-muted-foreground">
                  See exactly where your money is going with our intuitive and
                  interactive charts.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <h3 className="text-lg font-bold">3. Find & Cut Waste</h3>
                <p className="text-sm text-muted-foreground">
                  Use our AI analysis tools to identify and eliminate unwanted
                  subscriptions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Section */}
        <section id="privacy" className="w-full py-12 md:py-16 lg:py-20">
          <div className="container grid items-center justify-center gap-8 px-4 text-center md:px-6">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-background px-3 py-1 text-sm">
                Privacy First
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Secure Data Management
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                Subsight requires account signup and stores your subscription
                data securely using Supabase authentication and database.
              </p>
            </div>
            <div className="grid w-full grid-cols-1 md:grid-cols-3 gap-6 pt-8 max-w-4xl">
              <div className="flex flex-col items-center gap-2">
                <LogIn className="w-10 h-10 text-primary" />
                <h3 className="font-semibold">Secure Account</h3>
                <p className="text-sm text-muted-foreground">
                  Sign up required for data security.
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Database className="w-10 h-10 text-primary" />
                <h3 className="font-semibold">Cloud Storage</h3>
                <p className="text-sm text-muted-foreground">
                  Your data is securely stored in the cloud.
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <ShieldX className="w-10 h-10 text-primary" />
                <h3 className="font-semibold">Data Protection</h3>
                <p className="text-sm text-muted-foreground">
                  Industry-standard security measures.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="w-full py-12 md:py-16 lg:py-20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8 md:mb-12">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl px-4">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="mx-auto max-w-3xl w-full">
              <Accordion type="single" collapsible className="w-full space-y-2">
                <AccordionItem
                  value="item-1"
                  className="border rounded-lg px-4 bg-card"
                >
                  <AccordionTrigger className="text-left text-sm sm:text-base hover:no-underline py-4">
                    Is my data secure?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-4">
                    Yes, your data is stored securely in our cloud database with
                    proper authentication and encryption. We follow industry
                    standards for data protection.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="item-2"
                  className="border rounded-lg px-4 bg-card"
                >
                  <AccordionTrigger className="text-left text-sm sm:text-base hover:no-underline py-4">
                    Is Subsight free to use?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-4">
                    Yes, Subsight is completely free to use with no hidden fees
                    or premium tiers.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="item-3"
                  className="border rounded-lg px-4 bg-card"
                >
                  <AccordionTrigger className="text-left text-sm sm:text-base hover:no-underline py-4">
                    Do I need to provide my own AI API key?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-4">
                    Yes, to use AI features you need to provide your own Google
                    Gemini API key. You can get a free key from Google AI
                    Studio. The app works without AI, but you'll need to
                    manually enter subscription details.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="item-4"
                  className="border rounded-lg px-4 bg-card"
                >
                  <AccordionTrigger className="text-left text-sm sm:text-base hover:no-underline py-4">
                    Can Subsight automatically detect my subscriptions?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-4">
                    No, Subsight cannot connect to your bank account or
                    automatically detect subscriptions. You need to manually add
                    each subscription or use the AI assistant to help fill in
                    details.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="item-5"
                  className="border rounded-lg px-4 bg-card"
                >
                  <AccordionTrigger className="text-left text-sm sm:text-base hover:no-underline py-4">
                    Can I import or export my data?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-4">
                    Yes, you can export your data to JSON, CSV, or PDF formats
                    using keyboard shortcuts (Ctrl+E, Ctrl+S, Ctrl+P). Import
                    functionality supports JSON and CSV files.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="item-6"
                  className="border rounded-lg px-4 bg-card"
                >
                  <AccordionTrigger className="text-left text-sm sm:text-base hover:no-underline py-4">
                    Can Subsight cancel subscriptions for me?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-4">
                    No, Subsight cannot automatically cancel subscriptions. It
                    helps you track and analyze your subscriptions, but you must
                    cancel them yourself through the respective service
                    providers.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>
      </main>
      <footer className="relative border-t bg-gradient-to-b from-background via-background to-muted/20 mt-12 md:mt-16 lg:mt-20 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl"></div>
        </div>

        <div className="container relative z-10 px-4 md:px-6 py-10 md:py-12 lg:py-14">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-8">
            {/* Brand Section */}
            <div className="lg:col-span-5 space-y-4">
              <Link href="/" className="inline-flex items-center gap-2 group">
                <div className="relative w-9 h-9 flex items-center justify-center transition-transform group-hover:scale-110">
                  <div className="absolute inset-0 rounded-full border-2 border-primary animate-pulse"></div>
                  <div className="absolute inset-[6px] rounded-full border-2 border-primary"></div>
                  <div className="absolute inset-[12px] rounded-full bg-primary"></div>
                </div>
                <span className="text-xl font-bold gradient-text">
                  Subsight
                </span>
              </Link>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm leading-relaxed">
                Your intelligent subscription management platform. Track,
                analyze, and optimize recurring payments with AI-powered
                insights.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
                  <Check className="w-3 h-3" />
                  100% Free
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
                  <Github className="w-3 h-3" />
                  Open Source
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-3">
              <h3 className="font-semibold text-xs sm:text-sm mb-4 text-foreground">
                Quick Links
              </h3>
              <nav className="flex flex-col gap-3">
                <Link
                  href="/auth/signup"
                  className="group inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
                >
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  Get Started
                </Link>
                <Link
                  href="/auth/signin"
                  className="group inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
                >
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  Sign In
                </Link>
                <Link
                  href="#features"
                  className="group inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
                >
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  Features
                </Link>
                <Link
                  href="#faq"
                  className="group inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
                >
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  FAQ
                </Link>
              </nav>
            </div>

            {/* Resources */}
            <div className="lg:col-span-4">
              <h3 className="font-semibold text-xs sm:text-sm mb-4 text-foreground">
                Connect With Us
              </h3>
              <div className="flex gap-2 mb-6">
                <Link
                  href="https://www.linkedin.com/in/muhammadtanveerabbas"
                  className="group relative p-3 rounded-xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10"
                  target="_blank"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
                <Link
                  href="https://github.com/muhammadtanveerabbas"
                  className="group relative p-3 rounded-xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10"
                  target="_blank"
                  aria-label="GitHub"
                >
                  <Github className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
                <Link
                  href="https://twitter.com/m_tanveerabbas"
                  className="group relative p-3 rounded-xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10"
                  target="_blank"
                  aria-label="Twitter"
                >
                  <XIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Built with modern technologies:
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground">
                    Next.js
                  </span>
                  <span className="px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground">
                    TypeScript
                  </span>
                  <span className="px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground">
                    Supabase
                  </span>
                  <span className="px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground">
                    AI
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} Subsight. All rights reserved.
              </p>
              <Link
                href="https://muhammadtanveerabbas.vercel.app/"
                target="_blank"
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <span>Contact Us</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
