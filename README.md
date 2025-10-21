# LectioToday

A minimalist daily reflection site that presents one carefully selected philosophical or religious passage each day, with a quiet space for discussion. The focus is breadth and quality: sources span ancient, medieval, and modern traditions (e.g., Marcus Aurelius, Epictetus, the Bhagavad Gītā, the Bible, the Qur’an, Confucian and Daoist texts, modern philosophers, and more). Comments are persisted and tied to a stable `quoteId` so when a passage reappears, its conversation returns with it.

## Overview

- **Single‑view application:** the home page shows today’s passage and a discussion box.
- **Persistent discussions:** threads are keyed by a stable `quoteId` derived from the passage text.
- **Daily rotation:** based on the **Europe/Copenhagen** timezone for day boundaries.
- **Zero‑cost stack:** Cloudflare Pages + Cloudflare D1 (SQLite) + Cloudflare Turnstile.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Deployment:** Cloudflare Pages via **OpenNext** (advanced mode, `.open-next` output)
- **Database:** Cloudflare **D1** (SQLite)
- **Anti‑spam:** Cloudflare **Turnstile**
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4
- **Runtime:** Node.js 20 (LTS)
- **Package Manager:** npm
- **Fonts:** EB Garamond (serif) for passages; system sans for UI

> Note: In OpenNext advanced mode, Cloudflare Pages serves a generated Worker; the legacy `functions/` directory is ignored. All APIs live under **`app/api/*`** (App Router route handlers).

## Features

- One passage per day with a serene aesthetic
- Stable IDs for passages to keep discussions attached across rotations
- Comment system with:
  - Turnstile verification
  - Rate limiting (default: 5 posts / 10 minutes / IP hash)
  - Duplicate detection (per quote)
  - Link limit (max 1 URL per comment)
  - Basic typing‑time check
- Optional admin/reporting routes (if enabled) to hide/unhide comments

*Out of scope by design:* archive, RSS/JSON feeds, open‑graph image generation, and third‑party embeds.

## Content Management

Quotes are maintained in CSV and compiled to JSON for deployment.

### CSV Columns

- `Quote` — text of the passage (required)
- `Source` — author/work or scripture citation
- `Translation author` — translator (optional)

### Build the JSON

```bash
npm run content:build
```
This compiles `content/quotes.csv` into `public/quotes.json`, generating **stable IDs** (deterministic hashes of normalized text), merging duplicates, and sorting for clean diffs. Commit `public/quotes.json` so deploys don’t require a database.

## APIs (App Router)

- `GET /api/health` → `{ ok: true, method: "GET" }` — basic health probe
- `GET /api/comments?quoteId=<id>` → `{ comments: [...] }` — list comments for a passage
- `POST /api/comments` — create a comment
  - Body: `{ quoteId, body, displayName?, parentId?, turnstileToken, honeypot? }`
  - Validates Turnstile, rate‑limits by IP hash, checks duplicates and link count

> These routes are implemented as **Next App Router** handlers and deployed through OpenNext. There is no `functions/` use in production.

## Cloudflare Configuration

1. **Pages project**
   - Build command: your OpenNext script (e.g., `npm run pages:build`)
   - Output directory: `.open-next`
2. **Bindings (Production + Preview)**
   - D1 binding named **`DB`** → your D1 database
3. **Environment variables (Production + Preview)**
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` — Turnstile site key
   - `TURNSTILE_SECRET` — Turnstile secret key
   - `HASH_SALT` — long random string for IP hashing
   - (optional) `NEXT_PUBLIC_BASE_URL` — canonical base URL used by metadata
4. **Turnstile allowed domains**
   - Add `localhost`, your `*.pages.dev`, and your custom domain
5. **Cache rules**
   - Bypass cache for `/api/*`
   - (Optional) Cache `/quotes.json` for 24h

## Local Development

The UI runs under `next dev`. API routes that need Cloudflare bindings (D1, Turnstile) are best tested in a Pages dev session:

```bash
# 1) Build with OpenNext
npm run pages:build

# 2) Serve the .open-next output locally via Wrangler
npx wrangler pages dev .open-next
```

Alternatively, use preview deploys on Cloudflare for end‑to‑end testing.

## Database Schema (D1)

See `db/migrations/0001_init.sql`. The primary table is `comments` with fields:

- `id` (TEXT, PK)
- `quote_id` (TEXT)
- `parent_id` (TEXT, nullable)
- `body` (TEXT)
- `display_name` (TEXT, nullable)
- `created_at` (INTEGER or TIMESTAMP)
- `updated_at` (INTEGER or TIMESTAMP)
- `ip_hash` (TEXT)
- `body_hash` (TEXT)
- `score` (INTEGER, default 0)
- `hidden` (INTEGER, default 0)

Indexes support common lookups (e.g., by `quote_id`, recency) and uniqueness for votes/reports if you enable moderation later.

## Security and Privacy

- IP addresses are not stored; a salted hash (`HASH_SALT` + IP) is kept solely for rate limiting and abuse prevention.
- Turnstile is used strictly to block automated submissions.
- No advertising, tracking pixels, or third‑party analytics are included by default.

## Getting Started (Quick)

```bash
# Install dependencies
npm install

# Dev (UI only)
npm run dev

# Build for Cloudflare Pages (OpenNext)
npm run pages:build

# Local Cloudflare preview (serves APIs + UI)
npx wrangler pages dev .open-next
```

## License

MIT

## Acknowledgments

Selections draw from a wide range of philosophical and religious texts and translators. Ensure you attribute translations where required (e.g., specific editions or translators) in your CSV.
