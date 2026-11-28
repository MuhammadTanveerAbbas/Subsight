import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { LoadingProvider } from "@/contexts/loading-context";
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/error-boundary";
import { SmoothScroll } from "@/components/smooth-scroll";
import { cn } from "@/lib/utils";
import "lenis/dist/lenis.css";
import "./globals.css";

const SITE_URL = "https://subsight-tracker.vercel.app";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Subsight",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  description:
    "Track and manage your subscriptions with AI spending insights. Privacy-first and secure. Free tier available.",
  url: SITE_URL,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free tier available",
  },
  author: {
    "@type": "Person",
    name: "Muhammad Tanveer Abbas",
    url: "https://muhammadtanveerabbas.vercel.app/",
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Subsight - Subscription Tracker",
    template: "%s | Subsight",
  },
  description:
    "Track and manage your subscriptions with AI spending insights. Privacy-first and secure. Free tier available.",
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
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    title: "Subsight - Privacy-First Subscription Tracker",
    description:
      "Track subscriptions with AI spending insights. Privacy-first and secure.",
    siteName: "Subsight",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Subsight - Start tracking free",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@m_tanveerabbas",
    title: "Subsight - Privacy-First Subscription Tracker",
    description:
      "Track subscriptions with AI spending insights. Privacy-first and secure.",
    creator: "@m_tanveerabbas",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Subsight - Start tracking free",
      },
    ],
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
      { url: "/Subsight.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/Subsight.png", type: "image/png", sizes: "any" },
    ],
    shortcut: "/favicon-32x32.png",
    apple: "/Subsight.png",
  },
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(inter.variable, jetbrainsMono.variable)}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('subsight-theme');var d=t==='dark';document.documentElement.setAttribute('data-theme',d?'dark':'light');document.documentElement.classList.toggle('dark',d)}catch(e){document.documentElement.setAttribute('data-theme','light')}` }} />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#22c55e" />
        <meta property="og:logo" content={`${SITE_URL}/Subsight.png`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <ErrorBoundary>
          <AuthProvider>
            <LoadingProvider>
              <ThemeProvider><SmoothScroll>{children}</SmoothScroll></ThemeProvider>
            </LoadingProvider>
          </AuthProvider>
        </ErrorBoundary>
        <Toaster />
      </body>
    </html>
  );
}
