'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Fuse from 'fuse.js';
import { loadQuotes } from '@/lib/quotes';
import type { Quote } from '@/types/quote';
import { Header } from '@/components/Header';

export default function ArchivePage() {
  const [all, setAll] = useState<Quote[]>([]);
  const [query, setQuery] = useState('');
  const [sourceQuery, setSourceQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 24;
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadQuotes()
      .then(setAll)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
  }, [query, sourceQuery]);

  const fuse = useMemo(
    () =>
      new Fuse(all, {
        keys: ['quote', 'source'],
        threshold: 0.35,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [all]
  );

  const filtered = useMemo(() => {
    let arr = all;
    if (query.trim()) {
      arr = fuse.search(query.trim()).map((r) => r.item);
    }
    if (sourceQuery.trim()) {
      const s = sourceQuery.trim().toLowerCase();
      arr = arr.filter((x) => (x.source || '').toLowerCase().includes(s));
    }
    return arr;
  }, [all, fuse, query, sourceQuery]);

  const slice = filtered.slice(0, page * pageSize);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setPage((p) => (p * pageSize < filtered.length ? p + 1 : p));
          }
        });
      },
      { rootMargin: '600px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [filtered.length]);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10 text-zinc-100">
        <h1 className="text-2xl font-semibold mb-6">Archive</h1>
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <input
            aria-label="Search quotes"
            className="flex-1 rounded-xl bg-zinc-900/40 border border-white/10 px-4 py-2 outline-none focus:border-white/20 transition-colors"
            placeholder="Search quotes or sources…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <input
            aria-label="Filter by source"
            className="md:w-64 rounded-xl bg-zinc-900/40 border border-white/10 px-4 py-2 outline-none focus:border-white/20 transition-colors"
            placeholder="Filter source…"
            value={sourceQuery}
            onChange={(e) => setSourceQuery(e.target.value)}
          />
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {slice.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl p-4 bg-white/6 border border-white/10 hover:bg-white/[0.08] transition-colors"
            >
              <Link href={`/q/${item.id}`} className="block">
                <div className="text-sm text-zinc-300/90 mb-2 font-medium">
                  {item.source}
                </div>
                <div className="font-serif text-[17px] leading-snug line-clamp-5">
                  {item.quote}
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {slice.length === 0 && all.length > 0 && (
          <p className="text-center text-zinc-400 py-12">
            No quotes found matching your search.
          </p>
        )}

        <div ref={sentinelRef} className="h-12" />
        <p className="mt-6 text-sm text-zinc-400">
          {slice.length} / {filtered.length} shown
        </p>
      </main>
    </>
  );
}

