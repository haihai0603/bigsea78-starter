// Auth module - Better Auth with Kysely + Neon HTTP driver
import { betterAuth } from 'better-auth';
import { siteConfig } from '@/config';

const dbUrl = siteConfig.database_url || process.env.DATABASE_URL || '';
const authSecret = siteConfig.auth_secret || process.env.AUTH_SECRET || '';
const authUrl = siteConfig.auth_url || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// 动态创建 Kysely 实例（使用 Neon HTTP 驱动，兼容 Vercel serverless）
function createKyselyNeon() {
  // Better Auth 内部已经引入了 kysely，我们只需创建兼容的 dialect
  const { NeonDialect } = require('@neondatabase/serverless/kysely');
  const { Kysely } = require('kysely');
  return new Kysely({ dialect: new NeonDialect({ connectionString: dbUrl }) });
}

let dbInstance: any;
try {
  if (dbUrl) {
    dbInstance = createKyselyNeon();
  } else {
    console.error('[AUTH] DATABASE_URL is not set!');
  }
} catch (e: any) {
  console.error('[AUTH] Failed to create Kysely instance:', e.message);
}

export const auth = betterAuth({
  appName: siteConfig.app_name || 'bigsea78',
  baseURL: authUrl,
  secret: authSecret || 'dev-secret-fallback',
  database: dbInstance,
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
