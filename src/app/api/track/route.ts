import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  event: z.enum(['view_quote', 'share', 'copy_link', 'post_ok', 'post_blocked']),
  quoteId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const p = schema.safeParse(body);
    if (!p.success) return NextResponse.json({ error: 'invalid' }, { status: 400 });

    // For now, just return success
    // This endpoint is fire-and-forget for tracking, so we don't need database in dev
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error tracking event:', error);
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
  }
}

