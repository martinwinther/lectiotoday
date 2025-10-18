import type { Quote } from '@/types/quote';

export async function loadQuotes(): Promise<Quote[]> {
  const res = await fetch('/quotes.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load quotes.json');
  return res.json();
}

export function pickDaily(quotes: Quote[], offset = 0) {
  if (!quotes.length) return { item: undefined, index: 0 };
  const now = new Date();
  const ymd = Number(
    `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}`
  );
  const idx = Math.abs((ymd + offset) % quotes.length);
  return { item: quotes[idx], index: idx };
}

