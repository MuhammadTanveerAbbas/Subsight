export type SubStatus = "active" | "inactive" | "warning" | "renewal_passed";

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
}

export type TK = "dark" | "light";
