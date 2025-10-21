'use client';
import { useEffect, useRef } from 'react';

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
  /** appearance: 'always' | 'execute' | 'interaction-only' */
  appearance?: 'always' | 'execute' | 'interaction-only';
  /** size: 'normal' | 'compact' | 'flexible' */
  size?: 'normal' | 'compact' | 'flexible';
  /** theme: 'auto' | 'dark' | 'light' */
  theme?: 'auto' | 'dark' | 'light';
};

export function Turnstile({
  siteKey,
  onToken,
  onReady,
  appearance = 'always', // show the widget all the time
  size,
  theme = 'auto',
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const lastKeyRef = useRef<string>('');

  function computeSize(): 'normal' | 'compact' | 'flexible' {
    // Default to a visible, standard size. Caller can override.
    if (size) return size;
    return 'normal';
  }

  const renderWidget = () => {
    if (!window.turnstile || !hostRef.current) return;
    // Re-render clean: wipe host and render with current props
    hostRef.current.innerHTML = '';
    widgetIdRef.current = window.turnstile.render(hostRef.current, {
      sitekey: siteKey,
      callback: (t: string) => onToken(t),
      'expired-callback': () => onToken(''),
      'error-callback': () => onToken(''),
      appearance,             // always visible now
      size: computeSize(),    // default 'normal' unless overridden
      theme,                  // auto matches light/dark
    });

    onReady?.({
      reset: () => {
        try {
          if (widgetIdRef.current && window.turnstile) {
            window.turnstile.reset(widgetIdRef.current);
          }
        } catch {
          // ignore reset errors
        }
      },
    });
  };

  // Load Turnstile script once, then render
  useEffect(() => {
    const SCRIPT_ID = 'cf-turnstile-script';
    const ensureScript = () => {
      if (window.turnstile) {
        renderWidget();
        return;
      }
      if (!document.getElementById(SCRIPT_ID)) {
        const s = document.createElement('script');
        s.id = SCRIPT_ID;
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
        s.async = true; s.defer = true;
        s.onload = () => renderWidget();
        document.head.appendChild(s);
      } else {
        // Script exists but may not be loaded yet
        const el = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
        if (el && !window.turnstile) {
          el.addEventListener('load', () => renderWidget(), { once: true });
        }
      }
    };

    ensureScript();

    // cleanup on unmount
    return () => {
      if (hostRef.current) hostRef.current.innerHTML = '';
      widgetIdRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-render if key props change (siteKey/appearance/size/theme)
  useEffect(() => {
    const key = [siteKey, appearance, computeSize(), theme].join('|');
    if (key !== lastKeyRef.current) {
      lastKeyRef.current = key;
      if (window.turnstile) renderWidget();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey, appearance, size, theme]);

  return (
    // Visible host; let Turnstile fully render inside. The min height keeps layout stable.
    <div ref={hostRef} className="min-h-10" />
  );
}
