import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  
  if (token !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { commentId, hide } = body;

  if (!commentId || typeof hide !== 'boolean') {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  // This would need to be implemented with a database client
  // For now, return success
  return NextResponse.json({ ok: true });
}
