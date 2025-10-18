import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cfEnv } from '@/lib/cf';

const actionSchema = z.object({
  commentId: z.string().min(8),
  hide: z.boolean(),
});

function isAuthorized(req: NextRequest) {
  const { ADMIN_SECRET } = cfEnv();
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  return token && token === ADMIN_SECRET;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return new NextResponse('unauthorized', { status: 401 });
  }

  const { DB } = cfEnv();
  const body = await req.json().catch(() => ({}));
  const p = actionSchema.safeParse(body);

  if (!p.success) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  await DB.prepare('UPDATE comments SET hidden = ? WHERE id = ?')
    .bind(p.data.hide ? 1 : 0, p.data.commentId)
    .run();

  return NextResponse.json({ ok: true });
}

