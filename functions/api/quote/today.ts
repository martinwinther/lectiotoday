/// <reference types="@cloudflare/workers-types" />
import type { EventContext } from '@cloudflare/workers-types';
import { Hono } from 'hono';
import { toZonedTime } from 'date-fns-tz';

type Env = {
  ASSETS: Fetcher;
};

const SITE_TZ = 'Europe/Copenhagen';
const app = new Hono<{ Bindings: Env }>();

app.get('/', async (c) => {
  const base = new URL(c.req.url).origin;
  const r = await c.env.ASSETS.fetch(new Request(`${base}/quotes.json`));
  const quotes = (await r.json()) as Array<any>;
  if (!quotes?.length) return c.json({ error: 'no_quotes' }, 500);

  const now = new Date();
  const z = toZonedTime(now, SITE_TZ);
  const ymd = Number(
    `${z.getFullYear()}${String(z.getMonth() + 1).padStart(2, '0')}${String(z.getDate()).padStart(2, '0')}`
  );
  const idx = Math.abs(ymd % quotes.length);
  const item = quotes[idx];
  return c.json({ quote: item, index: idx, dateYmd: ymd, tz: SITE_TZ });
});

export const onRequest = async (context: EventContext<Env, any, Record<string, unknown>>) => {
  return app.fetch(context.request, context.env, context);
};
