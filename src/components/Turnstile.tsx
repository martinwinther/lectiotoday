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

interface TurnstileProps {
  siteKey: string;
  onToken: (t: string) => void;
  onReady?: (api: { reset: () => void }) => void;
}

export function Turnstile({ siteKey, onToken, onReady }: TurnstileProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    function renderWidget() {
      if (!window.turnstile || !hostRef.current) return;
      // clear any previous child to avoid double-render
      hostRef.current.innerHTML = '';
      widgetIdRef.current = window.turnstile.render(hostRef.current, {
        sitekey: siteKey,
        callback: (t: string) => onToken(t),
        'expired-callback': () => onToken(''),
        'error-callback': () => onToken(''),
      });
      // expose reset method to parent
      onReady?.({
        reset: () => {
          try {
            if (widgetIdRef.current && window.turnstile) {
              window.turnstile.reset(widgetIdRef.current);
            } else {
              // fallback: re-render
              renderWidget();
            }
          } catch {
            renderWidget();
          }
        },
      });
    }

    const ensureScriptAndRender = () => {
      if (window.turnstile) {
        renderWidget();
        return;
      }
      const s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      s.async = true;
      s.defer = true;
      s.onload = () => renderWidget();
      document.head.appendChild(s);
    };
    ensureScriptAndRender();
  }, [siteKey, onToken, onReady]);

  return <div ref={hostRef} />;
}

