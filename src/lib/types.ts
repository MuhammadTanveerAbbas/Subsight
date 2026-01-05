import { 
  Film, 
  Music, 
  Tv, 
  Briefcase, 
  Gamepad2, 
  ShoppingCart, 
  Heart, 
  HelpCircle, 
  Laptop, 
  Clapperboard, 
  Book, 
  Newspaper,
  BookOpen,
  BrainCircuit,
  Building,
  Cloud,
  Code,
  Dumbbell,
  Globe,
  GraduationCap,
  Home,
  MonitorPlay,
  Podcast,
  Rocket,
  Server,
  Shield,
  Smartphone,
  Store,
  Utensils,
  Wifi,
  Zap,
} from "lucide-react";

export const BILLING_CYCLES = ["monthly", "yearly", "one-time"] as const;
export type BillingCycle = (typeof BILLING_CYCLES)[number];

export const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD"] as const;
export type Currency = (typeof CURRENCIES)[number];

// Kept for backwards compatibility for existing subscriptions
export const CATEGORY_ICONS: Record<string, React.ElementType> = {
  entertainment: Clapperboard,
  music: Music,
  streaming: Tv,
  software: Laptop,
  gaming: Gamepad2,
  shopping: ShoppingCart,
  health: Heart,
  business: Briefcase,
  finance: Book,
  news: Newspaper,
  bookOpen: BookOpen,
  brain: BrainCircuit,
  building: Building,
  cloud: Cloud,
  code: Code,
  fitness: Dumbbell,
  domain: Globe,
  education: GraduationCap,
  home: Home,
  monitorPlay: MonitorPlay,
  podcast: Podcast,
  startup: Rocket,
  hosting: Server,
  security: Shield,
  mobile: Smartphone,
  ecommerce: Store,
  food: Utensils,
  internet: Wifi,
  utilities: Zap,
  default: HelpCircle,
};

export const ICON_CATEGORIES: Record<string, Record<string, React.ElementType>> = {
  "Entertainment": {
    streaming: Tv,
    music: Music,
    gaming: Gamepad2,
    movies: Film,
    podcast: Podcast,
    news: Newspaper,
    books: BookOpen,
    video: MonitorPlay,
  },
  "Productivity & Software": {
    software: Laptop,
    code: Code,
    cloud: Cloud,
    hosting: Server,
    security: Shield,
    ai: BrainCircuit,
  },
  "Finance & Business": {
    business: Briefcase,
    finance: Book,
    startup: Rocket,
    company: Building,
    ecommerce: Store,
  },
  "Lifestyle & Health": {
    health: Heart,
    fitness: Dumbbell,
    shopping: ShoppingCart,
    food: Utensils,
    education: GraduationCap,
    home: Home,
    internet: Wifi,
    mobile: Smartphone,
    utilities: Zap,
    domain: Globe,
  },
  "Other": {
    default: HelpCircle,
  }
};


export interface Subscription {
  id: string;
  name: string;
  provider: string;
  category: string;
  icon: keyof typeof CATEGORY_ICONS;
  startDate: string; // ISO string for date
  billingCycle: BillingCycle;
  amount: number;
  currency: Currency;
  notes: string;
  activeStatus: boolean;
  autoRenew: boolean;
  usageCount?: number;
  lastUsed?: string;
}

export interface SpendingGoal {
  id: string;
  type: 'monthly' | 'annual';
  amount: number;
  currency: Currency;
  category?: string;
}

export interface CustomCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface CurrencyRate {
  [key: string]: number;
}

export type SubscriptionFormData = Omit<Subscription, "id">;
