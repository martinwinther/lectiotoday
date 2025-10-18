import type { Quote } from '@/types/quote';
import { toZonedTime } from 'date-fns-tz';

const SITE_TZ = 'Europe/Copenhagen';

export function pickDaily(quotes: Quote[]) {
  if (!quotes?.length) return { item: undefined, index: 0, ymd: 0 };
  const zoned = toZonedTime(new Date(), SITE_TZ);
  const y = zoned.getFullYear();
  const m = String(zoned.getMonth() + 1).padStart(2, '0');
  const d = String(zoned.getDate()).padStart(2, '0');
  const ymd = Number(`${y}${m}${d}`);
  const index = Math.abs(ymd % quotes.length);
  return { item: quotes[index], index, ymd };
}
