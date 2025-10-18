import { NextRequest, NextResponse } from 'next/server';
import { cfEnv } from '@/lib/cf';

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

  const { DB, HASH_SALT } = cfEnv();

  const body = (await req
    .json()
    .catch(() => ({}))) as { action?: string; commentId?: string };
  const action = String(body?.action || '');
  const commentId = String(body?.commentId || '');
  if (!commentId)
    return NextResponse.json({ error: 'invalid' }, { status: 400 });

  const now = Date.now();

  const row = await DB.prepare('SELECT quote_id FROM comments WHERE id = ?')
    .bind(commentId)
    .first<{ quote_id: string }>();
  const quoteId = row?.quote_id || '';

  switch (action) {
    case 'hide':
      await DB.prepare('UPDATE comments SET hidden = 1 WHERE id = ?')
        .bind(commentId)
        .run();
      break;
    case 'unhide':
      await DB.prepare('UPDATE comments SET hidden = 0 WHERE id = ?')
        .bind(commentId)
        .run();
      break;
    case 'delete':
      await DB.prepare('UPDATE comments SET deleted_at = ? WHERE id = ?')
        .bind(now, commentId)
        .run();
      break;
    case 'restore':
      await DB.prepare('UPDATE comments SET deleted_at = NULL WHERE id = ?')
        .bind(commentId)
        .run();
      break;
    case 'purge':
      await DB.prepare('DELETE FROM comments WHERE id = ?')
        .bind(commentId)
        .run();
      break;
    default:
      return NextResponse.json({ error: 'unknown_action' }, { status: 400 });
  }

  try {
    const ip = req.headers.get('cf-connecting-ip') || '0.0.0.0';
    const data = new TextEncoder().encode(HASH_SALT + ip);
    const dig = await crypto.subtle.digest('SHA-256', data);
    const adminHash = Array.from(new Uint8Array(dig))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 32);
    await DB.prepare(
      `INSERT INTO admin_actions (id, admin_hash, action, comment_id, quote_id, meta, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        crypto.randomUUID(),
        adminHash,
        action,
        commentId,
        quoteId,
        null,
        now
      )
      .run();
  } catch {
    /* ignore */
  }

  return NextResponse.json({ ok: true });
}

