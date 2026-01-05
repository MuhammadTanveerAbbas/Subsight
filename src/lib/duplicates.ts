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
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  return matrix[str2.length][str1.length];
}