export type SubStatus = "active" | "inactive" | "warning" | "renewal_passed";

export interface PricePoint {
  amount: number;
  currency: string;
  recordedAt: string;
}

export interface Sub {
  id: string;
  name: string;
  category: string;
  amount: number;
  cycle: string;
  nextDate: string;
  status: SubStatus;
  autoRenew: boolean;
  currency: string;
  provider: string;
  notes: string;
  priceHistory?: PricePoint[];
  cancelByDate?: string | null;
  cancelState?: "none" | "planned" | "canceled";
}

export type TK = "dark" | "light";
