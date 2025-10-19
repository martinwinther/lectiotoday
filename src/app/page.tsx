import { pickDaily } from '@/lib/quotes';
import QuoteHero from '@/components/QuoteHero';
import { DiscussionBox } from '@/components/DiscussionBox';
import quotesData from '../../public/quotes.json';
import type { Quote } from '@/types/quote';

const quotes = quotesData as Quote[];

export default async function HomePage() {
  const { item } = pickDaily(quotes);

  if (!item) {
    return (
      <main className="min-h-dvh grid place-items-center text-zinc-300">
        <p>No quotes found. Add your CSV and run the build.</p>
      </main>
    );
  }

  return (
    <main>
      <QuoteHero
        quote={item.quote}
        source={item.source}
        translationSource={item.translationSource}
        translationAuthor={item.translationAuthor}
      />

      {/* Discussion is intentionally below, with breathing room */}
      <section className="px-6 md:px-8 pb-16 md:pb-24">
        <div className="mx-auto max-w-3xl">
          <DiscussionBox quoteId={item.id} />
        </div>
      </section>
    </main>
  );
}
