import { Header } from '@/components/Header';
import { QuoteCard } from '@/components/QuoteCard';
import { DiscussionBox } from '@/components/DiscussionBox';
import { pickDaily } from '@/lib/quotes';
import quotes from '../../public/quotes.json';

export default function Home() {
  const { item: dailyQuote } = pickDaily(quotes);

  if (!dailyQuote) {
    return (
      <>
        <Header />
        <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
          <p className="text-zinc-400 text-center">No quotes available.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <div className="space-y-8">
          <QuoteCard quote={dailyQuote} />
          <DiscussionBox quoteId={dailyQuote.id} />
        </div>
      </main>
    </>
  );
}
