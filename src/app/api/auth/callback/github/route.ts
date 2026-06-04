// GitHub OAuth callback
import { NextResponse } from 'next/server';
import { siteConfig } from '@/config';
import { db } from '@/core/db';
import { users } from '@/core/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const JWT_SECRET = siteConfig.auth_secret || process.env.AUTH_SECRET || 'dev-secret-change-in-production';

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
}

async function exchangeCodeForToken(code: string): Promise<string> {
  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: siteConfig.github_client_id,
      client_secret: siteConfig.github_client_secret,
      code,
      redirect_uri: `${siteConfig.app_url}/api/auth/callback/github`,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error_description || data.error);
  return data.access_token;
}

async function getGitHubUser(accessToken: string): Promise<GitHubUser> {
  const res = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github.v3+json' },
  });
  if (!res.ok) throw new Error('Failed to fetch GitHub user');
  return res.json();
}

async function getGitHubEmails(accessToken: string): Promise<GitHubEmail[]> {
  const res = await fetch('https://api.github.com/user/emails', {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github.v3+json' },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('[GitHub OAuth] error from GitHub:', error, searchParams.get('error_description'));
    return NextResponse.redirect(`${siteConfig.app_url}/auth/login?error=oauth_cancelled`);
  }

  if (!code) {
    return NextResponse.redirect(`${siteConfig.app_url}/auth/login?error=missing_code`);
  }

  try {
    // 1. Exchange code for access token
    const accessToken = await exchangeCodeForToken(code);

    // 2. Get GitHub user info
    const githubUser = await getGitHubUser(accessToken);

    // 3. Get primary email
    let email = githubUser.email;
    if (!email) {
      const emails = await getGitHubEmails(accessToken);
      const primary = emails.find((e: GitHubEmail) => e.primary && e.verified) || emails.find((e: GitHubEmail) => e.verified);
      email = primary?.email || emails[0]?.email;
    }
    if (!email) throw new Error('No email found from GitHub');

    // 4. Find or create user in DB
    const existing = await db().select().from(users).where(eq(users.email, email)).limit(1);

    let user;
    if (existing.length > 0) {
      user = existing[0];
      // Update name/avatar if changed
      await db()
        .update(users)
        .set({ name: githubUser.name || githubUser.login, updatedAt: new Date() })
        .where(eq(users.id, user.id));
      const refreshed = await db().select().from(users).where(eq(users.id, user.id)).limit(1);
      user = refreshed[0];
    } else {
      const [newUser] = await db()
        .insert(users)
        .values({
          id: crypto.randomUUID(),
          email,
          name: githubUser.name || githubUser.login,
          passwordHash: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10),
          role: 'user',
          emailVerified: true, // GitHub emails are pre-verified
          verifyToken: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      user = newUser;
    }

    // 5. Issue JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 6. Set cookie and redirect
    const response = NextResponse.redirect(`${siteConfig.app_url}/`);
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    console.log('[GitHub OAuth] success, user:', email);
    return response;
  } catch (e: any) {
    console.error('[GitHub OAuth] error:', e.message, e.stack);
    return NextResponse.redirect(`${siteConfig.app_url}/auth/login?error=oauth_failed`);
  }
}
