# Subsight

> Modern subscription tracking app with AI-powered insights

Subsight is an open-source subscription tracker that gives you real-time visibility into every recurring charge. Self-hosted and privacy-first. Free tier available with optional Pro upgrade for advanced features.

[Live Demo](https://subsight-tracker.vercel.app) | [MIT License](LICENSE)

---

## Features

- **Real-time dashboard** -- KPI metrics, monthly spend, active subscriptions, and upcoming renewals at a glance
- **AI auto-fill** -- Type a service name and Groq AI fills in provider, category, price, and billing cycle (Pro)
- **Spending analysis** -- AI-powered summary of your spending patterns with actionable insights (Pro)
- **Simulation mode** -- Toggle subscriptions on/off to preview how cancellations affect your monthly budget
- **Advanced analytics** -- Monthly spending bar charts, category donut breakdown, annual totals with trends
- **Multi-format export** -- Export your subscription list to JSON, CSV, or PDF
- **Renewal alerts** -- Email reminders sent 1, 3, 7, or 14 days before renewal via SMTP
- **Spending goals** -- Set monthly or annual budget targets per category and track progress
- **Custom categories** -- Create categories with custom colors and icons
- **Duplicate detection** -- Smart Levenshtein-based detection warns before adding a duplicate subscription
- **Multi-currency** -- Track in USD, EUR, GBP, JPY, CAD, AUD with automatic conversion
- **Supabase Auth + RLS** -- Secure authentication with Google OAuth and row-level security
- **Dark/light theme** -- Fully themed UI that persists across sessions
- **Stripe billing** -- Pro plan with subscription payments and customer portal
- **Privacy-first** -- You own your data. Self-hostable. Analytics are not collected or shared.

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16 (App Router + Turbopack) |
| Language | TypeScript 5 (strict mode, noUncheckedIndexedAccess) |
| Styling | Tailwind CSS v3 + shadcn/ui (Radix UI primitives) |
| Backend | Supabase (PostgreSQL, Auth, RLS) |
| AI | Groq SDK |
| Rate Limiting | Upstash Redis (with in-memory fallback) |
| Charts | Recharts |
| Forms | Zod validation (API routes + client forms) |
| PDF Export | Browser print dialog |
| Email | Nodemailer (SMTP) |
| Payments | Stripe |
| Testing | Vitest + Playwright |

---

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 9+ (`npm install -g pnpm`)
- Supabase account (free tier)
- Stripe account (test mode)

### 1. Clone and install

```bash
git clone https://github.com/MuhammadTanveerAbbas/Subsight-Tracker.git
cd Subsight-Tracker
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in all required values (see configuration below).

### 3. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run `supabase/schema.sql`
3. Enable Email Auth provider in Supabase Auth settings
4. Copy your project URL and anon/public key to `.env.local`

### 4. Configure Stripe

1. Create a Stripe account in test mode
2. Create a subscription product with a price in Stripe Dashboard
3. Copy the price ID to `STRIPE_PRICE_ID` in `.env.local`
4. Set up a webhook endpoint pointing to `your-domain.com/api/stripe/webhook`
5. Add events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
6. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 5. Configure Google OAuth (optional)

1. Create OAuth credentials in Google Cloud Console
2. Add authorized redirect URI: `https://<project>.supabase.co/auth/v1/callback`
3. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local`

### 6. Configure SMTP for email reminders (optional)

1. Use a Gmail App Password or any SMTP provider
2. Set `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` in `.env.local`

### 7. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 8. Run tests

```bash
pnpm test:unit        # Unit tests (Vitest)
pnpm test:e2e         # E2E tests (Playwright)
pnpm test:coverage    # Tests with coverage
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-only) |
| `NEXT_PUBLIC_APP_URL` | Yes | App URL (http://localhost:3000 for dev) |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key |
| `STRIPE_PRICE_ID` | Yes | Stripe price ID for Pro plan |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret |
| `GROQ_API_KEY` | No | AI features (autofill + summary) |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `SMTP_HOST` | No | SMTP server hostname |
| `SMTP_PORT` | No | SMTP port (default: 587) |
| `SMTP_USER` | No | SMTP username |
| `SMTP_PASS` | No | SMTP password |
| `SMTP_FROM` | No | Email from address |
| `UPSTASH_REDIS_REST_URL` | No | Upstash Redis REST URL (rate limiting) |
| `UPSTASH_REDIS_REST_TOKEN` | No | Upstash Redis REST token |
| `CRON_SECRET` | No | Vercel Cron job authentication |

---

## Project Structure

```
src/
├── app/
│   ├── (app)/dashboard/       # Dashboard SPA with 8 views
│   │   └── views/
│   │       ├── overview-view.tsx
│   │       ├── subs-view.tsx
│   │       ├── analytics-view.tsx
│   │       ├── ai-summary-view.tsx
│   │       ├── add-view.tsx
│   │       ├── export-view.tsx
│   │       ├── settings-view.tsx
│   │       └── profile-view.tsx
│   ├── (auth)/                # Auth pages (sign-in, sign-up, forgot-password)
│   ├── (marketing)/           # Public pages (landing, pricing, privacy, terms)
│   ├── api/                   # API route handlers
│   │   ├── ai/autofill/       # AI subscription autofill
│   │   ├── ai/summary/        # AI spending summary
│   │   ├── stripe/checkout/   # Create checkout session
│   │   ├── stripe/portal/     # Stripe customer portal
│   │   ├── stripe/webhook/    # Stripe webhook receiver
│   │   ├── reminders/send/    # Send renewal reminders (cron)
│   │   ├── keep-alive/        # Warm-up ping (cron)
│   │   └── health/            # Health check
│   ├── auth/                  # OAuth callback + reset password
│   └── settings/              # Redirects to dashboard settings tab
├── components/
│   ├── subscription/          # Dashboard shared components (badge, edit-modal, kpi)
│   ├── marketing/             # Nav + footer for marketing pages
│   └── ui/                    # shadcn/ui primitives (button, card, input, toast)
├── contexts/                  # React contexts (auth, loading, subscription)
├── hooks/                     # Custom hooks (use-mobile, use-toast)
├── lib/                       # Core utilities
│   ├── supabase/              # Supabase client + server helpers
│   ├── groq-service.ts        # AI autofill + spending summary
│   ├── email-service.ts       # SMTP renewal reminder emails
│   ├── export.ts              # JSON / CSV / PDF export utilities
│   ├── currency.ts            # Multi-currency conversion
│   ├── duplicates.ts          # Duplicate subscription detection
│   ├── renewal-calculator.ts  # Next renewal date logic
│   ├── stripe.ts              # Stripe billing helpers
│   ├── types.ts               # Shared TypeScript types
│   ├── validation.ts          # Zod schemas
│   ├── rate-limit.ts          # Rate limiting
│   ├── chart-helpers.ts       # Chart data formatters
│   ├── error-logger.ts        # Error logging utility
│   └── utils.ts               # General utilities
├── types/
│   └── database.ts            # Supabase database types
└── middleware.ts              # Auth middleware (route protection)
```

---

## API Routes

| Route | Method | Auth | Description |
|---|---|---|---|
| `/api/stripe/webhook` | POST | Stripe signature | Handle Stripe events |
| `/api/stripe/checkout` | POST | Session | Create Stripe checkout session |
| `/api/stripe/portal` | POST | Session + Pro | Create Stripe billing portal session |
| `/api/ai/autofill` | POST | Session + Pro | AI-powered subscription autofill |
| `/api/ai/summary` | POST | Session + Pro | AI-powered spending summary |
| `/api/reminders/send` | GET | Cron secret | Send renewal reminder emails |
| `/api/keep-alive` | GET | Cron secret | Keep app warm (prevent cold starts) |
| `/api/health` | GET | None | Health check |

---

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server with Turbopack |
| `pnpm build` | Type-check then build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run Next.js ESLint |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm test` | Run Vitest in watch mode |
| `pnpm test:unit` | Run Vitest unit tests once |
| `pnpm test:e2e` | Run Playwright E2E tests |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm audit` | Run security audit (moderate+) |

---

## Key Architecture Decisions

- **No Server Actions** -- All server logic lives in API Route Handlers for clarity and testability
- **Service role key** -- Used ONLY in webhook and cron endpoints that need to bypass RLS
- **RLS-first** -- Every table has Row Level Security enabled with verified policies
- **Stripe webhook idempotency** -- Duplicate events are safely ignored via `processed_webhook_events` table
- **TypeScript strict** -- Full strict mode with `noUncheckedIndexedAccess`

---

## Deployment (Vercel)

1. Push the repository to GitHub
2. Import the repo in Vercel
3. Set all environment variables from `.env.example` in the Vercel dashboard
4. Deploy
5. Update the Stripe webhook URL to your production domain
6. Set Stripe live keys for production (keep test keys for development)
7. Configure a custom domain with SSL

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/MuhammadTanveerAbbas/Subsight-Tracker)

---

## Security Notes

- Never commit `.env.local` -- review files before committing
- Rotate secrets immediately if exposed
- RLS is verified on all database tables
- Stripe webhook signature is always verified
- All API routes check authentication server-side
- Rate limiting is applied to sensitive endpoints

---

## License

MIT. See [LICENSE](LICENSE).

---

## Author

**Muhammad Tanveer Abbas** -- [Portfolio](https://themvpguy.vercel.app) | [GitHub](https://github.com/MuhammadTanveerAbbas)
