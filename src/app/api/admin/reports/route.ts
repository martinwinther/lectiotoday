import { NextRequest, NextResponse } from 'next/server';
import { cfEnv } from '@/lib/cf';

function isAuthorized(req: NextRequest) {
  const { ADMIN_SECRET } = cfEnv();
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  return token && token === ADMIN_SECRET;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return new NextResponse('unauthorized', { status: 401 });
  }

  const { DB } = cfEnv();
  const { results } = await DB.prepare(
    `SELECT r.id, r.comment_id, r.quote_id, r.reason, r.details, r.created_at,
            c.body, c.display_name, c.hidden
     FROM reports r LEFT JOIN comments c ON c.id = r.comment_id
     ORDER BY r.created_at DESC LIMIT 200`
  ).all();

  return NextResponse.json({ reports: results || [] });
}

