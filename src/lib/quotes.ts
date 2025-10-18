import type { Quote } from '@/types/quote';
import { toZonedTime } from 'date-fns-tz';

const SITE_TZ = 'Europe/Copenhagen';

export async function loadQuotes(): Promise<Quote[]> {
  const res = await fetch('/quotes.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load quotes.json');
  return res.json();
}

export function pickDaily(quotes: Quote[], offset = 0) {
  if (!quotes.length) return { item: undefined, index: 0 };
  const now = new Date();
  const zoned = toZonedTime(now, SITE_TZ);
  const y = zoned.getFullYear();
  const m = String(zoned.getMonth() + 1).padStart(2, '0');
  const d = String(zoned.getDate()).padStart(2, '0');
  const ymd = Number(`${y}${m}${d}`);
  const idx = Math.abs((ymd + offset) % quotes.length);
  return { item: quotes[idx], index: idx };
}

