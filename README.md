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

public/
└── quotes.json             # Generated quote database
```

## 🎨 Design System

- **Background**: Dark radial gradient with subtle noise texture
- **Cards**: Translucent glass effect with backdrop blur
- **Typography**: EB Garamond serif for quotes, system sans for UI
- **Colors**: Zinc/Stone palette (zinc-50 to zinc-900)
- **Effects**: Soft shadows, rounded corners, subtle borders

## 📋 Upcoming Tasks

- [x] CSV to JSON conversion script for importing large quote collections
- [ ] Comments API backend (Cloudflare Workers/D1)
- [ ] User authentication
- [ ] Comment moderation system
- [ ] RSS feed for daily quotes
- [ ] Share quote functionality
- [ ] Archive view with all quotes

## 🔧 Key Features

### Daily Quote Selection
The home page automatically selects a quote based on the current UTC date, ensuring everyone sees the same quote globally on any given day.

### Permalink Pages
Each quote has a unique permalink (`/q/[id]`) with prev/next navigation for browsing the entire collection.

### Deterministic Quote IDs
Quote IDs are generated using SHA-256 hashing of the quote text, ensuring stable URLs even if the quote order changes.

## 📝 License

MIT

## 🙏 Acknowledgments

Quotes sourced from translations of:
- Marcus Aurelius' *Meditations* (translated by Gregory Hays)
- Epictetus' *Enchiridion* and *Discourses* (translated by Elizabeth Carter, Robin Hard)
