import type { MetadataRoute } from 'next';
import quotesData from '../../public/quotes.json';
import type { Quote } from '@/types/quote';

const quotes = quotesData as Quote[];

export default function sitemap(): MetadataRoute.Sitemap {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL || 'https://lectiotoday.pages.dev';

  const quoteEntries = quotes.slice(0, 5000).map((q) => ({
    url: `${base}/q/${q.id}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: `${base}/`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${base}/archive`,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    ...quoteEntries,
  ];
}

