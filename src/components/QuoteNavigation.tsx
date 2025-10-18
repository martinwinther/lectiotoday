'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Quote } from '@/types/quote';

interface QuoteNavigationProps {
  quotes: Quote[];
  currentId: string;
}

export function QuoteNavigation({ quotes, currentId }: QuoteNavigationProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState<number>(
    quotes.findIndex((q) => q.id === currentId)
  );

  useEffect(() => {
    const index = quotes.findIndex((q) => q.id === currentId);
    setCurrentIndex(index);
  }, [currentId, quotes]);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < quotes.length - 1;

  const handlePrev = () => {
    if (hasPrev) {
      const prevId = quotes[currentIndex - 1].id;
      router.push(`/q/${prevId}`);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      const nextId = quotes[currentIndex + 1].id;
      router.push(`/q/${nextId}`);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePrev}
        disabled={!hasPrev}
        className="glass-button px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous quote"
      >
        ← Prev
      </button>
      <button
        onClick={handleNext}
        disabled={!hasNext}
        className="glass-button px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next quote"
      >
        Next →
      </button>
    </div>
  );
}

