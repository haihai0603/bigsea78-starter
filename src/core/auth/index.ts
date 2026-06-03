// Auth module - Better Auth with PostgreSQL connection string
import { betterAuth } from 'better-auth';
import { siteConfig } from '@/config';

const dbUrl = siteConfig.database_url || process.env.DATABASE_URL || '';
const authSecret = siteConfig.auth_secret || process.env.AUTH_SECRET || '';
const authUrl = siteConfig.auth_url || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const auth = betterAuth({
  appName: siteConfig.app_name || 'bigsea78',
  baseURL: authUrl,
  secret: authSecret || 'dev-secret-fallback',
  database: dbUrl as any,
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
