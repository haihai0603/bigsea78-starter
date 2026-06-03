// Auth module - Better Auth with Drizzle + Neon PostgreSQL
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { siteConfig } from '@/config';

const dbUrl = siteConfig.database_url || process.env.DATABASE_URL || '';
const authSecret = siteConfig.auth_secret || process.env.AUTH_SECRET || '';
const authUrl = siteConfig.auth_url || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

if (!dbUrl) {
  console.error('[AUTH] DATABASE_URL is not set! Auth will not work.');
}
if (!authSecret) {
  console.error('[AUTH] AUTH_SECRET is not set! Auth will not work.');
}

// 创建 Neon SQL 连接（只在有 URL 时）
const sql = dbUrl ? neon(dbUrl) : neon('postgresql://placeholder:placeholder@localhost:5432/placeholder');
const db = drizzle(sql);

export const auth = betterAuth({
  appName: siteConfig.app_name || 'bigsea78',
  baseURL: authUrl,
  secret: authSecret || 'dev-secret-fallback-not-secure',
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: { enabled: true },
  session: {
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
});

export async function getCurrentUser(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user ?? null;
}

export async function requireAuth(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) throw new Error('Unauthorized');
  return user;
}
