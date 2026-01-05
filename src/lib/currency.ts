import { Currency, CurrencyRate } from './types';

// Mock exchange rates - in production, fetch from API
const EXCHANGE_RATES: CurrencyRate = {
  USD: 1,
  EUR: 0.85,
  GBP: 0.73,
  JPY: 110,
  CAD: 1.25,
  AUD: 1.35,
};

export const convertCurrency = (
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number => {
  if (fromCurrency === toCurrency) return amount;
  
  const usdAmount = amount / EXCHANGE_RATES[fromCurrency];
  return usdAmount * EXCHANGE_RATES[toCurrency];
};

export const formatCurrencyWithConversion = (
  amount: number,
  originalCurrency: Currency,
  displayCurrency: Currency
): string => {
  const convertedAmount = convertCurrency(amount, originalCurrency, displayCurrency);
  return convertedAmount.toLocaleString("en-US", {
    style: "currency",
    currency: displayCurrency,
  });
};

export const getCurrencySymbol = (currency: Currency): string => {
  const symbols: Record<Currency, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
  };
  return symbols[currency] || currency;
};