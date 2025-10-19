"use client";
import Link from "next/link";

/**
 * Subtle footer that sits at the bottom of the page content.
 * The Privacy link is right-aligned and very low visual weight.
 */
export default function SiteFooter() {
  return (
    <footer
      className="
        border-t border-white/10
        bg-transparent
        px-6 md:px-8
        py-4
      "
      aria-label="Site footer"
    >
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex items-center justify-end">
          <Link
            href="/privacy"
            aria-label="Privacy Policy"
            className="
              inline-flex items-center
              rounded-full
              border border-white/10
              bg-white/5
              backdrop-blur
              px-3 py-1.5
              text-[11px] leading-none
              text-zinc-300/70
              hover:bg-white/8 hover:text-zinc-100
              focus:outline-none focus:ring-2 focus:ring-white/20
              transition
            "
          >
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}

