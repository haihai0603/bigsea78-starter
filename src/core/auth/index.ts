// Auth module - Better Auth with caching for serverless

import { betterAuth, type Auth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/core/db';
import { siteConfig } from '@/config';
import * as schema from '@/core/db/schema';

// Cache auth instance to prevent cold-start re-creation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let authInstance: any = null;
let authPromise: Promise<any> | null = null;
const CACHE_TTL = 30_000;
let authCreatedAt = 0;

export async function getAuth(): Promise<any> {
  if (authInstance && Date.now() - authCreatedAt < CACHE_TTL) {
    return authInstance;
  }
  if (authPromise) return authPromise;

  authPromise = createAuth();
  return authPromise;
}

async function createAuth(): Promise<any> {
  const auth = betterAuth({
    appName: siteConfig.app_name || 'bigsea78',
    baseURL: siteConfig.auth_url || 'http://localhost:3000',
    secret: siteConfig.auth_secret || 'dev-secret-change-me',
    database: siteConfig.database_url
      ? drizzleAdapter(db(), { provider: 'pg', schema })
      : undefined,
    emailAndPassword: { enabled: true },
    session: {
      cookieCache: { enabled: true, maxAge: 5 * 60 },
    },
    socialProviders: {
      ...(siteConfig.google_client_id && siteConfig.google_client_secret
        ? { google: { clientId: siteConfig.google_client_id, clientSecret: siteConfig.google_client_secret } }
        : {}),
      ...(siteConfig.github_client_id && siteConfig.github_client_secret
        ? { github: { clientId: siteConfig.github_client_id, clientSecret: siteConfig.github_client_secret } }
        : {}),
    },
  });

  authInstance = auth;
  authCreatedAt = Date.now();
  authPromise = null;
  return auth;
}

export async function getCurrentUser(request: Request) {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user ?? null;
}

export async function requireAuth(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) throw new Error('Unauthorized');
  return user;
}
