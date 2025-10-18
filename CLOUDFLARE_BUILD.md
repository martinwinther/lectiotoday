# Cloudflare Pages Build Configuration

This project uses **OpenNext** for Cloudflare Pages deployment.

## Quick Start

### Build for Cloudflare Pages
```bash
npm run pages:build
```

This builds the Next.js app and packages it for Cloudflare Workers using OpenNext.

### Local Preview
```bash
npm run preview
```

Preview the built app locally with Wrangler.

### Deploy
```bash
npm run deploy
```

Deploy the built app to Cloudflare Pages.

## Configuration Files

### `open-next.config.ts`
OpenNext configuration for Cloudflare Workers runtime. This file configures:
- Wrapper type (cloudflare-node for main app, cloudflare-edge for middleware)
- Cache handlers (using dummy cache for now)
- External modules (node:crypto)

### `wrangler.toml`
Cloudflare Pages configuration:
- `[build]` section with `command = "npm run pages:build"` - Tells Cloudflare what to run
- `pages_build_output_dir`: `.open-next` - The build output directory
- `compatibility_date`: `2025-01-01`
- D1 database bindings
- Environment variables

## Cloudflare Pages Setup

When connecting to Cloudflare Pages via GitHub:

1. **Build command**: Automatically configured via `wrangler.toml` (`npm run pages:build`)
2. **Build output directory**: Automatically configured via `wrangler.toml` (`.open-next`)
3. **Environment variables**: Set in Cloudflare Pages dashboard
   - `TURNSTILE_SECRET`
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   - `HASH_SALT`

**Note**: The `wrangler.toml` file now includes a `[build]` section that tells Cloudflare Pages to run the correct build command. You don't need to manually configure the build command in the dashboard - it will be read from the config file.

## Why OpenNext?

OpenNext is the recommended adapter for deploying Next.js to Cloudflare Pages (replacing the deprecated `@cloudflare/next-on-pages`). It provides:

- Full Next.js 15 support
- Edge runtime compatibility
- Cloudflare Workers optimization
- D1 database integration
- Server-side rendering on Cloudflare's edge

## Build Output

The `.open-next` directory contains:
- `worker.js` - Main Cloudflare Worker
- `assets/` - Static assets
- `cache/` - Pre-rendered pages
- `server-functions/` - Server-side functions
- `cloudflare/` - Cloudflare-specific code

## Troubleshooting

### Build fails with "open-next.config.ts" error
Make sure the config file has the required structure with `default`, `edgeExternals`, and `middleware` sections.

### "No routes found" error
Ensure `pages_build_output_dir = ".open-next"` is set in `wrangler.toml`.

### Functions not working
Check that your D1 database bindings are correctly configured in `wrangler.toml`.

## Local Development

For local development, use the standard Next.js dev server:

```bash
npm run dev
```

For testing Cloudflare Functions (like comments API):
```bash
npm run cf:dev
```

This runs the Cloudflare Pages development server with D1 database access.

---

For more details, see:
- `CLOUDFLARE_SETUP.md` - Complete setup guide
- `DEPLOYMENT.md` - Deployment instructions
- [OpenNext Docs](https://opennext.js.org/cloudflare)

