# LectioToday

A beautiful, minimalist daily quote application featuring timeless wisdom from Stoic philosophers like Marcus Aurelius and Epictetus. Built with a "liquid glass + monastic" aesthetic.

## 🎯 Overview

LectioToday presents one carefully selected Stoic quote each day, creating a focused space for reflection and contemplation. The app features a sophisticated dark UI with translucent "liquid glass" elements and elegant serif typography.

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.6 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Runtime**: Node.js v20 (LTS)
- **Package Manager**: npm
- **Fonts**: EB Garamond (serif) for quotes, system sans for UI
- **Comments**: Cloudflare D1 (SQLite) + Pages Functions
- **Anti-spam**: Cloudflare Turnstile
- **API**: Hono framework
- **Timezone**: Europe/Copenhagen (for daily quote selection)
- **PWA**: Service Worker with offline caching
- **Feeds**: RSS 2.0 and JSON Feed 1.1

## 🚀 Getting Started

### Prerequisites

- Node.js v20 (see `.nvmrc`)
- npm or pnpm

### Installation

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

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## 📝 Content Management

LectioToday uses a simple CSV → JSON pipeline to manage quotes.

### Adding Quotes

1. **Edit the CSV file** at `content/quotes.csv` with your quotes. The CSV expects these headers:
   - `Quote` - The quote text (required, 5-1200 characters)
   - `Source` - Author and work (e.g., "Marcus Aurelius, Meditations, Book 5")
   - `Translation source` - Translation title (optional)
   - `Translation author` - Translator name (optional)
   - `Top comment` - Editorial commentary (optional)

2. **Generate the JSON**:
   ```bash
   npm run content:build
   ```
   This converts `content/quotes.csv` → `public/quotes.json` with stable IDs derived from the quote text.

3. **Check for issues** (optional):
   ```bash
   npm run content:check
   ```
   Validates the CSV without writing output.

### How It Works

- **Stable IDs**: Each quote gets a deterministic 12-character ID from SHA-256 hash of the normalized quote text
- **Deduplication**: Duplicate quotes (same text) are merged, keeping the first non-empty field values
- **Sorting**: Output is sorted by source then ID for consistent diffs in version control

The generated `public/quotes.json` is committed to the repo so the site can deploy without a database.

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with fonts
│   ├── page.tsx            # Home page (daily quote)
│   ├── globals.css         # Liquid glass design system
│   └── q/[id]/page.tsx     # Quote permalink pages
├── components/
│   ├── Header.tsx          # App header
│   ├── QuoteCard.tsx       # Quote display component
│   └── DiscussionBox.tsx   # Comment box (UI only)
├── types/
│   └── quote.ts            # Quote type definitions
└── lib/
    ├── hash.ts             # Deterministic quote ID generator
    └── quotes.ts           # Quote loading utilities

content/
└── quotes.csv              # Source CSV file for quotes

scripts/
└── csv-to-json.ts          # CSV → JSON conversion pipeline

functions/
├── api/
│   ├── comments.ts         # Comment submission API
│   ├── quote/
│   │   ├── today.ts        # Today's quote API
│   │   └── [id].ts         # Quote by ID API
│   ├── admin.ts            # Admin routes
│   └── ...
├── feed.xml.ts             # RSS 2.0 feed
├── feed.json.ts            # JSON Feed
└── embed.js.ts             # Embed widget script

db/
└── migrations/
    └── 0001_init.sql       # D1 database schema

public/
└── quotes.json             # Generated quote database
```

## 🎨 Design System

- **Background**: Dark radial gradient with subtle noise texture
- **Cards**: Translucent glass effect with backdrop blur
- **Typography**: EB Garamond serif for quotes, system sans for UI
- **Colors**: Zinc/Stone palette (zinc-50 to zinc-900)
- **Effects**: Soft shadows, rounded corners, subtle borders

## 💬 Comments System

LectioToday includes a free, persistent comment system powered by Cloudflare D1 and Turnstile.

### Features

- **Zero-cost hosting**: Uses Cloudflare Pages Functions + D1 (SQLite)
- **Anti-spam**: Cloudflare Turnstile for bot protection
- **Rate limiting**: Max 5 comments per 10 minutes per IP
- **Duplicate detection**: Prevents exact same comment on same quote
- **Link limits**: Max 1 link per comment
- **Typing time check**: Basic anti-bot timing verification

### Setup Instructions

#### 1. Get Cloudflare Turnstile Keys

1. Visit [Cloudflare Dashboard](https://dash.cloudflare.com/) → Turnstile
2. Create a new site widget
3. Note your **Site Key** and **Secret Key**

#### 2. Create D1 Database

```bash
# Create the database in Cloudflare
wrangler d1 create LectioTodayDB

# Copy the database_id from output and update wrangler.toml
```

Update `wrangler.toml` with your `database_id`.

#### 3. Apply Database Schema

```bash
# For production (Cloudflare)
npm run cf:d1:apply

# For local development
npm run cf:d1:local
```

#### 4. Set Environment Variables

In **Cloudflare Pages** dashboard → Settings → Environment variables:

- `TURNSTILE_SECRET` = Your Turnstile secret key
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` = Your Turnstile site key
- `HASH_SALT` = A long random string (for IP hashing)

For local development, create `.dev.vars` in project root:

```
TURNSTILE_SECRET=your-secret-key
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-site-key
HASH_SALT=your-random-salt-string
```

#### 5. Deploy to Cloudflare Pages

1. Connect your GitHub repo to Cloudflare Pages
2. Build command: `npm run build`
3. Output directory: `.next`
4. Add environment variables (see step 4)
5. Deploy!

### Local Development

Run both servers simultaneously:

```bash
# Terminal 1: Next.js dev server
npm run dev

# Terminal 2: Cloudflare Pages Functions (API)
npm run cf:dev
```

The API endpoints will be available at `/api/comments`.

### Database Schema

- **comments**: Stores comment data with quote_id, body, display_name, timestamps, hashes for deduplication
- **votes**: Reserved for future upvote/downvote functionality

### Anti-Spam Features

1. **Turnstile**: Human verification on every post
2. **Rate limiting**: IP-based (5 posts/10 min)
3. **Duplicate detection**: Hash-based per quote
4. **Link limits**: Max 1 URL per comment
5. **Honeypot field**: Hidden field to catch bots
6. **Timing check**: Minimum typing time required

## 📋 Completed Features

- [x] CSV to JSON conversion script for importing large quote collections
- [x] Comments API backend (Cloudflare Workers/D1)
- [x] Archive view with all quotes
- [x] RSS & JSON Feed for daily quotes
- [x] Public REST APIs (today's quote, quote by ID)
- [x] Embed widget for external websites
- [x] Progressive Web App (PWA) support
- [x] Timezone-aware daily selection (Europe/Copenhagen)

## 📋 Future Enhancements

- [ ] User authentication (optional)
- [ ] Comment moderation dashboard
- [ ] Upvote/downvote system
- [ ] Share quote functionality (social media integration)

## 🔧 Key Features

### Daily Quote Selection
The home page automatically selects a quote based on the current date in **Europe/Copenhagen timezone**, ensuring consistent daily quotes for the target audience.

### Permalink Pages
Each quote has a unique permalink (`/q/[id]`) with prev/next navigation for browsing the entire collection.

### Deterministic Quote IDs
Quote IDs are generated using SHA-256 hashing of the quote text, ensuring stable URLs even if the quote order changes.

## 🔌 APIs & Feeds

LectioToday provides read-only public APIs and feed formats for integrations.

### REST APIs

#### Get Today's Quote
```
GET /api/quote/today
```
Returns the current daily quote based on Europe/Copenhagen timezone.

**Response:**
```json
{
  "quote": {
    "id": "abc123...",
    "quote": "Quote text...",
    "source": "Marcus Aurelius, Meditations",
    "translation_source": "...",
    "translation_author": "...",
    "top_comment": "..."
  },
  "index": 42,
  "dateYmd": 20251018,
  "tz": "Europe/Copenhagen"
}
```

#### Get Quote by ID
```
GET /api/quote/[id]
```
Returns a specific quote by its ID.

**Response:**
```json
{
  "quote": {
    "id": "abc123...",
    "quote": "Quote text...",
    "source": "..."
  }
}
```

### Feeds

Subscribe to daily quotes via RSS or JSON Feed:

- **RSS 2.0**: `/feed.xml`
- **JSON Feed 1.1**: `/feed.json`

Both feeds include the last 14 daily quotes with proper publication dates.

### Embed Widget

Embed today's quote on any website with a simple script tag:

```html
<script async src="https://your-domain.com/embed.js" data-theme="dark"></script>
```

**Options:**
- `data-theme="dark"` (default) or `data-theme="light"` - Set the theme
- The widget is fully self-contained with no external dependencies
- Automatically fetches and displays today's quote
- Includes a link back to the full quote page

## 📱 Progressive Web App (PWA)

LectioToday is installable as a Progressive Web App:

- **Offline support**: Core pages cached for offline viewing
- **Install prompt**: Available on supported browsers (Chrome, Edge, Safari)
- **Standalone mode**: Runs like a native app when installed
- **Automatic updates**: Service worker updates in the background

To install:
1. Visit the site in a PWA-compatible browser
2. Look for the "Install" prompt in the address bar
3. Click "Install" to add to home screen/app drawer

## 📝 License

MIT

## 🙏 Acknowledgments

Quotes sourced from translations of:
- Marcus Aurelius' *Meditations* (translated by Gregory Hays)
- Epictetus' *Enchiridion* and *Discourses* (translated by Elizabeth Carter, Robin Hard)
