# Migration to OpenNext App Routes (Cloudflare) + D1 + Turnstile

**Completed:** October 18, 2025

## Summary

Successfully migrated from Cloudflare Pages Functions to Next.js App Router with OpenNext, enabling proper D1 and Turnstile integration in Cloudflare's Advanced Mode.

## What Changed

### 1. API Endpoints Migration

All API endpoints moved from `/functions/api/*` (Hono-based Pages Functions) to `/src/app/api/*` (Next.js App Router):

- ✅ `/api/health` → Health check endpoint
- ✅ `/api/comments` → GET and POST comment operations
- ✅ `/api/track` → Analytics tracking
- ✅ `/api/report` → Report comments
- ✅ `/api/admin/reports` → View reported comments
- ✅ `/api/admin/comments/hide` → Hide/unhide comments
- ✅ `/api/quote/today` → Get today's quote
- ✅ `/api/quote/[id]` → Get quote by ID

### 2. Cloudflare Bindings Access

Created `src/lib/cf.ts` helper using `@opennextjs/cloudflare`:

```typescript
import { getCloudflareContext } from '@opennextjs/cloudflare';

export function cfEnv() {
  return getCloudflareContext().env as unknown as CloudflareEnv;
}
```

This replaces Hono's context-based binding access (`c.env.DB`) with Next.js-compatible binding access.

### 3. Removed Pages Functions

- Renamed `/functions` → `/legacy_functions` (kept for reference)
- Removed `pages:copy-functions` script from `package.json`
- Updated `_routes.json` generation to include `/api/*` routes (handled by Worker)

### 4. Updated Documentation

- Updated `CLOUDFLARE_SETUP.md` with new API structure
- Updated `CLOUDFLARE_BUILD.md` with App Router deployment info
- Fixed troubleshooting sections to reference new file paths

### 5. Restored Admin Panel

The admin panel (`/src/app/admin/page.tsx`) was previously disabled due to "OpenNext limitations". Now fully functional with:
- View reported comments
- Hide/unhide comments
- Real-time status updates

## Key Technical Details

### No `runtime = 'edge'` Exports

Following OpenNext's guidance, we do **not** export `runtime = 'edge'` in route handlers. OpenNext handles the Worker translation automatically.

### Binding Access Pattern

All API routes follow this pattern:

```typescript
import { cfEnv } from '@/lib/cf';

export async function POST(req: NextRequest) {
  const { DB, TURNSTILE_SECRET, HASH_SALT } = cfEnv();
  // ... use bindings
}
```

### Routes Configuration

The `_routes.json` now excludes only static assets, not API routes:

```json
{
  "version": 1,
  "include": ["/*"],
  "exclude": [
    "/_next/static/*",
    "/favicon.ico",
    "/file.svg",
    "/globe.svg",
    "/next.svg",
    "/vercel.svg",
    "/window.svg",
    "/quotes.json"
  ]
}
```

## Environment Variables

These must be set in Cloudflare Pages dashboard (Production & Preview):

| Variable | Description |
|----------|-------------|
| `DB` | D1 database binding |
| `TURNSTILE_SECRET` | Turnstile secret key (server-side) |
| `HASH_SALT` | Random salt for IP hashing |
| `ADMIN_SECRET` | Admin panel authentication token |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile site key (client-side) |

## Build Process

The build process remains the same:

```bash
npm run pages:build
```

Which runs:
1. `opennextjs-cloudflare build` - Builds Next.js with OpenNext
2. `pages:fix-worker` - Renames `worker.js` → `_worker.js`
3. `pages:flatten-assets` - Flattens assets directory
4. `pages:add-routes` - Generates `_routes.json`

## Testing

### Local Development

```bash
npm run dev  # Standard Next.js dev server
```

### With Cloudflare Bindings

```bash
npm run dev:cf  # Build + run with Wrangler Pages dev
```

### Test Endpoints

```bash
# Health check
curl https://yourdomain.pages.dev/api/health

# Get comments
curl "https://yourdomain.pages.dev/api/comments?quoteId=test"

# Post comment (will fail Turnstile with fake token)
curl -X POST https://yourdomain.pages.dev/api/comments \
  -H "content-type: application/json" \
  -d '{"quoteId":"test","body":"hi","turnstileToken":"fake"}'
```

## Migration Benefits

1. ✅ **Native Next.js Integration** - API routes in App Router instead of separate Hono functions
2. ✅ **Proper TypeScript Support** - Full type safety with `getCloudflareContext()`
3. ✅ **Simplified Architecture** - One Worker handles everything (no Functions vs Pages confusion)
4. ✅ **Better Developer Experience** - Standard Next.js patterns throughout
5. ✅ **Working Admin Panel** - Full moderation functionality restored

## Compatibility

- ✅ Next.js 15.5.2
- ✅ OpenNext for Cloudflare 1.11.0+
- ✅ Cloudflare Pages Advanced Mode
- ✅ D1 Database
- ✅ Turnstile

## Notes

- The `/legacy_functions` folder is kept for reference but not used in deployment
- All client-side code already used relative URLs (`/api/*`), so no changes needed
- The migration is backward compatible - all existing endpoints work the same way

