/// <reference types="@cloudflare/workers-types" />
import type { EventContext } from '@cloudflare/workers-types';
import { Hono } from 'hono';
import { z } from 'zod';

type Env = { DB: D1Database };

const app = new Hono<{ Bindings: Env }>();
const schema = z.object({
  event: z.enum(['view_quote', 'share', 'copy_link', 'post_ok', 'post_blocked']),
  quoteId: z.string().optional(),
});

app.post('/', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const p = schema.safeParse(body);
  if (!p.success) return c.json({ error: 'invalid' }, 400);

  const now = new Date();
  const ymd = Number(
    `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}`
  );
  const qid = p.data.quoteId || null;

  await c.env.DB.prepare(
    `INSERT INTO events (ymd, quote_id, event, n) VALUES (?, ?, ?, 1)
     ON CONFLICT(ymd, quote_id, event) DO UPDATE SET n = n + 1`
  )
    .bind(ymd, qid, p.data.event)
    .run();

  return c.json({ ok: true });
});

export default app;
