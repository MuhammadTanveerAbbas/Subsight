# Subsight 🎯 Subscription Tracker

A modern subscription tracking app that helps you manage recurring payments with AI-powered insights.

## ✨ Features

- 📊 **Interactive Dashboard** – Real-time spending charts and analytics
- 🤖 **AI Assistant** – Auto-fill subscription details using Google Gemini (requires your own API key)
- 🎭 **Simulation Mode** – Preview budget changes by toggling subscriptions
- 🔄 **Import/Export** – JSON, CSV, and PDF export capabilities
- 🔍 **Search & Filter** – Find subscriptions by name, category, or status
- ⌨️ **Keyboard Shortcuts** – Quick actions for power users (Ctrl+E, Ctrl+S, Ctrl+P, Ctrl+R)
- 🔒 **Supabase Authentication** – Secure user authentication and data storage
- 📱 **Fully Responsive** – Works seamlessly on all devices

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/MuhammadTanveerAbbas/Subsight-Tracker.git
cd Subsight-Tracker

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your GEMINI_API_KEY and Supabase credentials to .env.local

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to start tracking your subscriptions.

## 🔑 Environment Setup

Create a `.env.local` file with:

```env
# Gemini API Key (optional - for AI features)
GEMINI_API_KEY=your_gemini_api_key

# Supabase Configuration (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Get API keys:**
- [Google AI Studio](https://aistudio.google.com/app/apikey) - Free Gemini API key (optional, for AI features)
- [Supabase](https://supabase.com) - Free database and authentication (required)

**Important:** After setting up Supabase, run the SQL commands from `supabase-setup.sql` in your Supabase SQL editor to create the required tables.

## 🛠️ Tech Stack

- **Framework:** Next.js 15 with React 18
- **Language:** TypeScript
- **Styling:** Tailwind CSS + ShadCN UI
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **AI:** Google Gemini (via Genkit)
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod validation

## ⌨️ Keyboard Shortcuts

- `Ctrl+E` - Export to JSON
- `Ctrl+S` - Export to CSV
- `Ctrl+P` - Export to PDF
- `Ctrl+R` - Reset simulation
- `Ctrl+A` - Add subscription

## 🔒 Data Storage & Privacy

- **Account Required** - You must create an account to use Subsight
- **Supabase Backend** - All subscription data is stored in your Supabase database
- **Authentication** - Secure authentication via Supabase Auth
- **Your Data** - Data is tied to your account and protected by Supabase's security
- **Open Source** - Fully transparent codebase - you can see exactly how your data is handled

## 🚫 What Subsight Cannot Do

We believe in transparency. Here are the current limitations:

- ❌ **No Bank Integration** - Cannot automatically detect subscriptions from your bank account
- ❌ **No Auto-Cancellation** - Cannot cancel subscriptions for you
- ❌ **AI Requires Setup** - You need to provide your own Google Gemini API key for AI features
- ❌ **Requires Supabase** - You must set up your own Supabase project to use this app

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ by [Muhammad Tanveer Abbas](https://muhammadtanveerabbas.vercel.app/)**

**100% Free • Open Source • Self-Hosted**
