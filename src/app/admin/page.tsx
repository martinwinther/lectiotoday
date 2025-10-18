'use client';
import { useState } from 'react';

// Note: Report interface removed as reports functionality requires Cloudflare Functions

export default function AdminPage() {
  const [token, setToken] = useState<string>('');
  // Note: reports functionality removed as it requires Cloudflare Functions
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
      // Since we can't use API routes, we'll use a different approach
      // For now, show a message that the admin panel is not yet functional
      setError('Admin functionality requires Cloudflare Functions which are not available with OpenNext. This is a known limitation.');
    } catch {
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }

  // Note: setHidden function removed as it's not used in this simplified admin panel

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-zinc-100">
      <h1 className="text-2xl font-semibold mb-6">Admin</h1>
      
      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
        <h2 className="text-yellow-200 font-semibold mb-2">⚠️ Admin Panel Limitation</h2>
        <p className="text-yellow-100 text-sm">
          The admin panel requires Cloudflare Functions, but OpenNext (used for Cloudflare Pages deployment) 
          doesn&apos;t support Cloudflare Functions. This is a known limitation.
        </p>
        <p className="text-yellow-100 text-sm mt-2">
          <strong>Workaround:</strong> You can still manage the database directly using Wrangler commands.
        </p>
      </div>

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
          className="px-4 py-2 rounded bg-white/10 border border-white/10"
        >
          {loading ? 'Loading…' : 'Load reports'}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <h3 className="text-blue-200 font-semibold mb-2">Database Management Commands</h3>
        <div className="text-blue-100 text-sm space-y-2">
          <p><strong>View reports:</strong></p>
          <code className="block bg-black/40 p-2 rounded text-xs">
            npx wrangler d1 execute LectioTodayDB --remote --command &quot;SELECT * FROM reports ORDER BY created_at DESC LIMIT 10&quot;
          </code>
          
          <p><strong>Hide a comment:</strong></p>
          <code className="block bg-black/40 p-2 rounded text-xs">
            npx wrangler d1 execute LectioTodayDB --remote --command &quot;UPDATE comments SET hidden = 1 WHERE id = &apos;COMMENT_ID&apos;&quot;
          </code>
          
          <p><strong>Unhide a comment:</strong></p>
          <code className="block bg-black/40 p-2 rounded text-xs">
            npx wrangler d1 execute LectioTodayDB --remote --command &quot;UPDATE comments SET hidden = 0 WHERE id = &apos;COMMENT_ID&apos;&quot;
          </code>
          
          <p><strong>View hidden comments:</strong></p>
          <code className="block bg-black/40 p-2 rounded text-xs">
            npx wrangler d1 execute LectioTodayDB --remote --command &quot;SELECT * FROM comments WHERE hidden = 1&quot;
          </code>
        </div>
      </div>
    </main>
  );
}