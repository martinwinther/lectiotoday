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
    └── hash.ts             # Deterministic quote ID generator

public/
└── quotes.json             # Quote database
```

## 🎨 Design System

- **Background**: Dark radial gradient with subtle noise texture
- **Cards**: Translucent glass effect with backdrop blur
- **Typography**: EB Garamond serif for quotes, system sans for UI
- **Colors**: Zinc/Stone palette (zinc-50 to zinc-900)
- **Effects**: Soft shadows, rounded corners, subtle borders

## 📋 Upcoming Tasks

- [ ] CSV to JSON conversion script for importing large quote collections
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
