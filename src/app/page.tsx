import { Header } from '@/components/Header';
import { QuoteCard } from '@/components/QuoteCard';
import { DiscussionBox } from '@/components/DiscussionBox';
import type { Quote } from '@/types/quote';
import quotes from '../../public/quotes.json';

function getDailyQuoteIndex(): number {
  const today = new Date();
  const utcDate = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const daysSinceEpoch = Math.floor(utcDate / (1000 * 60 * 60 * 24));
  return daysSinceEpoch % quotes.length;
}

export default function Home() {
  const dailyQuoteIndex = getDailyQuoteIndex();
  const dailyQuote = quotes[dailyQuoteIndex] as Quote;

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <div className="space-y-8">
          <QuoteCard quote={dailyQuote} />
          <DiscussionBox />
        </div>
      </main>
    </>
  );
}
