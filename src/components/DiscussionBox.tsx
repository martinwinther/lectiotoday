'use client';

import { useEffect, useState } from 'react';
import { Turnstile } from '@/components/Turnstile';
import { fetchComments, postComment } from '@/lib/comments';
import type { Comment } from '@/types/comment';

export function DiscussionBox({ quoteId }: { quoteId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingStart, setTypingStart] = useState<number | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string;

  useEffect(() => {
    fetchComments(quoteId)
      .then((r) => setComments(r.comments || []))
      .catch(() => {});
  }, [quoteId]);

  const minTypingMs = 1200; // basic anti-bot: require some dwell time

  async function submit() {
    const text = body.trim();
    if (text.length < 2) {
      setError('Say a little more.');
      return;
    }
    if (!token) {
      setError('Please complete the check.');
      return;
    }
    if (!typingStart || Date.now() - typingStart < minTypingMs) {
      setError('Take a moment, then post.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await postComment({
        quoteId,
        body: text,
        displayName: displayName.trim() || undefined,
        turnstileToken: token,
        honeypot: '', // kept empty; bots might fill this
      });
      setBody('');
      setDisplayName('');
      setTypingStart(null);
      // refresh list
      fetchComments(quoteId).then((r) => setComments(r.comments || []));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not post.');
    } finally {
      setBusy(false);
      setToken(''); // force a new token
    }
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-sm uppercase tracking-widest text-zinc-400">Conversation</h3>
        <div className="text-xs text-zinc-500">
          Quote ID: <span className="font-mono text-zinc-400">{quoteId}</span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <input
          className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all"
          placeholder="Optional display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <textarea
          className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-[15px] leading-6 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent resize-none transition-all"
          placeholder="Add a thoughtful, kind comment…"
          rows={3}
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            if (!typingStart) setTypingStart(Date.now());
          }}
        />
        <div className="flex items-center justify-between gap-3">
          <div className="text-[11px] text-zinc-500">Keep it kind. Max one link.</div>
          <div className="flex items-center gap-3">
            {siteKey ? (
              <Turnstile siteKey={siteKey} onToken={setToken} />
            ) : (
              <span className="text-xs text-zinc-500">Add Turnstile key</span>
            )}
            <button
              onClick={submit}
              disabled={busy || !body.trim() || !token}
              className="glass-button px-6 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white disabled:opacity-40"
            >
              {busy ? 'Posting…' : 'Post'}
            </button>
          </div>
        </div>
        {error && <div className="text-xs text-red-400 mt-2">{error}</div>}
      </div>

      <div className="border-t border-white/10">
        {comments.length === 0 && (
          <div className="p-6 text-sm text-zinc-500 text-center">
            Be the first to add a thought.
          </div>
        )}
        {comments.map((c) => (
          <div
            key={c.id}
            className="p-6 border-b border-white/8 last:border-0 hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-zinc-200 text-[15px] leading-relaxed flex-1">{c.body}</p>
              <time className="text-xs text-zinc-500 whitespace-nowrap">
                {new Date(c.created_at).toLocaleDateString()}
              </time>
            </div>
            {c.display_name && (
              <div className="text-xs text-zinc-500 mt-2">— {c.display_name}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
