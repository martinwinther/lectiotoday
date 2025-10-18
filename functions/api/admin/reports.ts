/// <reference types="@cloudflare/workers-types" />
import { Hono, Context } from 'hono';

type Env = { DB: D1Database; ADMIN_SECRET: string };

const app = new Hono<{ Bindings: Env }>();

function auth(c: Context<{ Bindings: Env }>) {
  const h = c.req.header('authorization') || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  return token && token === c.env.ADMIN_SECRET;
}

app.get('/', async (c) => {
  if (!auth(c)) return c.text('unauthorized', 401);
  const { results } = await c.env.DB.prepare(
    `SELECT r.id, r.comment_id, r.quote_id, r.reason, r.details, r.created_at,
            c.body, c.display_name, c.hidden
     FROM reports r LEFT JOIN comments c ON c.id = r.comment_id
     ORDER BY r.created_at DESC LIMIT 200`
  ).all();
  return c.json({ reports: results || [] });
});

export default app;

