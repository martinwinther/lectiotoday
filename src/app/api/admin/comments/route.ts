import { NextRequest, NextResponse } from 'next/server';
import { cfEnv } from '@/lib/cf';
import { pickDaily } from '@/lib/quotes';
import type { Quote } from '@/types/quote';

function encodeCursor(c: { t: number; id: string }) {
  return Buffer.from(JSON.stringify(c)).toString('base64url');
}

function decodeCursor(s?: string | null) {
  if (!s) return null;
  try {
    return JSON.parse(Buffer.from(s, 'base64url').toString('utf8')) as {
      t: number;
      id: string;
    };
  } catch {
    return null;
  }
}

async function loadQuotesMap(req: NextRequest) {
  try {
    const r = await fetch(new URL('/quotes.json', req.url).toString());
    const quotes = (await r.json()) as Quote[];
    const map = new Map(
      quotes.map((q) => [q.id, { quote: q.quote, source: q.source }])
    );
    return map;
  } catch {
    // Fallback: return empty map if quotes.json can't be loaded
    return new Map();
  }
}

function isAuth(req: NextRequest, secret: string) {
  const h = req.headers.get('authorization') || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  return token && token === secret;
}

export async function GET(req: NextRequest) {
  const { DB, ADMIN_SECRET } = cfEnv();
  if (!isAuth(req, ADMIN_SECRET))
    return new NextResponse('unauthorized', { status: 401 });

  const url = new URL(req.url);
  const scope = (url.searchParams.get('scope') || 'today') as
    | 'today'
    | 'reported'
    | 'all'
    | 'hidden'
    | 'deleted';
  const quoteIdParam = url.searchParams.get('quoteId') || '';
  const q = url.searchParams.get('q') || '';
  const since = url.searchParams.get('since')
    ? Number(url.searchParams.get('since'))
    : undefined;
  const until = url.searchParams.get('until')
    ? Number(url.searchParams.get('until'))
    : undefined;
  const limit = Math.max(
    1,
    Math.min(100, Number(url.searchParams.get('limit')) || 50)
  );
  const cursor = decodeCursor(url.searchParams.get('cursor'));

  let quoteId = quoteIdParam;
  if (!quoteId && scope === 'today') {
    try {
      const r = await fetch(new URL('/quotes.json', req.url).toString());
      const quotes = (await r.json()) as Quote[];
      const { item } = pickDaily(quotes);
      quoteId = item?.id || '';
    } catch {
      // If we can't load quotes, just use empty string
      quoteId = '';
    }
  }

  const where: string[] = [];
  const params: (string | number)[] = [];

  if (scope === 'deleted') {
    where.push('c.deleted_at IS NOT NULL');
  } else {
    where.push('c.deleted_at IS NULL');
  }
  if (scope === 'hidden') where.push('c.hidden = 1');
  if (scope === 'reported')
    where.push('(rc.rc IS NOT NULL AND rc.rc > 0)');
  if (quoteId) {
    where.push('c.quote_id = ?');
    params.push(quoteId);
  }

  if (q) {
    where.push('(c.body LIKE ? OR c.display_name LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }

  if (since) {
    where.push('c.created_at >= ?');
    params.push(since);
  }
  if (until) {
    where.push('c.created_at <= ?');
    params.push(until);
  }

  if (cursor) {
    where.push('(c.created_at < ? OR (c.created_at = ? AND c.id < ?))');
    params.push(cursor.t, cursor.t, cursor.id);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const sql = `
    SELECT c.id, c.quote_id, c.parent_id, c.body, c.display_name,
           c.created_at, c.updated_at, c.hidden, c.deleted_at,
           COALESCE(rc.rc, 0) AS reports_count
    FROM comments c
    LEFT JOIN (
      SELECT comment_id, COUNT(*) AS rc
      FROM reports
      GROUP BY comment_id
    ) rc ON rc.comment_id = c.id
    ${whereSql}
    ORDER BY c.created_at DESC, c.id DESC
    LIMIT ?
  `;

  const res = await DB.prepare(sql)
    .bind(...params, limit + 1)
    .all();
  const rows = res.results || [];

  let nextCursor: string | undefined = undefined;
  if (rows.length > limit) {
    const last = rows[limit - 1] as {
      created_at: number;
      id: string;
    };
    nextCursor = encodeCursor({
      t: Number(last.created_at),
      id: String(last.id),
    });
    rows.length = limit;
  }

  const map = await loadQuotesMap(req);
  const items = rows.map((r: Record<string, unknown>) => {
    const qv = map.get(String(r.quote_id)) || null;
    return {
      ...r,
      quote_preview: qv?.quote?.slice(0, 120) || null,
      quote_source: qv?.source || null,
    };
  });

  return NextResponse.json({ items, nextCursor });
}

