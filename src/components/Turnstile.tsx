'use client';
import { useEffect, useRef } from 'react';

interface TurnstileWidget {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      'error-callback': () => void;
      'expired-callback': () => void;
    }
  ) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileWidget;
  }
}

export function Turnstile({
  siteKey,
  onToken,
}: {
  siteKey: string;
  onToken: (t: string) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const load = () => {
      if (!window.turnstile || !ref.current) return;
      window.turnstile.render(ref.current, {
        sitekey: siteKey,
        callback: (t: string) => onToken(t),
        'error-callback': () => onToken(''),
        'expired-callback': () => onToken(''),
      });
    };
    if (!window.turnstile) {
      const s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      s.async = true;
      s.defer = true;
      s.onload = load;
      document.head.appendChild(s);
    } else {
      load();
    }
  }, [siteKey, onToken]);

  return <div ref={ref} />;
}

