/// <reference types="@cloudflare/workers-types" />
import type { EventContext } from '@cloudflare/workers-types';
import { Hono } from 'hono';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

type Env = {
  ASSETS: Fetcher;
};

const SITE_TZ = 'Europe/Copenhagen';
const app = new Hono<{ Bindings: Env }>();

app.get('/', async (c) => {
  const origin = new URL(c.req.url).origin;
  const r = await c.env.ASSETS.fetch(new Request(`${origin}/quotes.json`));
  const quotes = (await r.json()) as Array<any>;
  if (!quotes?.length) return c.json({ error: 'no_quotes' }, 500);

  const now = toZonedTime(new Date(), SITE_TZ);
  const items: any[] = [];
  for (let i = 0; i < Math.min(14, quotes.length); i++) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    const ymd = Number(
      `${day.getFullYear()}${String(day.getMonth() + 1).padStart(2, '0')}${String(day.getDate()).padStart(2, '0')}`
    );
    const idx = Math.abs(ymd % quotes.length);
    const q = quotes[idx];
    items.push({
      id: `${q.id}-${ymd}`,
      url: `${origin}/q/${q.id}`,
      title: q.quote.slice(0, 120),
      content_text: `${q.quote}\n— ${q.source}`,
      date_published: fromZonedTime(day, SITE_TZ).toISOString(),
    });
  }

  return c.json(
    {
      version: 'https://jsonfeed.org/version/1.1',
      title: 'LectioToday — Daily reflections',
      home_page_url: `${origin}/`,
      feed_url: `${origin}/feed.json`,
      items,
    },
    200,
    { 'cache-control': 'public, max-age=900' }
  );
});

export default app;
