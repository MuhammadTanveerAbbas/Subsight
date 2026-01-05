import type { Metadata } from "next";
import { Sora } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { LoadingProvider } from "@/contexts/loading-context";
import { AuthProvider } from "@/contexts/auth-context";
import { LoadingScreen } from "@/components/subsight/loading-screen";
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
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/favicon.png',
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
        <meta name="theme-color" content="#8b5cf6" />
      </head>
      <body className="font-body antialiased">
        <ErrorBoundary>
          <AuthProvider>
            <LoadingProvider>
              {children}
              <LoadingScreen />
            </LoadingProvider>
          </AuthProvider>
        </ErrorBoundary>
        <Toaster />
      </body>
    </html>
  );
}
