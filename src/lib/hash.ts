import { createHash } from 'crypto';

export function quoteIdFromText(text: string): string {
  // normalize whitespace, trim, then sha256 → 12 hex chars
  const normalized = text.replace(/\s+/g, ' ').trim();
  return createHash('sha256').update(normalized, 'utf8').digest('hex').slice(0, 12);
}
