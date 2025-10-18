/// <reference types="@cloudflare/workers-types" />
import { Hono } from 'hono';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-wasm';
import React from 'react';

const app = new Hono();

async function loadQuotes(c: any) {
  const base = new URL(c.req.url).origin;
  const r = await c.env.ASSETS.fetch(new Request(`${base}/quotes.json`));
  return r.json() as Promise<Array<{ id: string; quote: string; source: string }>>;
}

async function loadFont(c: any) {
  const base = new URL(c.req.url).origin;
  const r = await c.env.ASSETS.fetch(new Request(`${base}/fonts/EBGaramond-Regular.ttf`));
  return await r.arrayBuffer();
}

app.get('/:id.png', async (c) => {
  const id = c.req.param('id');
  const quotes = await loadQuotes(c);
  const fontData = await loadFont(c);

  const q = quotes.find((x) => x.id === id);
  const title = q ? q.quote : 'LectioToday';
  const source = q?.source ?? 'Daily reflections';

  const svg = await satori(
    React.createElement(
      'div',
      {
        style: {
          width: 1200,
          height: 630,
          display: 'flex',
          background: 'linear-gradient(180deg, #0b0b0f 0%, #15151c 100%)',
          color: 'white',
          padding: 64,
          position: 'relative',
          fontFamily: 'EBG',
        },
      },
      React.createElement(
        'div',
        {
          style: {
            position: 'absolute',
            inset: 32,
            borderRadius: 28,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.15)',
            padding: 48,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          },
        },
        React.createElement('div', { style: { fontSize: 48, lineHeight: 1.15 } }, `"${title}"`),
        React.createElement('div', { style: { fontSize: 24, color: 'rgba(220,220,235,0.9)' } }, source),
        React.createElement('div', { style: { position: 'absolute', top: 24, right: 32, fontSize: 24, opacity: 0.9 } }, 'LectioToday')
      )
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'EBG',
          data: fontData,
          weight: 400,
          style: 'normal',
        },
      ],
    }
  );

  const resvg = new Resvg(svg, { background: 'rgba(0,0,0,0)' });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  
  return new Response(pngBuffer as unknown as BodyInit, {
    headers: {
      'content-type': 'image/png',
      'cache-control': 'public, max-age=86400',
    },
  });
});

export const onRequest = async (context) => {
  return app.fetch(context.request, context.env, context);
};

