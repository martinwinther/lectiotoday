'use client';
import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [token, setToken] = useState<string>('');
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/reports', {
      headers: { authorization: `Bearer ${token}` },
    });
    setLoading(false);
    if (!res.ok) return alert('Auth failed or error');
    const j = await res.json();
    setReports(j.reports || []);
  }

  async function setHidden(commentId: string, hide: boolean) {
    const res = await fetch('/api/admin/comments/hide', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ commentId, hide }),
    });
    if (!res.ok) return alert('Failed');
    await load();
  }

  useEffect(() => {
    /* no auto load */
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-zinc-100">
      <h1 className="text-2xl font-semibold mb-6">Admin</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="password"
          placeholder="Admin token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="rounded bg-zinc-900/40 border border-white/10 px-3 py-2 w-80"
        />
        <button
          onClick={load}
          className="px-4 py-2 rounded bg-white/10 border border-white/10"
        >
          {loading ? 'Loading…' : 'Load reports'}
        </button>
      </div>
      <ul className="space-y-3">
        {reports.map((r: any) => (
          <li
            key={r.id}
            className="rounded-2xl p-4 bg-white/6 border border-white/10"
          >
            <div className="text-xs text-zinc-400 mb-1">
              {new Date(r.created_at).toLocaleString()} • {r.reason}
            </div>
            <div className="text-sm text-zinc-300 mb-2">{r.details || '—'}</div>
            <div className="text-[15px] text-zinc-100 mb-2">{r.body}</div>
            <div className="text-xs text-zinc-500 mb-2">
              Quote: {r.quote_id} • Comment: {r.comment_id}
            </div>
            <div className="flex gap-2">
              <a
                className="underline text-xs"
                href={`/q/${r.quote_id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open quote
              </a>
              {r.hidden ? (
                <button
                  onClick={() => setHidden(r.comment_id, false)}
                  className="text-xs px-3 py-1 rounded bg-white/10 border border-white/10"
                >
                  Unhide
                </button>
              ) : (
                <button
                  onClick={() => setHidden(r.comment_id, true)}
                  className="text-xs px-3 py-1 rounded bg-white/10 border border-white/10"
                >
                  Hide
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

