/// <reference types="@cloudflare/workers-types" />
import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => c.json({ ok: true, method: 'GET' }));
app.post('/', async (c) => c.json({ ok: true, method: 'POST' }));

export default app;

