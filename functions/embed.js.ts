/// <reference types="@cloudflare/workers-types" />
import type { EventContext } from '@cloudflare/workers-types';
import { Hono } from 'hono';

const app = new Hono();

app.get('/', async (c) => {
  const origin = new URL(c.req.url).origin;

  const js = `(()=>{const s=document.currentScript;
const theme=(s?.dataset?.theme||'dark');
const root=document.createElement('div');
root.style.cssText='all:initial; font-family:ui-sans-serif,system-ui,-apple-system; display:block; max-width:40rem; margin:1rem auto;';
s.parentNode?.insertBefore(root,s);

function css(el,styles){Object.assign(el.style,styles);}

fetch('${origin}/api/quote/today').then(r=>r.json()).then(({quote})=>{
  if(!quote){root.textContent='LectioToday';return;}
  const card=document.createElement('div');
  css(card,{borderRadius:'16px',padding:'20px',border:'1px solid rgba(255,255,255,0.15)',
    background: theme==='light'?'rgba(0,0,0,0.03)':'rgba(255,255,255,0.06)',
    color: theme==='light'?'#0b0b0f':'#f3f4f6', backdropFilter:'blur(16px)'});
  const q=document.createElement('div');
  css(q,{fontFamily:'serif',fontSize:'18px',lineHeight:'1.45',marginBottom:'10px'}); q.textContent='"'+quote.quote+'"';
  const src=document.createElement('div');
  css(src,{opacity:'0.8',fontSize:'13px'}); src.textContent='— '+(quote.source||'');
  const brand=document.createElement('a');
  brand.href='${origin}/q/'+quote.id; brand.target='_blank'; brand.rel='noopener';
  css(brand,{display:'inline-block',marginTop:'8px',fontSize:'12px',opacity:'0.8',textDecoration:'underline'});
  brand.textContent='LectioToday';
  card.append(q,src,brand); root.append(card);
}).catch(()=>{root.textContent='LectioToday';});
})();`;

  return new Response(js, {
    headers: {
      'content-type': 'application/javascript; charset=utf-8',
      'cache-control': 'public, max-age=86400',
    },
  });
});

export const onRequest = async (context: EventContext<{}, any, Record<string, unknown>>) => {
  return app.fetch(context.request as any, context.env, context);
};

