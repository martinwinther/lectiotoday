import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  commentId: z.string().min(8),
  quoteId: z.string().min(3),
  reason: z.enum(['spam', 'abuse', 'offtopic', 'other']),
  details: z.string().max(400).optional(),
});

async function hashHex(s: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const p = schema.safeParse(body);
    if (!p.success) return NextResponse.json({ error: 'invalid' }, { status: 400 });

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '0.0.0.0';
    await hashHex(process.env.HASH_SALT! + ip);

    // For now, just return success
    // In production, this should connect to database and implement full logic
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error submitting report:', error);
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }
}

