import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';

const AUTH_SECRET = process.env.AUTH_SECRET || 'dev-secret';

// Sign up new user
export async function signUp(email: string, password: string, name?: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  
  const [user] = await db.insert(users).values({
    email,
    passwordHash,
    name,
  }).returning();

  const token = jwt.sign({ userId: user.id, email: user.email }, AUTH_SECRET, { expiresIn: '7d' });
  
  return { user, token };
}

// Sign in existing user
export async function signIn(email: string, password: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  
  if (!user || !user.passwordHash) {
    throw new Error('Invalid email or password');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, AUTH_SECRET, { expiresIn: '7d' });

  return { user, token };
}

// Get session from request (for server components)
export async function getAuth() {
  return {
    api: {
      getSession: async ({ headers }: { headers: Headers }) => {
        const cookie = headers.get('cookie');
        if (!cookie) return null;

        const match = cookie.match(/auth_token=([^;]+)/);
        if (!match) return null;

        try {
          const decoded = jwt.verify(match[1], AUTH_SECRET) as { userId: string; email: string };
          
          const [user] = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
          
          if (!user) return null;
          
          return {
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
            }
          };
        } catch {
          return null;
        }
      }
    }
  };
}

// Verify token (for API routes)
export function verifyToken(token: string) {
  try {
    return jwt.verify(token, AUTH_SECRET) as { userId: string; email: string };
  } catch {
    return null;
  }
}
