/// <reference types="@cloudflare/workers-types" />
import type { PagesFunction } from '@cloudflare/workers-types';
import { Hono } from 'hono';
import { z } from 'zod';

type Env = {
  DB: D1Database;
  HASH_SALT: string;
  TURNSTILE_SECRET: string;
};

const app = new Hono<{ Bindings: Env }>();

const getSchema = z.object({ quoteId: z.string().min(3).max(128) });

app.get('/', async (c) => {
  const p = getSchema.safeParse({ quoteId: c.req.query('quoteId') ?? '' });
  if (!p.success) return c.json({ error: 'invalid' }, 400);
  const { results } = await c.env.DB.prepare(
    `SELECT id, quote_id, parent_id, body, display_name, created_at, updated_at, score
     FROM comments WHERE quote_id = ? AND hidden = 0 ORDER BY created_at DESC`
  )
    .bind(p.data.quoteId)
    .all();
  return c.json({ comments: results ?? [] });
});

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

app.post('/', async (c) => {
  const data = await c.req.json().catch(() => ({}));
  const p = postSchema.safeParse(data);
  if (!p.success) return c.json({ error: 'invalid' }, 400);

  // honeypot
  if (p.data.honeypot && p.data.honeypot.trim().length > 0) {
    return c.json({ error: 'bot' }, 400);
  }

  // Turnstile verify
  const form = new FormData();
  form.append('secret', c.env.TURNSTILE_SECRET);
  form.append('response', p.data.turnstileToken);
  const verify = (await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form,
  })
    .then((r) => r.json())
    .catch(() => ({ success: false }))) as { success: boolean };
  if (!verify.success) return c.json({ error: 'bot_check_failed' }, 403);

  const now = Date.now();
  const ip = c.req.header('cf-connecting-ip') || '0.0.0.0';
  const ipHash = await hashHex(c.env.HASH_SALT + ip);
  const normalized = p.data.body.replace(/\s+/g, ' ').trim().toLowerCase();
  const bodyHash = await hashHex(normalized);

  // links limit (max 1)
  const linkCount = (p.data.body.match(/https?:\/\//gi) || []).length;
  if (linkCount > 1) return c.json({ error: 'too_many_links' }, 400);

  // rate limit: max 5 posts / 10 minutes / ip_hash
  const since = now - 10 * 60 * 1000;
  const recent = await c.env.DB.prepare(
    'SELECT COUNT(*) as n FROM comments WHERE created_at > ? AND ip_hash = ?'
  )
    .bind(since, ipHash)
    .first<{ n: number }>();
  if ((recent?.n ?? 0) >= 5) return c.json({ error: 'rate_limited' }, 429);

  // duplicate per quote
  const dup = await c.env.DB.prepare(
    'SELECT id FROM comments WHERE quote_id = ? AND body_hash = ? LIMIT 1'
  )
    .bind(p.data.quoteId, bodyHash)
    .first();
  if (dup) return c.json({ error: 'duplicate' }, 409);

  const id = crypto.randomUUID();
  await c.env.DB.prepare(
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

  return c.json({ ok: true, id, created_at: now });
});

export const onRequest: PagesFunction<Env> = async (context) => {
  return app.fetch(context.request, context.env, context);
};

