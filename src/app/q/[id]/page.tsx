'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { QuoteCard } from '@/components/QuoteCard';
import { DiscussionBox } from '@/components/DiscussionBox';
import type { Quote } from '@/types/quote';
import quotesData from '../../../../public/quotes.json';

const quotes = quotesData as Quote[];

export default function QuotePage({ params }: { params: { id: string } }) {
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  useEffect(() => {
    const index = quotes.findIndex((q) => q.id === params.id);
    if (index === -1) {
      notFound();
    }
    setCurrentIndex(index);
  }, [params.id]);

  if (currentIndex === -1) {
    return null;
  }

  const currentQuote = quotes[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < quotes.length - 1;

  const handlePrev = () => {
    if (hasPrev) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <>
      <header className="glass-header sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="inline-block">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-100 hover:text-white transition-colors">
              LectioToday
            </h1>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={!hasPrev}
              className="glass-button px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white"
              aria-label="Previous quote"
            >
              ← Prev
            </button>
            <button
              onClick={handleNext}
              disabled={!hasNext}
              className="glass-button px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white"
              aria-label="Next quote"
            >
              Next →
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <div className="space-y-8">
          <QuoteCard quote={currentQuote} />
          <DiscussionBox />
        </div>
      </main>
    </>
  );
}
