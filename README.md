# Subsight

> Open-source subscription tracker with AI-powered insights free forever.

Subsight gives you real-time visibility into every recurring charge. Self-hosted, privacy-first, and MIT licensed. Every feature is free for all users no paid tiers exist today.

[Live Demo](https://subsight-tracker.vercel.app) | [MIT License](LICENSE)

---

## Features

All of the following are implemented and available to every user at no cost:

- **Live dashboard**: KPI cards for monthly spend, active subscriptions, annual total, and upcoming renewals
- **Subscriptions management**: Add, edit, delete, and search subscriptions
- **Simulation mode**: Toggle subscriptions on/off to preview budget impact before making real changes
- **Analytics**: Monthly spending bar chart, category donut chart, annual totals, and trend data
- **AI auto-fill**: Type a service name; Groq AI fills in price, category, and billing cycle instantly (requires Groq API key)
- **AI spending summary**: Plain-English analysis of your spending patterns (requires Groq API key)
- **Export**: Download your full list as JSON, CSV, or PDF
- **Renewal email reminders**: Email alerts 1, 3, 7, or 14 days before each renewal via SMTP
- **Custom categories**: Create your own subscription categories alongside built-in defaults
- **Multi-currency**: Track in USD, EUR, GBP, PKR, CAD, AUD, JPY, CHF, INR, SGD, AED
- **Duplicate detection**: Levenshtein-based warning before adding a duplicate subscription
- **Supabase Auth**: Email/password and Google OAuth with Row Level Security
- **Dark/light theme**: Fully themed UI that persists across sessions
- **Self-hostable**: Deploy anywhere Next.js runs

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS v3 + custom design tokens |
| Database / Auth | Supabase (PostgreSQL + RLS) |
| AI | Groq SDK |
| Email | Nodemailer (SMTP) |
| Charts | Recharts |
| Rate Limiting | Upstash Redis (with in-memory fallback) |
| PDF Export | Browser print dialog |
| Testing | Vitest |

---

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 9+ (`npm install -g pnpm`)
- A free [Supabase](https://supabase.com) account

### 1. Clone and install

```bash
git clone https://github.com/MuhammadTanveerAbbas/Subsight-Tracker.git
cd Subsight-Tracker
pnpm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in the required values (see the table below).

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. In the SQL Editor, run `supabase/schema.sql`
3. Enable the Email provider in **Authentication → Providers**
4. Copy your Project URL and anon key into `.env.local`

### 4. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Run tests

```bash
pnpm test:unit      # Vitest unit tests
pnpm test:coverage  # Tests with coverage report
```

---

## Environment Variables

### Required

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only, never sent to client) |
| `NEXT_PUBLIC_APP_URL` | Full app URL `http://localhost:3000` for dev, your domain in production |

### Optional | AI features

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Groq API key. Required for AI auto-fill and AI spending summary. Free tier available at [console.groq.com](https://console.groq.com). |

### Optional | Email reminders (SMTP)

All five variables must be set for renewal email reminders to work.

| Variable | Description |
|---|---|
| `SMTP_HOST` | SMTP server hostname (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | SMTP port. Use `587` for STARTTLS (recommended) or `465` for implicit TLS. Default: `587` |
| `SMTP_USER` | SMTP username / login address |
| `SMTP_PASS` | SMTP password. For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833), not your account password. |
| `SMTP_FROM` | The "from" address shown on reminder emails. Falls back to `SMTP_USER` if not set. |
| `SMTP_SECURE` | Set to `true` for port 465 (implicit TLS). Omit or set to `false` for port 587 (STARTTLS). Auto-detected from port if not set. |

### Optional | Infrastructure

| Variable | Description |
|---|---|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL (rate limiting on AI routes). Falls back to in-memory if not set. |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |
| `CRON_SECRET` | Bearer token to authenticate cron job requests to `/api/reminders/send` and `/api/keep-alive` |

> **Stripe variables** (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, etc.) are present in the codebase for future use but are not required and not used by any active user-facing feature today. Do not configure them unless you are building out paid plan functionality.

---

## SMTP Configuration

Renewal reminders are sent by a daily cron job (`/api/reminders/send`). The job reads SMTP settings from environment variables on the server credentials are **never** stored in the database or sent to the client.

### Gmail setup

1. Enable 2-Step Verification on your Google account.
2. Go to **Google Account → Security → App Passwords** and create one.
3. Set:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx   # App Password
   SMTP_FROM=your@gmail.com
   ```

### Other providers

| Provider | Host | Port |
|---|---|---|
| SendGrid | `smtp.sendgrid.net` | `587` |
| Mailgun | `smtp.mailgun.org` | `587` |
| Postmark | `smtp.postmarkapp.com` | `587` |
| Amazon SES | `email-smtp.<region>.amazonaws.com` | `587` |

### Test SMTP from the dashboard

Go to **Settings → Email (SMTP)** and click **Test SMTP Connection**. This calls `/api/smtp/test` and returns a success or a diagnostic error message without exposing credentials.

---

## Groq / AI Configuration

The AI model list is managed in `src/lib/groq-service.ts` under `MODEL_PREFERENCES`. Models are verified against the live Groq API at startup (cached for 6 hours). If the preferred model is unavailable, the service falls back automatically.

**Active models (verified 2026):**
- `openai/gpt-oss-120b` highest quality
- `openai/gpt-oss-20b` fastest
- `qwen/qwen3.8-27b`
- `allam-2-7b`

All `llama-3.x` / `llama3-x` model IDs are removed from Groq and must not be re-added.

Rate limit (429) responses from Groq are forwarded to the client with a `Retry-After` header and a clear message. No application-level AI rate limiting is applied.

---

## Project Structure

```
src/
├── app/
│   ├── (app)/dashboard/       # Dashboard SPA
│   │   ├── billing/           # Plan & features page
│   │   └── views/             # 8 views: overview, subscriptions, analytics,
│   │                          #   ai-summary, add, export, settings, profile
│   ├── (auth)/                # Sign-in, sign-up, forgot-password, verify-email
│   ├── (marketing)/           # Landing page, pricing, privacy, terms
│   ├── api/
│   │   ├── ai/autofill/       # AI subscription auto-fill
│   │   ├── ai/summary/        # AI spending summary
│   │   ├── smtp/test/         # SMTP connection test
│   │   ├── reminders/send/    # Renewal reminder cron job
│   │   ├── keep-alive/        # Warm-up cron ping
│   │   ├── health/            # Health check
│   │   ├── stripe/            # Stripe routes (not active)
│   │   └── auth/delete-account/
│   └── auth/                  # OAuth callback, reset-password
├── components/
│   ├── subscription/          # Badge, EditModal, KPI
│   ├── marketing/             # MktNav, MktFooter
│   └── ui/                    # shadcn/ui primitives
├── contexts/                  # auth-context, subscription-context, loading-context
├── hooks/                     # use-toast
├── lib/
│   ├── supabase/              # Server + client helpers
│   ├── groq-service.ts        # AI auto-fill + spending summary
│   ├── email-service.ts       # SMTP renewal reminders + connection test
│   ├── export.ts              # JSON / CSV / PDF export
│   ├── currency.ts            # Multi-currency conversion
│   ├── duplicates.ts          # Duplicate detection
│   ├── renewal-calculator.ts  # Next renewal date logic
│   ├── rate-limit.ts          # Upstash / in-memory rate limiting
│   ├── chart-helpers.ts       # Chart data formatters
│   ├── validation.ts          # Input validation + sanitization
│   ├── api-auth.ts            # Server-side auth helper
│   ├── design-tokens.ts       # Theme tokens
│   └── types.ts               # Shared TypeScript types
└── types/
    └── database.ts            # Supabase database types
```

---

## API Routes

| Route | Method | Auth | Description |
|---|---|---|---|
| `/api/ai/autofill` | POST | Session | AI subscription auto-fill (requires Groq key) |
| `/api/ai/summary` | POST | Session | AI spending summary (requires Groq key) |
| `/api/smtp/test` | POST | Session | Test SMTP connection |
| `/api/reminders/send` | GET | Cron secret | Send due renewal reminder emails |
| `/api/keep-alive` | GET | Cron secret | Prevent cold starts |
| `/api/health` | GET | None | Health check |

---

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server with Turbopack |
| `pnpm build` | Type-check + build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript type check |
| `pnpm test:unit` | Run Vitest unit tests |
| `pnpm test:coverage` | Run tests with coverage |

---

## Deployment (Vercel)

1. Push the repo to GitHub.
2. Import it in [Vercel](https://vercel.com).
3. Set all required environment variables in the Vercel dashboard.
4. Deploy.
5. Set `NEXT_PUBLIC_APP_URL` to your production domain.
6. Point your cron job runner to `/api/reminders/send` with the `Authorization: Bearer <CRON_SECRET>` header.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/MuhammadTanveerAbbas/Subsight-Tracker)

---

## Security Notes

- Never commit `.env.local` review staged files before committing.
- Rotate secrets immediately if exposed.
- RLS is enabled on all Supabase tables.
- SMTP credentials live only in server environment variables and are never sent to the client or stored in the database.
- All API routes verify authentication server-side.

---

## License

MIT. See [LICENSE](LICENSE).

---

## Author

**Muhammad Tanveer Abbas**: [Portfolio](https://muhammadtanveerabbas.vercel.app) | [GitHub](https://github.com/MuhammadTanveerAbbas)
