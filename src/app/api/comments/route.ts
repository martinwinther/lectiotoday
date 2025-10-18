import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cfEnv } from '@/lib/cf';

const getSchema = z.object({ quoteId: z.string().min(3).max(128) });

const postSchema = z.object({
  quoteId: z.string().min(3).max(128),
  body: z.string().min(2).max(800),
  parentId: z.string().optional(),
  displayName: z.string().max(40).optional(),
  turnstileToken: z.string(),
  honeypot: z.string().optional(),
});

async function hashHex(input: string) {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function GET(req: NextRequest) {
  const { DB } = cfEnv();
  const url = new URL(req.url);
  const quoteId = url.searchParams.get('quoteId') || '';

  const p = getSchema.safeParse({ quoteId });
  if (!p.success) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  const { results } = await DB.prepare(
    `SELECT id, quote_id, parent_id, body, display_name, created_at, updated_at, score
     FROM comments WHERE quote_id = ? AND hidden = 0 AND deleted_at IS NULL ORDER BY created_at DESC`
  )
    .bind(p.data.quoteId)
    .all();

  return NextResponse.json(
    { comments: results ?? [] },
    { headers: { 'cache-control': 'no-store' } }
  );
}

export async function POST(req: NextRequest) {
  const { DB, TURNSTILE_SECRET, HASH_SALT } = cfEnv();
  const data = await req.json().catch(() => ({}));
  const p = postSchema.safeParse(data);

  if (!p.success) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  // honeypot check
  if (p.data.honeypot && p.data.honeypot.trim().length > 0) {
    return NextResponse.json({ error: 'bot' }, { status: 400 });
  }

  // verify Turnstile
  const form = new FormData();
  form.append('secret', TURNSTILE_SECRET);
  form.append('response', p.data.turnstileToken);

  const verify = (await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form,
  })
    .then((r) => r.json())
    .catch(() => ({ success: false }))) as { success: boolean };

  if (!verify.success) {
    return NextResponse.json({ error: 'bot_check_failed' }, { status: 403 });
  }

  const now = Date.now();
  const ip = req.headers.get('cf-connecting-ip') || '0.0.0.0';
  const ipHash = await hashHex(HASH_SALT + ip);
  const normalized = p.data.body.replace(/\s+/g, ' ').trim().toLowerCase();
  const bodyHash = await hashHex(normalized);

  // check links limit (max 1)
  const linkCount = (p.data.body.match(/https?:\/\//gi) || []).length;
  if (linkCount > 1) {
    return NextResponse.json({ error: 'too_many_links' }, { status: 400 });
  }

  // rate limit: max 5 posts per 10 minutes per ip_hash
  const since = now - 10 * 60 * 1000;
  const recent = await DB.prepare(
    'SELECT COUNT(*) as n FROM comments WHERE created_at > ? AND ip_hash = ?'
  )
    .bind(since, ipHash)
    .first<{ n: number }>();

  if ((recent?.n ?? 0) >= 5) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  // check duplicate per quote
  const dup = await DB.prepare(
    'SELECT id FROM comments WHERE quote_id = ? AND body_hash = ? LIMIT 1'
  )
    .bind(p.data.quoteId, bodyHash)
    .first();

  if (dup) {
    return NextResponse.json({ error: 'duplicate' }, { status: 409 });
  }

  const id = crypto.randomUUID();
  await DB.prepare(
    `INSERT INTO comments (id, quote_id, parent_id, body, display_name, created_at, updated_at, ip_hash, body_hash, score)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`
  )
    .bind(
      id,
      p.data.quoteId,
      p.data.parentId ?? null,
      p.data.body,
      p.data.displayName ?? null,
      now,
      now,
      ipHash,
      bodyHash
    )
    .run();

  return NextResponse.json({ ok: true, id, created_at: now });
}

