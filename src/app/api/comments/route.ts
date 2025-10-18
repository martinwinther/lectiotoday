import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const getSchema = z.object({ quoteId: z.string().min(3).max(128) });

const postSchema = z.object({
  quoteId: z.string().min(3).max(128),
  body: z.string().min(2).max(800),
  parentId: z.string().optional(),
  displayName: z.string().max(40).optional(),
  turnstileToken: z.string(),
  honeypot: z.string().optional(),
});

async function hashHex(input: string) {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const quoteId = searchParams.get('quoteId') ?? '';
  
  const p = getSchema.safeParse({ quoteId });
  if (!p.success) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  try {
    // For now, return empty array since we don't have database access in Next.js API routes
    // In production, this should connect to your database
    return NextResponse.json({ comments: [] });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const p = postSchema.safeParse(data);
    if (!p.success) return NextResponse.json({ error: 'invalid' }, { status: 400 });

    // honeypot
    if (p.data.honeypot && p.data.honeypot.trim().length > 0) {
      return NextResponse.json({ error: 'bot' }, { status: 400 });
    }

    // Turnstile verify
    const form = new FormData();
    form.append('secret', process.env.TURNSTILE_SECRET!);
    form.append('response', p.data.turnstileToken);
    const verify = (await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
    })
      .then((r) => r.json())
      .catch(() => ({ success: false }))) as { success: boolean };
    if (!verify.success) return NextResponse.json({ error: 'bot_check_failed' }, { status: 403 });

    const now = Date.now();
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '0.0.0.0';
    const ipHash = await hashHex(process.env.HASH_SALT! + ip);
    const normalized = p.data.body.replace(/\s+/g, ' ').trim().toLowerCase();
    const bodyHash = await hashHex(normalized);

    // links limit (max 1)
    const linkCount = (p.data.body.match(/https?:\/\//gi) || []).length;
    if (linkCount > 1) return NextResponse.json({ error: 'too_many_links' }, { status: 400 });

    // For now, just return success since we don't have database access
    // In production, this should connect to your database and implement the full logic
    const id = crypto.randomUUID();
    return NextResponse.json({ ok: true, id, created_at: now });
  } catch (error) {
    console.error('Error posting comment:', error);
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
  }
}
