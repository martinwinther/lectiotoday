/// <reference types="@cloudflare/workers-types" />
import type { EventContext } from '@cloudflare/workers-types';
import { Hono, Context } from 'hono';
import { z } from 'zod';

type Env = { DB: D1Database; ADMIN_SECRET: string };

const app = new Hono<{ Bindings: Env }>();

function auth(c: Context<{ Bindings: Env }>) {
  const h = c.req.header('authorization') || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  return token && token === c.env.ADMIN_SECRET;
}

// GET /api/admin/reports
app.get('/reports', async (c) => {
  if (!auth(c)) return c.text('unauthorized', 401);
  const { results } = await c.env.DB.prepare(
    `SELECT r.id, r.comment_id, r.quote_id, r.reason, r.details, r.created_at,
            c.body, c.display_name, c.hidden
     FROM reports r LEFT JOIN comments c ON c.id = r.comment_id
     ORDER BY r.created_at DESC LIMIT 200`
  ).all();
  return c.json({ reports: results || [] });
});

// POST /api/admin/comments/hide
const actionSchema = z.object({ commentId: z.string().min(8), hide: z.boolean() });

app.post('/comments/hide', async (c) => {
  if (!auth(c)) return c.text('unauthorized', 401);
  const body = await c.req.json().catch(() => ({}));
  const p = actionSchema.safeParse(body);
  if (!p.success) return c.json({ error: 'invalid' }, 400);
  await c.env.DB.prepare('UPDATE comments SET hidden = ? WHERE id = ?')
    .bind(p.data.hide ? 1 : 0, p.data.commentId)
    .run();
  return c.json({ ok: true });
});

export const onRequest = async (context: EventContext<Env, any, Record<string, unknown>>) => {
  return app.fetch(context.request as any, context.env, context);
};
