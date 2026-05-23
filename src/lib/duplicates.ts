import { Subscription } from './types';

export interface DuplicateMatch {
  subscription: Subscription;
  similarity: number;
  reason: string;
}

export const findDuplicates = (
  newSubscription: Omit<Subscription, 'id'>,
  existingSubscriptions: Subscription[]
): DuplicateMatch[] => {
  const duplicates: DuplicateMatch[] = [];

  existingSubscriptions.forEach(existing => {
    let similarity = 0;
    const reasons: string[] = [];

    // Exact name match
    if (existing.name.toLowerCase() === newSubscription.name.toLowerCase()) {
      similarity += 0.8;
      reasons.push('Same name');
    }

    // Similar name (Levenshtein distance)
    const nameDistance = levenshteinDistance(
      existing.name.toLowerCase(),
      newSubscription.name.toLowerCase()
    );
    if (nameDistance <= 2 && nameDistance > 0) {
      similarity += 0.6;
      reasons.push('Similar name');
    }

    // Same provider
    if (existing.provider.toLowerCase() === newSubscription.provider.toLowerCase()) {
      similarity += 0.7;
      reasons.push('Same provider');
    }

    // Same category and similar amount
    if (existing.category === newSubscription.category) {
      similarity += 0.3;
      if (Math.abs(existing.amount - newSubscription.amount) < existing.amount * 0.1) {
        similarity += 0.4;
        reasons.push('Same category and similar price');
      }
    }

    if (similarity >= 0.6) {
      duplicates.push({
        subscription: existing,
        similarity,
        reason: reasons.join(', ')
      });
    }
  });

  return duplicates.sort((a, b) => b.similarity - a.similarity);
};

function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length
  const n = str2.length
  const d: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0))

  for (let i = 0; i <= m; i++) d[0]![i] = i
  for (let j = 0; j <= n; j++) d[j]![0] = j

  for (let j = 1; j <= n; j++) {
    for (let i = 1; i <= m; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      d[j]![i] = Math.min(
        (d[j]![i - 1] ?? 0) + 1,
        (d[j - 1]![i] ?? 0) + 1,
        (d[j - 1]![i - 1] ?? 0) + cost,
      )
    }
  }

  return d[n]![m]!
}