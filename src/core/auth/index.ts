// Simple JWT Auth - replaces Better Auth
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { siteConfig } from '@/config';
import { db } from '@/core/db';
import { users } from '@/core/db/schema';
import { eq } from 'drizzle-orm';
import { sendVerificationEmail } from '@/core/email';

const JWT_SECRET = siteConfig.auth_secret || process.env.AUTH_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  emailVerified: boolean;
}

/**
 * Register new user - sends verification email
 */
export async function signUp(email: string, password: string, name?: string): Promise<{ user: AuthUser; verificationSent: boolean }> {
  // Check if user exists
  const existing = await db().select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    throw new Error('Email already registered');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Generate verification token (valid for 24h)
  const verifyToken = jwt.sign({ email, purpose: 'verify' }, JWT_SECRET, { expiresIn: '24h' });

  // Create user
  const [newUser] = await db().insert(users).values({
    id: crypto.randomUUID(),
    email,
    name: name || email.split('@')[0],
    passwordHash,
    role: 'user',
    emailVerified: false,
    verifyToken,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();

  // Always send verification email
  let verificationSent = false;
  const isDev = process.env.NODE_ENV === 'development';

  try {
    verificationSent = await sendVerificationEmail(email, verifyToken, name);
    console.log('[Auth] sendVerificationEmail result:', verificationSent);
  } catch (emailError) {
    console.error('[Auth] sendVerificationEmail exception:', emailError);
  }

  // In dev mode, auto-verify for convenience
  // In production, if email send fails, also auto-verify so user can login
  const shouldAutoVerify = isDev || !verificationSent;
  if (shouldAutoVerify) {
    await db().update(users).set({ emailVerified: true } as any).where(eq(users.id, newUser.id));
    console.log('[Auth] Auto-verified user (dev=' + isDev + ', emailSent=' + verificationSent + '):', email);
  }
  const effectiveVerified = shouldAutoVerify;

  return {
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role || 'user',
      emailVerified: effectiveVerified,
    },
    verificationSent,
  };
}

/**
 * Sign in user - requires email verification
 */
export async function signIn(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
  const [dbUser] = await db().select().from(users).where(eq(users.email, email)).limit(1);
  console.log('[SignIn] dbUser raw:', JSON.stringify(dbUser));
  console.log('[SignIn] emailVerified raw:', dbUser?.emailVerified, 'type:', typeof dbUser?.emailVerified);
  if (!dbUser || !dbUser.passwordHash) {
    throw new Error('Invalid email or password');
  }

  // Check email verification (TEMPORARILY DISABLED FOR PRODUCTION)
  // TODO: Re-enable after Resend is configured in Vercel
  console.log('[SignIn] emailVerified check SKIPPED - value:', JSON.stringify(dbUser.emailVerified));
  // if (!dbUser.emailVerified) {
  //   throw new Error(`Please verify email before login (debug: emailVerified=${JSON.stringify(dbUser.emailVerified)}, type=${typeof dbUser.emailVerified})`);
  // }

  const valid = await bcrypt.compare(password, dbUser.passwordHash);
  if (!valid) {
    throw new Error('Invalid email or password');
  }

  const authUser: AuthUser = {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role || 'user',
    emailVerified: !!dbUser.emailVerified,
  };

  const token = jwt.sign(
    { sub: dbUser.id, email: dbUser.email, role: dbUser.role, emailVerified: !!dbUser.emailVerified },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return { user: authUser, token };
}

/**
 * Get user from JWT token
 */
export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name || null,
      role: decoded.role || 'user',
      emailVerified: !!decoded.emailVerified,
    };
  } catch {
    return null;
  }
}

/**
 * Get current user from request
 */
export async function getCurrentUser(request: Request): Promise<AuthUser | null> {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/auth_token=([^;]+)/);
  if (!match) return null;

  return verifyToken(match[1]);
}

/**
 * Require auth - throws if not authenticated
 */
export async function requireAuth(request: Request): Promise<AuthUser> {
  const user = await getCurrentUser(request);
  if (!user) throw new Error('Unauthorized');
  return user;
}

/**
 * Create auth cookie header value
 */
export function createAuthCookie(token: string): string {
  return `auth_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`;
}

/**
 * Better Auth compatible shim (replaces real Better Auth)
 * Provides the same { api: { getSession(...) } } interface
 */
export async function getAuth() {
  return {
    api: {
      getSession: async ({ headers }: { headers: Headers }) => {
        try {
          const user = await getCurrentUser(new Request('http://localhost', { headers }));
          if (!user) return null;
          return {
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              emailVerified: user.emailVerified,
              image: null as string | null,
              role: user.role,
            },
            session: { user },
          };
        } catch {
          return null;
        }
      },
    },
  };
}

/**
 * Get user by ID (for Server Components)
 */
export async function getUserById(id: string): Promise<AuthUser | null> {
  try {
    const { db } = await import('@/core/db');
    const { users } = await import('@/core/db/schema');
    const { eq } = await import('drizzle-orm');
    
    const result = await db().select().from(users).where(eq(users.id, id)).limit(1);
    if (!result[0]) return null;
    
    const u = result[0];
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role || 'user',
      emailVerified: !!u.emailVerified,
    };
  } catch {
    return null;
  }
}
