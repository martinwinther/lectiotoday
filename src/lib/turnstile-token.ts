'use client';

type Cache = { token: string; exp: number }; // epoch ms

const KEY = 'lt_turnstile';
const LEEWAY_MS = 90_000; // consider token stale ~90s after issue
const MAX_AGE_MS = 300_000; // safety cap, tokens usually expire earlier

let mem: Cache | null = null;
const waiters: Array<(t: string) => void> = [];
let widgetId: string | null = null;
let rendered = false;

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
  }
}

function now() {
  return Date.now();
}

function read(): Cache | null {
  if (mem && mem.exp > now()) return mem;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Cache;
    if (c && c.exp > now()) {
      mem = c;
      return c;
    }
  } catch {}
  return null;
}

function save(token: string) {
  const c: Cache = { token, exp: Math.min(now() + MAX_AGE_MS, now() + LEEWAY_MS) };
  mem = c;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(c));
  } catch {}
}

function clear() {
  mem = null;
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
}

export function initTurnstile(
  siteKey: string,
  appearance: 'interaction-only' | 'always' = 'interaction-only'
) {
  if (rendered) return;
  rendered = true;

  const mount = document.createElement('div');
  // position off-screen but still accessible to iframes
  mount.style.position = 'fixed';
  mount.style.top = '-1000px';
  mount.style.left = '-1000px';
  mount.style.width = '300px';
  mount.style.height = '65px';
  mount.style.visibility = 'hidden';
  mount.style.pointerEvents = 'none';
  document.body.appendChild(mount);

  function onReady() {
    try {
      widgetId = window.turnstile!.render(mount, {
        sitekey: siteKey,
        appearance,
        size: 'normal',
        callback: (token: string) => {
          save(token);
          // resolve any pending callers
          for (const w of waiters.splice(0)) w(token);
        },
        'expired-callback': () => {
          clear();
        },
        'error-callback': () => {
          clear();
        },
      });
    } catch (error) {
      console.warn('Turnstile render failed:', error);
      clear();
    }
  }

  // load script once
  if (window.turnstile) {
    onReady();
  } else {
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    s.async = true;
    s.defer = true;
    s.onload = onReady;
    s.onerror = () => {
      console.warn('Failed to load Turnstile script');
      clear();
    };
    document.head.appendChild(s);
  }
}

export async function ensureToken(siteKey: string): Promise<string> {
  // return cached if still fresh
  const c = read();
  if (c) return c.token;

  // render (once) then wait for callback to give us a token
  initTurnstile(siteKey, 'interaction-only');

  return new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Turnstile token timeout'));
    }, 30000); // 30 second timeout

    waiters.push((token) => {
      clearTimeout(timeout);
      resolve(token);
    });

    // if widget already exists, ask for a fresh token
    try {
      if (widgetId && window.turnstile) {
        window.turnstile.reset(widgetId);
      }
    } catch {
      clearTimeout(timeout);
      reject(new Error('Failed to reset Turnstile widget'));
    }
  });
}

export function invalidateToken() {
  clear();
  try {
    if (widgetId && window.turnstile) window.turnstile.reset(widgetId);
  } catch {}
}

// for testing
export function _peek() {
  return read();
}

