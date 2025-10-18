import { loadQuotes, pickDaily } from '@/lib/quotes';
import { DiscussionBox } from '@/components/DiscussionBox';

export default async function HomePage() {
  const quotes = await loadQuotes().catch(() => []);
  const { item } = pickDaily(quotes);

  if (!item) {
    return (
      <main className="min-h-dvh flex items-center justify-center text-zinc-300">
        <div className="text-center">
          <h1 className="text-xl mb-2">LectioToday</h1>
          <p>No quotes found. Add your CSV and run the build script.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-6 text-zinc-100">
      <div className="w-full max-w-3xl space-y-6">
        <div className="rounded-2xl bg-white/6 backdrop-blur-2xl border border-white/10 p-8 shadow-lg">
          <blockquote className="font-serif text-2xl leading-snug">
            &ldquo;{item.quote}&rdquo;
          </blockquote>
          <div className="mt-4 text-sm text-zinc-300/80">
            {item.source}
            {item.translationSource && (
              <> • <span className="opacity-80">{item.translationSource}</span></>
            )}
            {item.translationAuthor && (
              <> — <span className="opacity-70">{item.translationAuthor}</span></>
            )}
          </div>
        </div>

        {/* Discussion tied to this quote's stable id */}
        <DiscussionBox quoteId={item.id} />
      </div>
    </main>
  );
}
