// Auth module - Better Auth with Neon PostgreSQL (simplified)
import { siteConfig } from '@/config';

let authInstance: any = null;

export async function getAuth(): Promise<any> {
  if (authInstance) return authInstance;

  const { betterAuth } = await import('better-auth');

  const auth = betterAuth({
    appName: siteConfig.app_name || 'bigsea78',
    baseURL: siteConfig.auth_url || 'http://localhost:3000',
    secret: siteConfig.auth_secret || 'dev-secret-change-me',
    // 直接传数据库连接字符串，Better Auth 会自动处理
    database: siteConfig.database_url!,
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
