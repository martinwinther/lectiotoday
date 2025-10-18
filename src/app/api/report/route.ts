import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cfEnv } from '@/lib/cf';

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

export async function POST(req: NextRequest) {
  const { DB, HASH_SALT } = cfEnv();
  const body = await req.json().catch(() => ({}));
  const p = schema.safeParse(body);

  if (!p.success) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  const ip = req.headers.get('cf-connecting-ip') || '0.0.0.0';
  const reporter = await hashHex(HASH_SALT + ip);

  const now = Date.now();
  const id = crypto.randomUUID();

  // rate limit: 5 reports per 10 minutes per reporter
  const since = now - 10 * 60 * 1000;
  const n = await DB.prepare(
    'SELECT COUNT(*) as n FROM reports WHERE created_at > ? AND reporter_hash = ?'
  )
    .bind(since, reporter)
    .first<{ n: number }>();

  if ((n?.n ?? 0) >= 5) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  await DB.prepare(
    `INSERT INTO reports (id, comment_id, quote_id, reason, details, reporter_hash, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      p.data.commentId,
      p.data.quoteId,
      p.data.reason,
      p.data.details || null,
      reporter,
      now
    )
    .run();

  return NextResponse.json({ ok: true });
}

