import { NextRequest, NextResponse } from 'next/server';
import { toZonedTime } from 'date-fns-tz';
import type { Quote } from '@/types/quote';

const SITE_TZ = 'Europe/Copenhagen';

export async function GET(req: NextRequest) {
  const base = new URL(req.url).origin;
  const quotesRes = await fetch(`${base}/quotes.json`);
  const quotes = (await quotesRes.json()) as Quote[];

  if (!quotes?.length) {
    return NextResponse.json({ error: 'no_quotes' }, { status: 500 });
  }

  const now = new Date();
  const z = toZonedTime(now, SITE_TZ);
  const ymd = Number(
    `${z.getFullYear()}${String(z.getMonth() + 1).padStart(2, '0')}${String(z.getDate()).padStart(2, '0')}`
  );
  const idx = Math.abs(ymd % quotes.length);
  const item = quotes[idx];

  return NextResponse.json({ quote: item, index: idx, dateYmd: ymd, tz: SITE_TZ });
}

