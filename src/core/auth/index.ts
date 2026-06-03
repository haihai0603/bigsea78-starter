// Auth module - Better Auth with Neon Serverless Pool
import { betterAuth } from 'better-auth';
import { Pool } from '@neondatabase/serverless';
import { siteConfig } from '@/config';

const dbUrl = siteConfig.database_url || process.env.DATABASE_URL || '';
const authSecret = siteConfig.auth_secret || process.env.AUTH_SECRET || '';
const authUrl = siteConfig.auth_url || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// 创建 Neon serverless Pool（兼容 pg.Pool 接口，可在 Vercel Edge/Serverless 运行）
const pool = dbUrl ? new Pool({ connectionString: dbUrl }) : undefined;

if (!pool) {
  console.error('[AUTH] DATABASE_URL is not set! Auth will not work.');
}
if (!authSecret) {
  console.error('[AUTH] AUTH_SECRET is not set! Auth will not work.');
}

export const auth = betterAuth({
  appName: siteConfig.app_name || 'bigsea78',
  baseURL: authUrl,
  secret: authSecret || 'dev-secret-fallback-not-secure',
  database: pool as any, // Neon Pool 兼容 pg.Pool 接口
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
