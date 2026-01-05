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
  Target,
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
      <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
        <Link href="#" className="flex items-center justify-center gap-2">
          <Target className="w-6 h-6 text-primary" />
          <span className="text-2xl font-semibold tracking-tight font-headline">
            Subsight
          </span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            href="/auth/signin"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section
          id="hero"
          className="relative w-full pt-16 md:pt-18 lg:pt-14 pb-16 md:pb-18 lg:pb-14 overflow-hidden"
        >
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-4 pt-6">
                <div className="inline-block mb-2">
                  <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-semibold border border-primary/20">
                    🎯 100% Free & Open Source
                  </span>
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl font-headline">
                  Stop Wasting Money on <br className="hidden lg:block" />
                  <span className="gradient-text">Forgotten Subscriptions</span>
                </h1>
                <p className="max-w-[600px] text-muted-foreground text-base md:text-lg mx-auto leading-relaxed">
                  Track, manage, and optimize all your recurring payments with AI-powered insights. Requires account signup for secure cloud storage.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row pt-6">
                <Button size="lg" className="text-base px-8" asChild>
                  <Link href="/auth/signup">
                    Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-8"
                  asChild
                >
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
              </div>
              {/* Info Boxes Section */}
              <div className="pt-10 md:pt-14 w-full max-w-5xl hidden md:block">
                <div className="md:hidden">
                  <Carousel
                    opts={{
                      align: "start",
                      loop: true,
                    }}
                  >
                    <CarouselContent>
                      <CarouselItem className="basis-full sm:basis-1/2">
                        <Card className="bg-card/50 backdrop-blur-sm border-primary/10 h-full hover:border-primary/30 transition-colors">
                          <CardHeader className="items-center pb-3">
                            <div className="p-2 rounded-full bg-primary/10 mb-2">
                              <Server className="w-5 h-5 text-primary" />
                            </div>
                            <CardTitle className="text-base">
                              Export & Analytics
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="text-center pt-0">
                            <p className="text-xs text-muted-foreground">
                              Export to JSON, CSV, PDF formats and visualize
                              spending with interactive charts.
                            </p>
                          </CardContent>
                        </Card>
                      </CarouselItem>
                      <CarouselItem className="basis-full sm:basis-1/2">
                        <Card className="bg-card/50 backdrop-blur-sm border-primary/10 h-full hover:border-primary/30 transition-colors">
                          <CardHeader className="items-center pb-3">
                            <div className="p-2 rounded-full bg-primary/10 mb-2">
                              <FileCog className="w-5 h-5 text-primary" />
                            </div>
                            <CardTitle className="text-base">
                              Simulation Mode
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="text-center pt-0">
                            <p className="text-xs text-muted-foreground">
                              Preview budget changes by toggling subscriptions
                              on/off before making decisions.
                            </p>
                          </CardContent>
                        </Card>
                      </CarouselItem>
                      <CarouselItem className="basis-full sm:basis-1/2">
                        <Card className="bg-card/50 backdrop-blur-sm border-primary/10 h-full hover:border-primary/30 transition-colors">
                          <CardHeader className="items-center pb-3">
                            <div className="p-2 rounded-full bg-primary/10 mb-2">
                              <Bell className="w-5 h-5 text-primary" />
                            </div>
                            <CardTitle className="text-base">
                              Keyboard Shortcuts
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="text-center pt-0">
                            <p className="text-xs text-muted-foreground">
                              Power user features: Ctrl+E (JSON), Ctrl+S (CSV),
                              Ctrl+P (PDF), Ctrl+R (Reset).
                            </p>
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    </CarouselContent>
                  </Carousel>
                </div>
                <div className="mx-auto hidden max-w-5xl items-start gap-6 md:grid md:grid-cols-3">
                  <Card className="bg-card/50 backdrop-blur-sm border-primary/10 h-full hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
                    <CardHeader className="items-center pb-3">
                      <div className="p-2 rounded-full bg-primary/10 mb-2">
                        <Server className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle className="text-sm">
                        Export & Analytics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pt-0">
                      <p className="text-muted-foreground text-xs">
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
                      <CardTitle className="text-sm">Simulation Mode</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pt-0">
                      <p className="text-muted-foreground text-xs">
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
                      <CardTitle className="text-sm">
                        Keyboard Shortcuts
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pt-0">
                      <p className="text-muted-foreground text-xs">
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
        <section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 mt-20 md:mt-0"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-background px-3 py-1 text-sm">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Your All In One Subscription Dashboard
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From AI powered data entry to powerful analytics, we give you
                  the tools to take back control.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 py-12 sm:grid-cols-1 md:grid-cols-3">
              <Card className="h-full bg-background border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5 group">
                <CardHeader className="items-center">
                  <div className="p-4 rounded-full bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle>Analytics Dashboard</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Interactive charts showing monthly/annual spending patterns
                    and trends.
                  </p>
                </CardContent>
              </Card>
              <Card className="h-full bg-background border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5 group">
                <CardHeader className="items-center">
                  <div className="p-4 rounded-full bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle>AI Assistant</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    AI helps auto-fill subscription details and analyze spending
                    patterns.
                  </p>
                </CardContent>
              </Card>
              <Card className="h-full bg-background border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5 group">
                <CardHeader className="items-center">
                  <div className="p-4 rounded-full bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                    <ShieldX className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle>Export & Import</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Export to JSON, CSV, PDF formats. Import from JSON/CSV
                    files.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Honest Limitations Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-orange-100 dark:bg-orange-900/20 px-3 py-1 text-sm text-orange-800 dark:text-orange-200">
                Honest Disclosure
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                What Subsight <span className="text-orange-600">Cannot</span> Do
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                We believe in transparency. Here are the current limitations:
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <Card className="h-full bg-background border-orange-200 dark:border-orange-800">
                <CardHeader className="items-center">
                  <div className="p-4 rounded-full bg-orange-100 dark:bg-orange-900/20 mb-4">
                    <X className="w-8 h-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-orange-800 dark:text-orange-200">
                    No Bank Integration
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Cannot automatically detect subscriptions from your bank
                    account. Manual entry required.
                  </p>
                </CardContent>
              </Card>
              <Card className="h-full bg-background border-orange-200 dark:border-orange-800">
                <CardHeader className="items-center">
                  <div className="p-4 rounded-full bg-orange-100 dark:bg-orange-900/20 mb-4">
                    <X className="w-8 h-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-orange-800 dark:text-orange-200">
                    No Auto-Cancellation
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Cannot automatically cancel subscriptions for you. You must
                    cancel them yourself.
                  </p>
                </CardContent>
              </Card>
              <Card className="h-full bg-background border-orange-200 dark:border-orange-800">
                <CardHeader className="items-center">
                  <div className="p-4 rounded-full bg-orange-100 dark:bg-orange-900/20 mb-4">
                    <X className="w-8 h-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-orange-800 dark:text-orange-200">
                    AI Requires Setup
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    AI features require you to provide your own Google Gemini
                    API key.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">
                Why Choose Subsight?
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Better Than The Rest
              </h2>
            </div>
            <div className="mx-auto max-w-5xl overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-4 text-left font-semibold">Feature</th>
                    <th className="p-4 text-center font-semibold">
                      <div className="flex items-center justify-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        <span className="gradient-text">Subsight</span>
                      </div>
                    </th>
                    <th className="p-4 text-center font-semibold text-muted-foreground">
                      Others
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="p-4">Account Required</td>
                    <td className="p-4 text-center">
                      <Check className="w-5 h-5 text-primary mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <Check className="w-5 h-5 text-primary mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-border/50 bg-secondary/30">
                    <td className="p-4">Bank Integration</td>
                    <td className="p-4 text-center">
                      <X className="w-5 h-5 text-muted-foreground mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <Check className="w-5 h-5 text-primary mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-4">Auto-Cancel Subscriptions</td>
                    <td className="p-4 text-center">
                      <X className="w-5 h-5 text-muted-foreground mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-muted-foreground text-sm">
                        Some
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-border/50 bg-secondary/30">
                    <td className="p-4">Simulation Mode</td>
                    <td className="p-4 text-center">
                      <Check className="w-5 h-5 text-primary mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-5 h-5 text-muted-foreground mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-4">Keyboard Shortcuts</td>
                    <td className="p-4 text-center">
                      <Check className="w-5 h-5 text-primary mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-muted-foreground text-sm">
                        Limited
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-4">Export Formats</td>
                    <td className="p-4 text-center">
                      <span className="text-primary text-sm font-medium">
                        JSON/CSV/PDF
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-muted-foreground text-sm">
                        Limited
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-border/50 bg-secondary/30">
                    <td className="p-4">100% Free Forever</td>
                    <td className="p-4 text-center">
                      <Check className="w-5 h-5 text-primary mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-muted-foreground text-sm">
                        $5-15/mo
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-4">AI Setup Required</td>
                    <td className="p-4 text-center">
                      <span className="text-orange-600 text-sm font-medium">
                        API Key
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-primary text-sm">Built-in</span>
                    </td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-4">Cloud Data Storage</td>
                    <td className="p-4 text-center">
                      <Check className="w-5 h-5 text-primary mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <Check className="w-5 h-5 text-primary mx-auto" />
                    </td>
                  </tr>
                  <tr className="bg-secondary/30">
                    <td className="p-4">Open Source</td>
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
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Take Control of Your{" "}
                  <span className="gradient-text">Subscriptions Today</span>
                </h2>
                <p className="text-muted-foreground text-lg md:text-xl">
                  Start managing your subscriptions with powerful analytics and insights.
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
                  Account required • 100% Free • Open Source
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
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
        <section id="privacy" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-8 px-4 text-center md:px-6">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-background px-3 py-1 text-sm">
                Privacy First
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Secure Data Management
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Subsight stores your subscription data securely in the cloud
                with user authentication. Your data is protected and accessible
                only to you through your account.
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
        <section id="faq" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="mx-auto max-w-3xl w-full pt-12">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Is my data secure?</AccordionTrigger>
                  <AccordionContent>
                    Yes, your data is stored securely in our cloud database with
                    proper authentication and encryption. We follow industry
                    standards for data protection.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Is Subsight free to use?</AccordionTrigger>
                  <AccordionContent>
                    Yes, Subsight is completely free to use with no hidden fees
                    or premium tiers.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>
                    Do I need to provide my own AI API key?
                  </AccordionTrigger>
                  <AccordionContent>
                    Yes, to use AI features you need to provide your own Google
                    Gemini API key. You can get a free key from Google AI
                    Studio. The app works without AI, but you'll need to
                    manually enter subscription details.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>
                    Can Subsight automatically detect my subscriptions?
                  </AccordionTrigger>
                  <AccordionContent>
                    No, Subsight cannot connect to your bank account or
                    automatically detect subscriptions. You need to manually add
                    each subscription or use the AI assistant to help fill in
                    details.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>
                    Can I import or export my data?
                  </AccordionTrigger>
                  <AccordionContent>
                    Yes, you can export your data to JSON, CSV, or PDF formats
                    using keyboard shortcuts (Ctrl+E, Ctrl+S, Ctrl+P). Import
                    functionality supports JSON and CSV files.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-6">
                  <AccordionTrigger>
                    Can Subsight cancel subscriptions for me?
                  </AccordionTrigger>
                  <AccordionContent>
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
      <footer className="border-t bg-background/50 backdrop-blur-sm">
        <div className="container px-4 md:px-6 py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Brand Section */}
            <div className="flex flex-col items-center md:items-start gap-4">
              <Link href="/" className="flex items-center gap-2">
                <Target className="w-6 h-6 text-primary" />
                <span className="text-xl font-bold">Subsight</span>
              </Link>
              <p className="text-sm text-muted-foreground text-center md:text-left max-w-xs">
                Track, manage, and optimize all your recurring payments with AI-powered insights.
              </p>
            </div>

            {/* Quick Links */}
            <div className="flex flex-col items-center md:items-start gap-4">
              <h3 className="font-semibold text-sm">Quick Links</h3>
              <nav className="flex flex-col items-center md:items-start gap-2">
                <Link
                  href="/auth/signup"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  href="/auth/signin"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="#features"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Features
                </Link>
                <Link
                  href="#faq"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  FAQ
                </Link>
              </nav>
            </div>

            {/* Social Links */}
            <div className="flex flex-col items-center md:items-start gap-4">
              <h3 className="font-semibold text-sm">Connect</h3>
              <div className="flex gap-4">
                <Link
                  href="https://www.linkedin.com/in/muhammadtanveerabbas"
                  className="p-2 rounded-lg bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                  target="_blank"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </Link>
                <Link
                  href="https://github.com/muhammadtanveerabbas"
                  className="p-2 rounded-lg bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                  target="_blank"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </Link>
                <Link
                  href="https://twitter.com/m_tanveerabbas"
                  className="p-2 rounded-lg bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                  target="_blank"
                  aria-label="Twitter"
                >
                  <XIcon className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground text-center sm:text-left">
              © {new Date().getFullYear()} Subsight. Built with ❤️ by{" "}
              <Link
                href="https://muhammadtanveerabbas.vercel.app/"
                target="_blank"
                className="text-primary hover:underline"
              >
                Muhammad Tanveer Abbas
              </Link>
            </p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="px-2 py-1 rounded-md bg-primary/10 text-primary">
                100% Free
              </span>
              <span className="px-2 py-1 rounded-md bg-primary/10 text-primary">
                Open Source
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
