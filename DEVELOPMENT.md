# Development Guide

## Quick Start

### Development Server

To run the full application with database access:

```bash
# Install dependencies
npm install

# Apply local database migrations (first time only)
npm run cf:d1:apply:local

# Build and run with Cloudflare Pages dev server
npm run dev:cf
```

This will:
1. Build the Next.js app for Cloudflare Pages
2. Start the Cloudflare Pages dev server with D1 database access
3. Load environment variables from `.dev.vars`

⚠️ **Note**: The regular `npm run dev` command won't work for this project because it requires Cloudflare-specific features (D1 database, Functions, etc.). Always use `npm run dev:cf` for development.

### Production Build

```bash
# Build for production
npm run pages:build

# Deploy to Cloudflare Pages
npm run deploy
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Home page (daily quote)
│   ├── globals.css         # Design system & styles
│   └── q/[id]/page.tsx     # Quote permalink pages
├── components/
│   ├── Header.tsx          # App header component
│   ├── QuoteCard.tsx       # Quote display card
│   └── DiscussionBox.tsx   # Comment box (UI only)
├── types/
│   └── quote.ts            # TypeScript definitions
└── lib/
    └── hash.ts             # Quote ID generator

public/
└── quotes.json             # Quote database
```

## Design System

### Colors (Zinc palette)
- Background: `#09090b`
- Foreground: `#fafafa`
- Muted: `#71717a`
- Border: `rgba(255, 255, 255, 0.15)`

### Typography
- **Serif (Quotes)**: EB Garamond - for quote text
- **Sans (UI)**: System font stack - for interface elements

### Glass Effects
The app uses custom CSS classes for the liquid glass aesthetic:

- `.glass-card` - Main content cards with backdrop blur
- `.glass-header` - Sticky header with translucency
- `.glass-button` - Interactive buttons with glass effect
- `.quote-text` - Serif typography for quotes

## How It Works

### Daily Quote Selection
The home page (`/`) shows a different quote each day using a deterministic algorithm:

```typescript
// Converts current UTC date to index
const today = new Date();
const utcDate = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
const daysSinceEpoch = Math.floor(utcDate / (1000 * 60 * 60 * 24));
return daysSinceEpoch % quotes.length;
```

This ensures all users worldwide see the same quote on any given day.

### Quote IDs
Each quote has a deterministic ID generated from its text using SHA-256:

```typescript
// lib/hash.ts
export async function quoteIdFromText(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.substring(0, 12); // First 12 hex chars
}
```

### Permalink Pages
Each quote can be accessed directly via `/q/[id]` where `[id]` is the quote's hash.
The page includes prev/next navigation that cycles through quotes client-side without changing the URL.

## Code Quality

```bash
# Run linter
npm run lint

# Format code
npm run format

# Check formatting
npm run format:check
```

## Adding New Quotes

1. Open `public/quotes.json`
2. Add your quote following this structure:

```json
{
  "id": "generated-hash-id",
  "quote": "The quote text here",
  "source": "Author Name, Work Title",
  "translationAuthor": "Translator Name",
  "translationSource": "Translation title (optional)"
}
```

3. Generate the `id` by hashing the quote text using the `quoteIdFromText()` function

## API Routes & Database

All API routes are implemented as **Cloudflare Functions** in `functions/api/`:

- Full D1 database integration
- Rate limiting, spam protection, Turnstile verification
- Used in both development (`npm run dev:cf`) and production

### Available Endpoints
- `POST /api/comments` - Submit a comment
- `GET /api/comments?quoteId=xxx` - Get comments for a quote
- `POST /api/track` - Track analytics events
- `POST /api/report` - Report a comment
- `GET /api/quote/today` - Get today's quote
- `GET /api/quote/[id]` - Get specific quote

## Database Schema

The D1 database includes:

- **comments** - User comments with spam protection
- **votes** - Comment upvote/downvote tracking  
- **reports** - Moderation reports
- **events** - Analytics tracking (views, shares, etc.)

Migrations are in `db/migrations/`

## Troubleshooting

### Dev server won't start
Make sure you're using Node.js v20 (check `.nvmrc`):
```bash
node --version  # Should be v20.x.x
```

### Styles not loading
Clear `.next` cache and rebuild:
```bash
rm -rf .next
npm run dev
```

### Type errors
Ensure TypeScript strict mode is enabled and all imports use the `@/` alias for src paths.

