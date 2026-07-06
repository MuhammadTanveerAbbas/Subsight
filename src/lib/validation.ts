import { z } from 'zod';
import { BILLING_CYCLES, CURRENCIES, CATEGORY_ICONS } from './types';

export const subscriptionImportSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  provider: z.string().min(1).max(100),
  category: z.string().min(1).max(50),
  icon: z.string().refine((val) => val in CATEGORY_ICONS, {
    message: 'Invalid icon',
  }),
  startDate: z.string().datetime(),
  billingCycle: z.enum(BILLING_CYCLES),
  amount: z.number().positive().max(999999),
  currency: z.enum(CURRENCIES),
  notes: z.string().max(500),
  activeStatus: z.boolean(),
  autoRenew: z.boolean(),
});

export const subscriptionArraySchema = z.array(subscriptionImportSchema).max(1000);

export function validateImportData(data: unknown) {
  try {
    const validated = subscriptionArraySchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      };
    }
    return { success: false, error: 'Invalid data format' };
  }
}

export function escapeHtml(text: string): string {
  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return text.replace(/[&<>"']/g, (char) => entities[char] ?? char);
}

export function sanitizeText(text: string): string {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .trim();
}

export function sanitizeSubscriptionData(data: any) {
  return {
    ...data,
    name: escapeHtml(data?.name?.toString().trim().slice(0, 100) || ''),
    provider: escapeHtml(data?.provider?.toString().trim().slice(0, 100) || ''),
    category: escapeHtml(data?.category?.toString().trim().slice(0, 50) || ''),
    notes: escapeHtml(data?.notes?.toString().trim().slice(0, 500) || ''),
    amount: Math.min(Math.abs(Number(data?.amount) || 0), 999999),
  };
}
