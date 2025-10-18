'use client';

import { useEffect } from 'react';
import { track } from '@/lib/track';

export function QuotePageClient({ quoteId }: { quoteId: string }) {
  useEffect(() => {
    track('view_quote', quoteId);
  }, [quoteId]);

  return null;
}

