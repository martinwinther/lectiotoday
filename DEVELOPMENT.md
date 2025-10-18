# Development Guide

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
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

## Next Steps (Future Development)

- [ ] Create CSV to JSON import script for bulk quote additions
- [ ] Implement comments backend with Cloudflare Workers + D1
- [ ] Add user authentication
- [ ] Build comment moderation system
- [ ] Create RSS feed for daily quotes
- [ ] Add share functionality
- [ ] Build archive view

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

