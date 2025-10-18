'use client';

import { track } from '@/lib/track';

interface ShareControlsProps {
  quoteId: string;
}

export function ShareControls({ quoteId }: ShareControlsProps) {
  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    track('copy_link', quoteId);
    alert('Link copied');
  };

  const handleShare = async () => {
    if ('share' in navigator && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
        track('share', quoteId);
      } catch {
        // User cancelled or error occurred
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      track('copy_link', quoteId);
      alert('Link copied');
    }
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        aria-label="Copy link"
        onClick={handleCopyLink}
        className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 hover:bg-white/[0.12] transition-colors text-sm text-zinc-200"
      >
        Copy link
      </button>
      <button
        aria-label="Share"
        onClick={handleShare}
        className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 hover:bg-white/[0.12] transition-colors text-sm text-zinc-200"
      >
        Share
      </button>
      <a
        href={`/og/${quoteId}.png`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-zinc-400 hover:text-zinc-300 underline transition-colors"
      >
        OG preview
      </a>
    </div>
  );
}

