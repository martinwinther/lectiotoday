/// <reference types="@cloudflare/workers-types" />
import type { PagesFunction } from '@cloudflare/workers-types';
import { Hono } from 'hono';

type Env = {
  ASSETS: Fetcher;
};

const app = new Hono<{ Bindings: Env }>();

app.get('/', async (c) => {
  const id = c.req.param('id');
  const base = new URL(c.req.url).origin;
  const r = await c.env.ASSETS.fetch(new Request(`${base}/quotes.json`));
  const quotes = (await r.json()) as Array<any>;
  const q = quotes.find((x) => x.id === id);
  if (!q) return c.json({ error: 'not_found' }, 404);
  return c.json({ quote: q });
});

export const onRequest: PagesFunction<Env> = async (context) => {
  return app.fetch(context.request, context.env, context);
};
