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
  if (!quotes?.length) return new Response('no quotes', { status: 500 });

  const now = toZonedTime(new Date(), SITE_TZ);
  const items: string[] = [];
  for (let i = 0; i < Math.min(14, quotes.length); i++) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    const ymd = Number(
      `${day.getFullYear()}${String(day.getMonth() + 1).padStart(2, '0')}${String(day.getDate()).padStart(2, '0')}`
    );
    const idx = Math.abs(ymd % quotes.length);
    const q = quotes[idx];
    const url = `${origin}/q/${q.id}`;
    const pubDate = fromZonedTime(day, SITE_TZ).toUTCString();
    items.push(
      `<item>
  <title><![CDATA[${q.quote.slice(0, 120)}]]></title>
  <link>${url}</link>
  <guid isPermaLink="false">${q.id}-${ymd}</guid>
  <pubDate>${pubDate}</pubDate>
  <description><![CDATA[${q.quote}\n— ${q.source}]]></description>
</item>`
    );
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>LectioToday — Daily reflections</title>
    <link>${origin}/</link>
    <description>Daily philosophical and religious passages with gentle discussion.</description>
    ${items.join('\n')}
  </channel>
</rss>`;
  return new Response(xml, {
    headers: {
      'content-type': 'application/rss+xml; charset=utf-8',
      'cache-control': 'public, max-age=900',
    },
  });
});

export default app;
