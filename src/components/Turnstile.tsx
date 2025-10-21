'use client';
import { useCallback, useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
  }
}

type Props = {
  siteKey: string;
  onToken: (t: string) => void;
  onReady?: (api: { reset: () => void }) => void;
  /** appearance: 'always' | 'execute' | 'interaction-only' (default) */
  appearance?: 'always' | 'execute' | 'interaction-only';
  /** size: 'normal' | 'compact' | 'flexible' (auto-chosen if not provided) */
  size?: 'normal' | 'compact' | 'flexible';
  /** theme: 'auto' | 'dark' | 'light' */
  theme?: 'auto' | 'dark' | 'light';
};

export function Turnstile({
  siteKey,
  onToken,
  onReady,
  appearance = 'interaction-only',
  size,
  theme = 'auto',
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  const renderWidget = useCallback(() => {
    function currentSize(): 'normal' | 'compact' | 'flexible' {
      if (size) return size;
      // Compact on narrow screens, flexible otherwise
      return typeof window !== 'undefined' && window.matchMedia('(max-width: 480px)').matches
        ? 'compact'
        : 'flexible';
    }

    if (!window.turnstile || !hostRef.current) return;
    hostRef.current.innerHTML = '';
    widgetIdRef.current = window.turnstile.render(hostRef.current, {
      sitekey: siteKey,
      callback: (t: string) => onToken(t),
      'expired-callback': () => onToken(''),
      'error-callback': () => onToken(''),
      appearance,              // only show if a challenge is required
      size: currentSize(),     // compact on mobile, flexible otherwise
      theme,                   // auto matches light/dark
    });
    onReady?.({
      reset: () => {
        try {
          if (widgetIdRef.current && window.turnstile) {
            window.turnstile.reset(widgetIdRef.current);
          } else {
            renderWidget();
          }
        } catch {
          renderWidget();
        }
      },
    });
  }, [siteKey, onToken, onReady, appearance, theme, size]);

  useEffect(() => {
    const ensureScriptAndRender = () => {
      if (window.turnstile) return renderWidget();
      const s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      s.async = true; s.defer = true;
      s.onload = renderWidget;
      document.head.appendChild(s);
    };
    ensureScriptAndRender();
  }, [renderWidget]);

  return <div ref={hostRef} className="min-h-10" />; // keeps layout stable
}
