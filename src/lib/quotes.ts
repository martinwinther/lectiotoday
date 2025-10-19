import type { Quote } from '@/types/quote';

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

function simpleHash(num: number): number {
  // Simple hash function to pseudo-randomize but stay deterministic
  let hash = num;
  hash = ((hash >> 16) ^ hash) * 0x45d9f3b;
  hash = ((hash >> 16) ^ hash) * 0x45d9f3b;
  hash = (hash >> 16) ^ hash;
  return Math.abs(hash);
}

export function pickDaily(quotes: Quote[]) {
  if (!quotes?.length) return { item: undefined, index: 0, dayNumber: 0 };
  
  // Calculate days since Unix epoch (Jan 1, 1970) in UTC
  const now = new Date();
  const daysSinceEpoch = Math.floor(now.getTime() / MILLISECONDS_PER_DAY);
  
  // Hash the day number to pseudo-randomize quote order
  const hashedDay = simpleHash(daysSinceEpoch);
  const index = hashedDay % quotes.length;
  
  return { item: quotes[index], index, dayNumber: daysSinceEpoch };
}
