'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';

type Scope = 'today' | 'reported' | 'all' | 'hidden' | 'deleted';

type Item = {
  id: string;
  quote_id: string;
  body: string;
  display_name?: string;
  created_at: number;
  hidden: number;
  deleted_at?: number | null;
  reports_count: number;
  quote_preview?: string | null;
  quote_source?: string | null;
};

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [scope, setScope] = useState<Scope>('today');
  const [q, setQ] = useState('');
  const [quoteId, setQuoteId] = useState('');
  const [since, setSince] = useState<string>('');
  const [until, setUntil] = useState<string>('');
  const [items, setItems] = useState<Item[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  const load = useCallback(async (reset = true) => {
    if (!token) return alert('Enter admin token');
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('scope', scope);
      if (q) params.set('q', q);
      if (quoteId) params.set('quoteId', quoteId);
      if (since) params.set('since', String(new Date(since).getTime()));
      if (until) params.set('until', String(new Date(until).getTime()));
      if (!reset && nextCursor) params.set('cursor', nextCursor);
      const res = await fetch(`/api/admin/comments?${params.toString()}`, {
        headers: { authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setAuthenticated(false);
        const errorText = await res.text();
        console.error('Admin API error:', res.status, errorText);
        throw new Error(`Auth or server error: ${res.status} ${errorText}`);
      }
      setAuthenticated(true);
      const j = (await res.json()) as { items: Item[]; nextCursor?: string };
      setItems((prev) => (reset ? j.items : [...prev, ...j.items]));
      setNextCursor(j.nextCursor);
    } finally {
      setLoading(false);
    }
  }, [token, scope, q, quoteId, since, until, nextCursor]);

  async function action(
    commentId: string,
    a: 'hide' | 'unhide' | 'delete' | 'restore' | 'purge'
  ) {
    if (!token) return alert('Enter admin token');
    if (a === 'purge' && !confirm('Permanently delete this comment?')) return;
    const res = await fetch('/api/admin/comments/action', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: a, commentId }),
    });
    if (!res.ok) {
      setAuthenticated(false);
      const errorText = await res.text();
      console.error('Admin action error:', res.status, errorText);
      return alert(`Action failed: ${res.status} ${errorText}`);
    }
    load(true);
  }

  useEffect(() => {
    /* don't auto-load on mount */
  }, []);

  // Auto-reload when filters change (but not on initial load)
  useEffect(() => {
    if (authenticated && token) {
      const timeoutId = setTimeout(() => {
        load(true);
      }, 500); // Debounce by 500ms
      return () => clearTimeout(timeoutId);
    }
  }, [authenticated, token, scope, q, quoteId, since, until, load]);

  const groups = useMemo(() => {
    const byQ = new Map<string, Item[]>();
    for (const it of items) {
      const arr = byQ.get(it.quote_id) || [];
      arr.push(it);
      byQ.set(it.quote_id, arr);
    }
    return Array.from(byQ.entries());
  }, [items]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-zinc-100">
      <h1 className="text-2xl font-semibold mb-6">Admin Panel</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="password"
          placeholder="Admin token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="rounded bg-zinc-900/40 border border-white/10 px-3 py-2 w-80"
        />
        <button
          onClick={() => load(true)}
          className="px-4 py-2 rounded bg-white/10 border border-white/10"
        >
          {loading ? 'Loading…' : 'Load'}
        </button>
        {authenticated && nextCursor && (
          <button
            onClick={() => load(false)}
            className="px-4 py-2 rounded bg-white/10 border border-white/10"
          >
            Load more
          </button>
        )}
      </div>

      {authenticated && (
        <>
          <div className="flex gap-2 mb-4">
            {(['today', 'reported', 'all', 'hidden', 'deleted'] as Scope[]).map(
              (s) => (
                <button
                  key={s}
                  onClick={() => {
                    setScope(s);
                    setNextCursor(undefined);
                    setItems([]);
                  }}
                  className={`px-3 py-1.5 rounded border ${scope === s ? 'bg-white/15' : 'bg-white/5'} border-white/10 text-sm capitalize`}
                >
                  {s}
                </button>
              )
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <input
              placeholder="Search body/name…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load(true)}
              className="rounded bg-zinc-900/40 border border-white/10 px-3 py-2 w-64"
            />
            <input
              placeholder="Filter by quoteId…"
              value={quoteId}
              onChange={(e) => setQuoteId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load(true)}
              className="rounded bg-zinc-900/40 border border-white/10 px-3 py-2 w-64"
            />
            <input
              type="date"
              value={since}
              onChange={(e) => setSince(e.target.value)}
              className="rounded bg-zinc-900/40 border border-white/10 px-3 py-2"
            />
            <input
              type="date"
              value={until}
              onChange={(e) => setUntil(e.target.value)}
              className="rounded bg-zinc-900/40 border border-white/10 px-3 py-2"
            />
            <button
              onClick={() => load(true)}
              className="px-4 py-2 rounded bg-white/10 border border-white/10 text-sm"
            >
              Search
            </button>
          </div>

          <div className="space-y-6">
            {groups.map(([qid, list]) => (
              <section
                key={qid}
                className="rounded-2xl border border-white/10 bg-white/[0.03]"
              >
                <header className="px-4 py-3 border-b border-white/10">
                  <div className="text-sm text-zinc-300/80">
                    <span className="font-semibold">Quote:</span>{' '}
                    <span className="italic">
                      {list[0]?.quote_preview || '(unknown)'}
                    </span>{' '}
                    <span className="text-zinc-400">
                      — {list[0]?.quote_source || ''}
                    </span>
                    <span className="text-zinc-500 ml-2">(id: {qid})</span>
                  </div>
                </header>
                <ul className="divide-y divide-white/10">
                  {list.map((it) => (
                    <li
                      key={it.id}
                      className="p-4 flex items-start justify-between gap-4"
                    >
                      <div>
                        <div className="text-[15px]">{it.body}</div>
                        <div className="text-xs text-zinc-400 mt-1">
                          — {it.display_name || 'anon'} •{' '}
                          {new Date(it.created_at).toLocaleString()}
                        </div>
                        <div className="mt-1 flex gap-2">
                          {it.reports_count ? (
                            <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded">
                              reports {it.reports_count}
                            </span>
                          ) : null}
                          {it.hidden ? (
                            <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded">
                              hidden
                            </span>
                          ) : null}
                          {it.deleted_at ? (
                            <span className="text-[10px] bg-zinc-500/20 text-zinc-200 px-2 py-0.5 rounded">
                              deleted
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {it.hidden ? (
                          <button
                            onClick={() => action(it.id, 'unhide')}
                            className="text-xs px-3 py-1.5 rounded bg-white/10 border border-white/10"
                          >
                            Unhide
                          </button>
                        ) : (
                          <button
                            onClick={() => action(it.id, 'hide')}
                            className="text-xs px-3 py-1.5 rounded bg-white/10 border border-white/10"
                          >
                            Hide
                          </button>
                        )}
                        {!it.deleted_at ? (
                          <button
                            onClick={() => action(it.id, 'delete')}
                            className="text-xs px-3 py-1.5 rounded bg-white/10 border border-white/10"
                          >
                            Delete
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => action(it.id, 'restore')}
                              className="text-xs px-3 py-1.5 rounded bg-white/10 border border-white/10"
                            >
                              Restore
                            </button>
                            <button
                              onClick={() => action(it.id, 'purge')}
                              className="text-xs px-3 py-1.5 rounded bg-red-500/20 border border-red-400/30"
                            >
                              Purge
                            </button>
                          </>
                        )}
                        <a
                          href={`/q/${qid}`}
                          target="_blank"
                          className="text-xs px-3 py-1.5 rounded bg-white/5 border border-white/10 underline"
                        >
                          Open
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            {!items.length && !loading && (
              <div className="text-sm text-zinc-400">No results.</div>
            )}
          </div>
        </>
      )}

      {!authenticated && !loading && (
        <div className="text-center text-white/50 py-10">
          Enter your admin token and click Load to view the admin panel.
        </div>
      )}
    </main>
  );
}
