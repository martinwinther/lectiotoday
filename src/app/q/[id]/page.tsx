import { notFound } from 'next/navigation';
import Link from 'next/link';
import { QuoteCard } from '@/components/QuoteCard';
import { DiscussionBox } from '@/components/DiscussionBox';
import { QuoteNavigation } from '@/components/QuoteNavigation';
import { ShareControls } from '@/components/ShareControls';
import { QuotePageClient } from './QuotePageClient';
import type { Quote } from '@/types/quote';
import quotesData from '../../../../public/quotes.json';

const quotes = quotesData as Quote[];

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const q = quotes.find((x) => x.id === id);
  if (!q) {
    return {
      title: 'LectioToday',
      description: 'Daily reflections',
    };
  }

  const title = q.quote.length > 80 ? q.quote.slice(0, 77) + '…' : q.quote;
  const description = `${q.quote} — ${q.source}`.slice(0, 200);

  return {
    title: `${title} — LectioToday`,
    description,
    openGraph: {
      images: [`/og/${id}.png`],
    },
    alternates: {
      canonical: `/q/${id}`,
    },
  };
}

export default async function QuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const currentQuote = quotes.find((q) => q.id === id);

  if (!currentQuote) {
    notFound();
  }

  return (
    <>
      <QuotePageClient quoteId={id} />
      <header className="glass-header sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="inline-block">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-100 hover:text-white transition-colors">
              LectioToday
            </h1>
          </Link>

          <QuoteNavigation quotes={quotes} currentId={id} />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <div className="space-y-8">
          <QuoteCard quote={currentQuote} />

          <ShareControls quoteId={id} />

          <DiscussionBox quoteId={currentQuote.id} />
        </div>
      </main>
    </>
  );
}
