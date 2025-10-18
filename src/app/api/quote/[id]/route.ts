import { NextRequest, NextResponse } from 'next/server';
import type { Quote } from '@/types/quote';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const base = new URL(req.url).origin;
  const quotesRes = await fetch(`${base}/quotes.json`);
  const quotes = (await quotesRes.json()) as Quote[];
  const q = quotes.find((x) => x.id === id);

  if (!q) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  return NextResponse.json({ quote: q });
}

