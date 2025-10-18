/// <reference types="@cloudflare/workers-types" />
import { Hono, Context } from 'hono';
import { z } from 'zod';

type Env = { DB: D1Database; ADMIN_SECRET: string };

const app = new Hono<{ Bindings: Env }>();

function auth(c: Context<{ Bindings: Env }>) {
  const h = c.req.header('authorization') || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  return token && token === c.env.ADMIN_SECRET;
}

const actionSchema = z.object({ commentId: z.string().min(8), hide: z.boolean() });

app.post('/', async (c) => {
  if (!auth(c)) return c.text('unauthorized', 401);
  const body = await c.req.json().catch(() => ({}));
  const p = actionSchema.safeParse(body);
  if (!p.success) return c.json({ error: 'invalid' }, 400);
  await c.env.DB.prepare('UPDATE comments SET hidden = ? WHERE id = ?')
    .bind(p.data.hide ? 1 : 0, p.data.commentId)
    .run();
  return c.json({ ok: true });
});

export default app;

