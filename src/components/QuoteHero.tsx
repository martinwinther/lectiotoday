import ShareButton from "@/components/ShareButton";

export default function QuoteHero({
  quote,
  source,
  translationSource,
  translationAuthor,
}: {
  quote: string;
  source?: string;
  translationSource?: string;
  translationAuthor?: string;
}) {
  return (
    <section
      className="
        min-h-[65svh] md:min-h-[72svh]
        flex items-center justify-center
        px-6 md:px-8
        pt-10 md:pt-12
      "
    >
      <div
        className="
          relative
          w-full max-w-3xl
          rounded-3xl
          bg-white/6 backdrop-blur-2xl
          border border-white/10
          shadow-[0_10px_40px_-10px_rgba(0,0,0,0.45)]
          px-8 md:px-14
          py-14 md:py-24
        "
      >
        {/* Share: macOS-style, unobtrusive */}
        <div className="absolute right-4 top-4 md:right-6 md:top-6">
          <ShareButton
            quote={quote}
            source={source}
            url={process.env.NEXT_PUBLIC_BASE_URL}
            compact
          />
        </div>

        <blockquote className="font-serif text-balance text-3xl md:text-4xl leading-tight text-center">
          &ldquo;{quote}&rdquo;
        </blockquote>

        {(source || translationSource || translationAuthor) && (
          <div className="mt-6 text-sm text-zinc-300/85 text-center">
            <div>
              {source}
              {translationSource && (
                <> • <span className="opacity-80">{translationSource}</span></>
              )}
            </div>
            {translationAuthor && (
              <div className="text-xs opacity-70 mt-1">
                Translation by {translationAuthor}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

