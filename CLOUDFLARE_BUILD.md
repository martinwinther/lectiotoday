# Cloudflare Pages Build Configuration

This project uses **OpenNext** for Cloudflare Pages deployment.

## Quick Start

### Build for Cloudflare Pages
```bash
npm run pages:build
```

This builds the Next.js app and packages it for Cloudflare Workers using OpenNext, then renames the worker file to `_worker.js` (required by Cloudflare Pages to execute it as a Worker).

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
- `pages_build_output_dir`: `.open-next` - The build output directory
- `compatibility_date`: `2025-01-01`
- `compatibility_flags`: `["nodejs_compat"]` - **REQUIRED** to enable Node.js built-in modules
- D1 database bindings
- Environment variables

**Note**: The build command must be set in the Cloudflare Pages dashboard, not in `wrangler.toml` (the `[build]` section is only for Workers, not Pages).

**Important**: The `nodejs_compat` flag is essential for OpenNext to work, as it uses Node.js built-in modules like `fs`, `path`, `crypto`, etc.

## Cloudflare Pages Setup

When connecting to Cloudflare Pages via GitHub:

1. **Build command**: Must be set in Cloudflare Pages dashboard → **`npm run pages:build`**
2. **Build output directory**: Auto-detected from `wrangler.toml` → **`.open-next`**
3. **Environment variables**: Set in Cloudflare Pages dashboard
   - `TURNSTILE_SECRET`
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   - `HASH_SALT`

**Important**: You MUST manually set the build command in the Cloudflare Pages dashboard. The `wrangler.toml` file only configures the output directory, not the build command (Pages doesn't support the `[build]` section).

## Why OpenNext?

OpenNext is the recommended adapter for deploying Next.js to Cloudflare Pages (replacing the deprecated `@cloudflare/next-on-pages`). It provides:

- Full Next.js 15 support
- Edge runtime compatibility
- Cloudflare Workers optimization
- D1 database integration
- Server-side rendering on Cloudflare's edge

## Build Output

The `.open-next` directory contains:
- `_worker.js` - Main Cloudflare Worker (renamed from `worker.js` for Pages compatibility)
- `_routes.json` - Routing configuration (generated to exclude static assets)
- Static assets (flattened from `assets/` directory)
- `cache/` - Pre-rendered pages
- `server-functions/` - Server-side functions
- `cloudflare/` - Cloudflare-specific code

**Note**: The build process automatically renames `worker.js` to `_worker.js` and flattens the assets directory because Cloudflare Pages requires this structure. All API routes are handled by the Next.js App Router within the Worker.

## Troubleshooting

### Build fails with "open-next.config.ts" error
Make sure the config file has the required structure with `default`, `edgeExternals`, and `middleware` sections.

### "No routes found" error
Ensure `pages_build_output_dir = ".open-next"` is set in `wrangler.toml`.

### Site shows 404 error after successful deployment
This happens if the worker file isn't being executed. Make sure:
1. The build script includes the `pages:fix-worker` step that renames `worker.js` to `_worker.js`
2. The `_worker.js` file exists in `.open-next/` after building
3. Cloudflare Pages recognizes files starting with `_` as Workers

### API routes not working
Ensure:
1. API routes are in `src/app/api/` using Next.js App Router
2. D1 database bindings are correctly configured in `wrangler.toml`
3. `getCloudflareContext()` from `@opennextjs/cloudflare` is used to access bindings
4. No `runtime = 'edge'` exports in route handlers (OpenNext handles this automatically)

## Local Development

For local development, use the standard Next.js dev server:

```bash
npm run dev
```

For testing with Cloudflare bindings (D1 database, Turnstile):
```bash
npm run dev:cf
```

This builds the app with OpenNext and runs the Cloudflare Pages development server with D1 database access.

---

For more details, see:
- `CLOUDFLARE_SETUP.md` - Complete setup guide
- `DEPLOYMENT.md` - Deployment instructions
- [OpenNext Docs](https://opennext.js.org/cloudflare)

