'use client';
import { useState } from 'react';

interface Report {
  id: string;
  comment_id: string;
  quote_id: string;
  reason: string;
  details: string | null;
  created_at: number;
  body: string;
  display_name: string | null;
  hidden: number;
}

export default function AdminPage() {
  const [token, setToken] = useState<string>('');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadReports() {
    if (!token) {
      setError('Please enter admin token');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/reports', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          setError('Invalid admin token');
        } else {
          setError('Failed to load reports');
        }
        return;
      }

      const data = (await res.json()) as { reports: Report[] };
      setReports(data.reports || []);
    } catch {
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }

  async function setHidden(commentId: string, hide: boolean) {
    if (!token) return;

    try {
      const res = await fetch('/api/admin/comments/hide', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commentId, hide }),
      });

      if (res.ok) {
        setReports((prev) =>
          prev.map((r) => (r.comment_id === commentId ? { ...r, hidden: hide ? 1 : 0 } : r))
        );
      } else {
        setError('Failed to update comment');
      }
    } catch {
      setError('Failed to update comment');
    }
  }

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
          onClick={loadReports}
          className="px-4 py-2 rounded bg-white/10 border border-white/10 hover:bg-white/20 transition-colors"
          disabled={loading}
        >
          {loading ? 'Loading…' : 'Load reports'}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      {reports.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Reports ({reports.length})</h2>
          {reports.map((r) => (
            <div key={r.id} className="bg-zinc-900/40 border border-white/10 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-xs text-white/40">
                    {new Date(r.created_at).toLocaleString()}
                  </span>
                  <span className="ml-2 px-2 py-1 rounded bg-red-900/40 text-red-200 text-xs">
                    {r.reason}
                  </span>
                  {r.hidden === 1 && (
                    <span className="ml-2 px-2 py-1 rounded bg-yellow-900/40 text-yellow-200 text-xs">
                      Hidden
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {r.hidden === 0 ? (
                    <button
                      onClick={() => setHidden(r.comment_id, true)}
                      className="px-3 py-1 rounded bg-red-900/40 text-red-200 text-xs hover:bg-red-900/60 transition-colors"
                    >
                      Hide
                    </button>
                  ) : (
                    <button
                      onClick={() => setHidden(r.comment_id, false)}
                      className="px-3 py-1 rounded bg-green-900/40 text-green-200 text-xs hover:bg-green-900/60 transition-colors"
                    >
                      Unhide
                    </button>
                  )}
                </div>
              </div>
              <p className="text-white/90 mb-2">&quot;{r.body}&quot;</p>
              {r.display_name && (
                <p className="text-xs text-white/50">— {r.display_name}</p>
              )}
              {r.details && (
                <p className="text-sm text-white/60 mt-2">
                  <strong>Details:</strong> {r.details}
                </p>
              )}
              <p className="text-xs text-white/40 mt-2">
                Comment ID: {r.comment_id} · Quote ID: {r.quote_id}
              </p>
            </div>
          ))}
        </div>
      )}

      {reports.length === 0 && !loading && !error && (
        <div className="text-center text-white/50 py-10">
          Enter your admin token and click Load reports to view.
        </div>
      )}
    </main>
  );
}