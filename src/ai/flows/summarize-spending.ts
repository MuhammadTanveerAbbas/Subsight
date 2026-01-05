'use server';

/**
 * @fileOverview AI-powered subscription spending summarization flow.
 *
 * - summarizeSpending - A function that generates a summary of spending habits.
 * - SummarizeSpendingInput - The input type for the summarizeSpending function.
 * - SummarizeSpendingOutput - The return type for the summarizeSpending function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {rateLimit} from '@/lib/rate-limit';

const SummarizeSpendingInputSchema = z.object({
  subscriptionData: z
    .string()
    .describe(
      'JSON string representing an array of subscription objects, each with details like name, provider, category, amount, billing cycle, etc.'
    ),
});
export type SummarizeSpendingInput = z.infer<typeof SummarizeSpendingInputSchema>;

const SummarizeSpendingOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A detailed summary of the user\'s subscription spending habits, including key trends, potential savings areas, and overall insights.'
    ),
});
export type SummarizeSpendingOutput = z.infer<typeof SummarizeSpendingOutputSchema>;

export async function summarizeSpending(input: SummarizeSpendingInput): Promise<SummarizeSpendingOutput> {
  if (!rateLimit('summarize-spending', 5, 60000)) {
    throw new Error('Rate limit exceeded. Please wait before making more requests.');
  }
  return summarizeSpendingFlow(input);
}

const summarizeSpendingPrompt = ai.definePrompt({
  name: 'summarizeSpendingPrompt',
  input: {schema: SummarizeSpendingInputSchema},
  output: {schema: SummarizeSpendingOutputSchema},
  prompt: `You are a financial advisor specializing in subscription management. Analyze the subscription data and provide actionable insights.

  Subscription Data: {{subscriptionData}}

  Provide a comprehensive analysis including:
  
  📊 SPENDING OVERVIEW:
  - Total monthly/annual costs
  - Average cost per subscription
  - Most expensive categories
  
  💡 KEY INSIGHTS:
  - Spending patterns and trends
  - Underutilized or duplicate services
  - Seasonal or irregular charges
  
  💰 SAVINGS OPPORTUNITIES:
  - Specific subscriptions to review/cancel
  - Bundle opportunities
  - Annual vs monthly savings potential
  
  🎯 RECOMMENDATIONS:
  - Immediate actions to reduce costs
  - Budget optimization strategies
  - Alternative service suggestions
  
  Keep the summary concise (under 200 words) but actionable. Focus on concrete steps the user can take today.`,
});

const summarizeSpendingFlow = ai.defineFlow(
  {
    name: 'summarizeSpendingFlow',
    inputSchema: SummarizeSpendingInputSchema,
    outputSchema: SummarizeSpendingOutputSchema,
  },
  async input => {
    try {
      const {output} = await summarizeSpendingPrompt(input);
      return output!;
    } catch (error) {
      console.error('Error in summarizeSpendingFlow:', error);
      throw new Error(`Failed to summarize spending: ${error}`);
    }
  }
);
