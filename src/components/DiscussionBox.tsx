'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchComments, postComment } from '@/lib/comments';
import { saveToken } from '@/lib/turnstile-token';
import { Turnstile } from '@/components/Turnstile';
import type { Comment } from '@/types/comment';

export function DiscussionBox({ quoteId }: { quoteId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingStart, setTypingStart] = useState<number | null>(null);
  const [reportFor, setReportFor] = useState<Comment | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string;

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const resetTurnstileRef = useRef<null | (() => void)>(null);

  const handleToken = useCallback((t: string) => {
    setToken(t);
    if (t) saveToken(t);
  }, []);

  const handleReady = useCallback((api: { reset: () => void }) => {
    resetTurnstileRef.current = api.reset;
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const r = await fetchComments(quoteId);
        setComments(r.comments || []);
      } catch {
        // ignore
      }
    }
    load();
  }, [quoteId]);

  // reset state whenever the quote changes
  useEffect(() => {
    setBody('');
    setToken('');
    setTypingStart(null);
    resetTurnstileRef.current?.();
  }, [quoteId]);

  const minTypingMs = 900; // reduced to be less strict

  async function submit() {
    if (busy) return;
    const text = body.trim();
    if (text.length < 2) {
      setError('Say a little more.');
      return;
    }

    // if no token yet, guide user instead of disabling button
    if (!token) {
      setError('Please complete the check below first.');
      return;
    }

    if (!typingStart || Date.now() - typingStart < minTypingMs) {
      setError('Take a moment to gather your thought, then post.');
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
        honeypot: '',
      });
      // success: refresh list & fully reset UI for another post
      const r = await fetchComments(quoteId);
      setComments(r.comments || []);
      setBody('');
      setTypingStart(null);
      setToken('');
      resetTurnstileRef.current?.(); // force a fresh token
      // focus back to textarea for quick second post
      requestAnimationFrame(() => textareaRef.current?.focus());
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not post.';
      setError(msg);
      // any token-related failure → get a new token
      if (
        msg.includes('bot') ||
        msg.includes('token') ||
        msg.includes('check')
      ) {
        resetTurnstileRef.current?.();
        setToken('');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="text-sm tracking-[0.18em] uppercase text-zinc-300/60">
          Conversation
        </div>
      </div>

      <div className="border-b border-white/10">
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
            <button
              onClick={() => setReportFor(c)}
              className="text-xs text-zinc-400 hover:text-zinc-200 underline mt-2"
            >
              Report
            </button>
          </div>
        ))}
      </div>

      <div className="p-6 space-y-4">
        <input
          className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all"
          placeholder="Optional display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <textarea
          ref={textareaRef}
          className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-[15px] leading-6 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent resize-none transition-all"
          placeholder="Add a thoughtful, kind comment…"
          rows={3}
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            if (!typingStart) setTypingStart(Date.now());
          }}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-[11px] text-zinc-500">Keep it kind. Max one link.</div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {siteKey ? (
              <div className="flex justify-center sm:justify-start">
                <Turnstile
                  key="turnstile-widget"
                  siteKey={siteKey}
                  onToken={handleToken}
                  onReady={handleReady}
                  appearance="interaction-only"
                  theme="dark"
                />
              </div>
            ) : (
              <span className="text-xs text-zinc-500">Add Turnstile key</span>
            )}
            <button
              onClick={submit}
              disabled={busy || body.trim().length < 2}
              className="glass-button px-6 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white disabled:opacity-40 w-full sm:w-auto"
            >
              {busy ? 'Posting…' : 'Post'}
            </button>
          </div>
        </div>
        {error && <div className="text-xs text-red-400 mt-2">{error}</div>}
      </div>

      {reportFor && (
        <ReportModal
          comment={reportFor}
          quoteId={quoteId}
          onClose={() => setReportFor(null)}
        />
      )}
    </div>
  );
}

function ReportModal({
  comment,
  quoteId,
  onClose,
}: {
  comment: Comment;
  quoteId: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState<'spam' | 'abuse' | 'offtopic' | 'other'>('spam');
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          commentId: comment.id,
          quoteId,
          reason,
          details: details.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({
          error: 'unknown',
        }))) as { error?: string };
        throw new Error(data.error || 'Failed to submit report');
      }
      onClose();
      alert('Thanks for the report.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass-card rounded-2xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">Report Comment</h3>
        <div className="text-sm text-zinc-400 mb-4 p-3 bg-black/20 rounded-lg">
          {comment.body}
        </div>

        <div className="space-y-3 mb-4">
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="radio"
              name="reason"
              checked={reason === 'spam'}
              onChange={() => setReason('spam')}
              className="text-white"
            />
            Spam
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="radio"
              name="reason"
              checked={reason === 'abuse'}
              onChange={() => setReason('abuse')}
              className="text-white"
            />
            Abuse or harassment
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="radio"
              name="reason"
              checked={reason === 'offtopic'}
              onChange={() => setReason('offtopic')}
              className="text-white"
            />
            Off-topic
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="radio"
              name="reason"
              checked={reason === 'other'}
              onChange={() => setReason('other')}
              className="text-white"
            />
            Other
          </label>
        </div>

        <textarea
          className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none mb-4"
          placeholder="Additional details (optional)"
          rows={3}
          maxLength={400}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />

        {error && <div className="text-xs text-red-400 mb-4">{error}</div>}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={busy}
            className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={busy}
            className="glass-button px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white disabled:opacity-40"
          >
            {busy ? 'Submitting…' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
}
