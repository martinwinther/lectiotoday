/// <reference types="@cloudflare/workers-types" />
import type { EventContext } from '@cloudflare/workers-types';
import { Hono } from 'hono';
import { z } from 'zod';

type Env = { DB: D1Database; HASH_SALT: string };

const app = new Hono<{ Bindings: Env }>();

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

app.post('/', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const p = schema.safeParse(body);
  if (!p.success) return c.json({ error: 'invalid' }, 400);

  const ip = c.req.header('cf-connecting-ip') || '0.0.0.0';
  const reporter = await hashHex(c.env.HASH_SALT + ip);

  const now = Date.now();
  const id = crypto.randomUUID();

  // Basic rate-limit: 5 reports / 10min / reporter
  const since = now - 10 * 60 * 1000;
  const n = await c.env.DB.prepare(
    'SELECT COUNT(*) as n FROM reports WHERE created_at > ? AND reporter_hash = ?'
  )
    .bind(since, reporter)
    .first<{ n: number }>();
  if ((n?.n ?? 0) >= 5) return c.json({ error: 'rate_limited' }, 429);

  await c.env.DB.prepare(
    `INSERT INTO reports (id, comment_id, quote_id, reason, details, reporter_hash, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(id, p.data.commentId, p.data.quoteId, p.data.reason, p.data.details || null, reporter, now)
    .run();

  return c.json({ ok: true });
});

export const onRequest = async (context: EventContext<Env, any, Record<string, unknown>>) => {
  return app.fetch(context.request as any, context.env, context as any);
};
