'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove?: (id?: string) => void;
    };
  }
}

type Props = {
  siteKey: string;
  onToken: (token: string) => void;
  shouldRender?: boolean;
  appearance?: 'interaction-only' | 'always';
};

export function HiddenTurnstile({ 
  siteKey, 
  onToken, 
  shouldRender = true,
  appearance = 'interaction-only' 
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [widgetId, setWidgetId] = useState<string | null>(null);

  useEffect(() => {
    if (!shouldRender || !mountRef.current) return;

    const mount = mountRef.current;

    function renderWidget() {
      if (!window.turnstile || !mount) return;

      try {
        const id = window.turnstile.render(mount, {
          sitekey: siteKey,
          appearance,
          size: 'normal',
          callback: onToken,
          'expired-callback': () => onToken(''),
          'error-callback': () => onToken(''),
        });
        setWidgetId(id);
      } catch (error) {
        console.warn('Turnstile render failed:', error);
      }
    }

    if (window.turnstile) {
      renderWidget();
    } else {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      script.onload = renderWidget;
      script.onerror = () => {
        console.warn('Failed to load Turnstile script');
      };
      document.head.appendChild(script);
    }

    return () => {
      if (widgetId && window.turnstile) {
        try {
          if (window.turnstile.remove) {
            window.turnstile.remove(widgetId);
          } else {
            window.turnstile.reset(widgetId);
          }
        } catch {}
      }
    };
  }, [shouldRender, siteKey, appearance, onToken, widgetId]);

  if (!shouldRender) return null;

  return (
    <div 
      ref={mountRef}
      style={{
        position: 'fixed',
        top: '-200px',
        left: '0px',
        width: '300px',
        height: '65px',
        visibility: 'hidden',
        pointerEvents: 'none',
        zIndex: '-9999',
      }}
    />
  );
}
