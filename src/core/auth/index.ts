// Simple JWT Auth - replaces Better Auth
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { siteConfig } from '@/config';
import { db } from '@/core/db';
import { users } from '@/core/db/schema';
import { eq } from 'drizzle-orm';

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
 * Register new user
 */
export async function signUp(email: string, password: string, name?: string): Promise<AuthUser> {
  // Check if user exists
  const existing = await db().select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    throw new Error('Email already registered');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user
  const [user] = await db().insert(users).values({
    id: crypto.randomUUID(),
    email,
    name: name || null,
    passwordHash,
    role: 'user',
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role || 'user',
    emailVerified: !!user.emailVerified,
  };
}

/**
 * Sign in user
 */
export async function signIn(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
  const [user] = await db().select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !user.passwordHash) {
    throw new Error('Invalid email or password');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new Error('Invalid email or password');
  }

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role || 'user',
    emailVerified: !!user.emailVerified,
  };

  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
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
      emailVerified: false,
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
