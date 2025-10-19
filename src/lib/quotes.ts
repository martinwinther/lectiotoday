import type { Quote } from '@/types/quote';

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

export function pickDaily(quotes: Quote[]) {
  if (!quotes?.length) return { item: undefined, index: 0, dayNumber: 0 };
  
  // Calculate days since Unix epoch (Jan 1, 1970) in UTC
  const now = new Date();
  const daysSinceEpoch = Math.floor(now.getTime() / MILLISECONDS_PER_DAY);
  
  // Simple modulo ensures even distribution regardless of array size
  const index = daysSinceEpoch % quotes.length;
  
  return { item: quotes[index], index, dayNumber: daysSinceEpoch };
}
