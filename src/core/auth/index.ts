// Auth module - Better Auth with Neon PostgreSQL + Kysely
import { siteConfig } from '@/config';

let authInstance: any = null;

export async function getAuth(): Promise<any> {
  if (authInstance) return authInstance;

  const { betterAuth } = await import('better-auth');
  const { Pool } = await import('@neondatabase/serverless');
  const { drizzle } = await import('drizzle-orm/neon-serverless');
  const { neon } = await import('@neondatabase/serverless');

  // Use Drizzle adapter (Better Auth内置支持)
  const sql = neon(siteConfig.database_url!);
  const db = drizzle(sql);

  const auth = betterAuth({
    appName: siteConfig.app_name || 'bigsea78',
    baseURL: siteConfig.auth_url || 'http://localhost:3000',
    secret: siteConfig.auth_secret || 'dev-secret-change-me',
    // 使用数据库适配器
    database: db,
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
