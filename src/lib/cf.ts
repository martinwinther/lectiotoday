/// <reference types="@cloudflare/workers-types" />

import { getCloudflareContext } from '@opennextjs/cloudflare';

export interface CloudflareEnv {
  DB: D1Database;
  TURNSTILE_SECRET: string;
  HASH_SALT: string;
  ADMIN_SECRET: string;
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: string;
  ASSETS: Fetcher;
}

export function cfEnv() {
  return getCloudflareContext().env as unknown as CloudflareEnv;
}

