import type { Metadata } from "next";
import { Sora } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { LoadingProvider } from "@/contexts/loading-context";
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/error-boundary";
import { cn } from "@/lib/utils";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://subsight-tracker.vercel.app"),
  title: {
    default: "Subsight - Subscription Tracker",
    template: "%s | Subsight",
  },
  description:
    "Track and manage your subscriptions effortlessly with AI powered insights. 100% free, private, and secure. No signup required.",
  keywords: [
    "subscription tracker",
    "manage subscriptions",
    "recurring payments",
    "budgeting tool",
    "AI insights",
    "privacy-first",
    "free",
  ],
  authors: [{ name: "Muhammad Tanveer Abbas" }],
  creator: "Muhammad Tanveer Abbas",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://subsight-tracker.vercel.app",
    title: "Subsight - Privacy-First Subscription Tracker",
    description:
      "Track subscriptions with AI powered insights. 100% free and private.",
    siteName: "Subsight",
  },
  twitter: {
    card: "summary_large_image",
    title: "Subsight - Privacy-First Subscription Tracker",
    description:
      "Track subscriptions with AI powered insights. 100% free and private.",
    creator: "@m_tanveerabbas",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/icon.svg',
  },
};

const sora = Sora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sora",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", sora.variable)}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#22c55e" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ErrorBoundary>
          <AuthProvider>
            <LoadingProvider>
              <ThemeProvider>
                {children}
              </ThemeProvider>
            </LoadingProvider>
          </AuthProvider>
        </ErrorBoundary>
        <Toaster />
      </body>
    </html>
  );
}
