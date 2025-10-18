import type { Quote } from '@/types/quote';

interface QuoteCardProps {
  quote: Quote;
}

export function QuoteCard({ quote }: QuoteCardProps) {
  return (
    <div className="glass-card rounded-2xl p-8 md:p-12">
      <blockquote className="quote-text text-2xl md:text-4xl text-zinc-50 mb-6">
        &ldquo;{quote.quote}&rdquo;
      </blockquote>
      
      <div className="space-y-2">
        <p className="text-base md:text-lg text-zinc-400">
          — {quote.source}
        </p>
        
        {quote.translationAuthor && (
          <p className="text-sm text-zinc-500">
            Translation by {quote.translationAuthor}
            {quote.translationSource && ` (${quote.translationSource})`}
          </p>
        )}
        
        {quote.topComment && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-sm text-zinc-400 italic">
              {quote.topComment}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

