// Auth module - Better Auth with lazy initialization
import { siteConfig } from '@/config';

let _auth: any = null;

export async function getAuth() {
  if (_auth) return _auth;

  const dbUrl = siteConfig.database_url || process.env.DATABASE_URL || '';
  const authSecret = siteConfig.auth_secret || process.env.AUTH_SECRET || '';
  const authUrl = siteConfig.auth_url || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!dbUrl) throw new Error('DATABASE_URL is not configured');
  if (!authSecret) throw new Error('AUTH_SECRET is not configured');

  // 使用 Neon 的 Kysely dialect
  const { NeonDialect } = await import('@neondatabase/serverless/kysely');
  const { Kysely } = await import('kysely');
  const { betterAuth } = await import('better-auth');

  const db = new Kysely({ dialect: new NeonDialect({ connectionString: dbUrl }) });

  _auth = betterAuth({
    appName: siteConfig.app_name || 'bigsea78',
    baseURL: authUrl,
    secret: authSecret,
    database: db,
    emailAndPassword: { enabled: true },
    session: {
      cookieCache: { enabled: true, maxAge: 5 * 60 },
    },
  });

  return _auth;
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
