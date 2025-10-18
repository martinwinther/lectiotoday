import type { Comment } from '@/types/comment';

export async function fetchComments(quoteId: string) {
  const url = `/api/comments?quoteId=${encodeURIComponent(quoteId)}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load comments');
  return res.json() as Promise<{ comments: Comment[] }>;
}

export async function postComment(payload: {
  quoteId: string;
  body: string;
  parentId?: string;
  displayName?: string;
  turnstileToken: string;
  honeypot?: string;
}) {
  const res = await fetch('/api/comments', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err?.error || 'Failed to post');
  }
  return res.json();
}

