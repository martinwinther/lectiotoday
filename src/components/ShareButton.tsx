"use client";
import { useState } from "react";

// Minimal SF Symbols-like "square.and.arrow.up" (macOS share) icon
function MacShareIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path fill="currentColor" d="M12 3a1 1 0 0 1 1 1v6.586l1.293-1.293a1 1 0 1 1 1.414 1.414l-3.004 3.004a1 1 0 0 1-1.414 0L8.285 10.707a1 1 0 0 1 1.414-1.414L11 10.586V4a1 1 0 0 1 1-1z"/>
      <path fill="currentColor" d="M6 9a1 1 0 0 0-1 1v7c0 1.657 1.343 3 3 3h8c1.657 0 3-1.343 3-3v-7a1 1 0 1 0-2 0v7c0 .552-.448 1-1 1H8c-.552 0-1-.448-1-1v-7a1 1 0 0 0-1-1z"/>
    </svg>
  );
}

export default function ShareButton({
  quote,
  source,
  url,
  compact = false,
}: {
  quote: string;
  source?: string;
  url?: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const siteUrl = url || (typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_BASE_URL || "https://lectiotoday.pages.dev"));
  const text = `"${quote}"` + (source ? ` — ${source}` : "");
  const payload = `${text}\n${siteUrl}`;

  async function track(ev: string) {
    try {
      await fetch("/api/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ event: ev }),
      });
    } catch {}
  }

  async function onShare() {
    await track("share_click");
    if (navigator.share) {
      try {
        await navigator.share({ title: "LectioToday", text, url: siteUrl });
        return;
      } catch {
        // fall through to copy on dismiss/denied
      }
    }
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
      await track("share_copied");
    } catch {
      // As a last resort, open mail client with prefilled body
      window.location.href = `mailto:?subject=${encodeURIComponent("A quiet daily reflection")}&body=${encodeURIComponent(payload)}`;
    }
  }

  return (
    <div className="relative">
      <button
        onClick={onShare}
        aria-label="Share"
        className={[
          "inline-flex items-center justify-center",
          "rounded-full border border-white/10",
          "bg-white/6 hover:bg-white/10",
          "backdrop-blur px-2.5 py-2",
          "text-zinc-300/80 hover:text-zinc-100",
          "transition shadow-[0_4px_18px_rgba(0,0,0,0.25)]",
          compact ? "text-[11px]" : "text-xs"
        ].join(" ")}
      >
        <MacShareIcon className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
      </button>

      {copied && (
        <div
          role="status"
          className="pointer-events-none absolute -top-8 right-0 rounded-md bg-white/10 border border-white/15 px-2 py-1 text-[10px] text-zinc-100 shadow"
        >
          Copied
        </div>
      )}
    </div>
  );
}

