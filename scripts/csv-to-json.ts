#!/usr/bin/env tsx
import fs from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import { quoteIdFromText } from '../src/lib/hash';

type Row = {
  Quote?: string;
  Source?: string;
  'Translation author'?: string;
  'Top comment'?: string;
};

type QuoteOut = {
  id: string;
  quote: string;
  source: string;
  translationAuthor?: string;
  topComment?: string;
};

const args = process.argv.slice(2);
const checkMode = args.includes('--check');
const inPath = args.find((a) => a.endsWith('.csv')) || 'content/quotes.csv';
const outPath = args.find((a) => a.endsWith('.json')) || 'public/quotes.json';

async function main() {
  const raw = await fs.readFile(inPath, 'utf8');
  const rows = parse(raw, { columns: true, skip_empty_lines: true }) as Row[];

  const byId = new Map<string, QuoteOut>();
  const errors: string[] = [];

  for (const [i, r] of rows.entries()) {
    const quote = (r.Quote ?? '').toString().replace(/\r/g, '').trim();
    if (!quote) {
      errors.push(`Row ${i + 2}: missing Quote`);
      continue;
    }
    if (quote.length < 5) {
      errors.push(`Row ${i + 2}: quote too short`);
      continue;
    }
    if (quote.length > 1200) {
      errors.push(`Row ${i + 2}: quote too long (>1200 chars)`);
      continue;
    }

    const id = quoteIdFromText(quote);
    const item: QuoteOut = {
      id,
      quote,
      source: (r.Source ?? '').toString().trim(),
      translationAuthor: (r['Translation author'] ?? '').toString().trim() || undefined,
      topComment: (r['Top comment'] ?? '').toString().trim() || undefined,
    };

    // dedupe by id, prefer first non-empty fields
    const existing = byId.get(id);
    if (existing) {
      byId.set(id, {
        ...existing,
        source: existing.source || item.source,
        translationAuthor: existing.translationAuthor || item.translationAuthor,
        topComment: existing.topComment || item.topComment,
      });
    } else {
      byId.set(id, item);
    }
  }

  if (checkMode) {
    if (errors.length) {
      console.error(`Found ${errors.length} issues:`);
      for (const e of errors) console.error(' -', e);
      process.exit(1);
    } else {
      console.log('CSV looks good.');
      process.exit(0);
    }
  }

  if (errors.length) {
    console.warn(`[csv-to-json] Warnings: ${errors.length} rows skipped.`);
  }

  const out = Array.from(byId.values());
  // small stable sort by source then id for deterministic output
  out.sort(
    (a, b) => (a.source || '').localeCompare(b.source || '') || a.id.localeCompare(b.id)
  );

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(out, null, 2));
  console.log(`Wrote ${out.length} quotes → ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

