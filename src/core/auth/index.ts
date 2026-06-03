// Auth module - Better Auth with lazy Neon Pool initialization
import { betterAuth } from 'better-auth';
import { Pool } from '@neondatabase/serverless';
import { siteConfig } from '@/config';

// Lazy auth instance - avoids crash when DATABASE_URL is missing at module load
let _auth: any = null;

function getAuthInstance() {
  if (_auth) return _auth;

  const dbUrl = siteConfig.database_url || process.env.DATABASE_URL || '';
  const authSecret = siteConfig.auth_secret || process.env.AUTH_SECRET || '';
  const authUrl = siteConfig.auth_url || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!dbUrl) {
    throw new Error('DATABASE_URL is not configured');
  }

  const pool = new Pool({ connectionString: dbUrl });

  _auth = betterAuth({
    appName: siteConfig.app_name || 'bigsea78',
    baseURL: authUrl,
    secret: authSecret || 'dev-secret-fallback',
    database: pool as any,
    emailAndPassword: { enabled: true },
    session: {
      cookieCache: { enabled: true, maxAge: 5 * 60 },
    },
  });

  return _auth;
}

// Export a proxy that lazily initializes auth
export const auth = new Proxy({} as any, {
  get(_target, prop) {
    const instance = getAuthInstance();
    const value = instance[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
});

// Export getAuth for other modules that import it
export function getAuth() {
  return getAuthInstance();
}

export async function getCurrentUser(request: Request) {
  const instance = getAuthInstance();
  const session = await instance.api.getSession({ headers: request.headers });
  return session?.user ?? null;
}

export async function requireAuth(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) throw new Error('Unauthorized');
  return user;
}
