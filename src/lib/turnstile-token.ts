'use client';

type Cache = { token: string; exp: number };

const KEY = 'lt_turnstile';
const LEEWAY_MS = 90_000; // 90 seconds
const MAX_AGE_MS = 300_000; // 5 minutes

let mem: Cache | null = null;

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

export function getCachedToken(): string | null {
  const c = read();
  return c ? c.token : null;
}

export function saveToken(token: string) {
  save(token);
}

export function clearToken() {
  mem = null;
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
}

