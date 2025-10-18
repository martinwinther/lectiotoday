import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cfEnv } from '@/lib/cf';

const schema = z.object({
  event: z.enum(['view_quote', 'share', 'copy_link', 'post_ok', 'post_blocked']),
  quoteId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const { DB } = cfEnv();
  const body = await req.json().catch(() => ({}));
  const p = schema.safeParse(body);

  if (!p.success) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  const now = new Date();
  const ymd = Number(
    `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}`
  );
  const qid = p.data.quoteId || null;

  await DB.prepare(
    `INSERT INTO events (ymd, quote_id, event, n) VALUES (?, ?, ?, 1)
     ON CONFLICT(ymd, quote_id, event) DO UPDATE SET n = n + 1`
  )
    .bind(ymd, qid, p.data.event)
    .run();

  return NextResponse.json({ ok: true });
}

