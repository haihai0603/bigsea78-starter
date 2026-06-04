// Verify email address via token
import { respData, respErr } from '@/shared/lib/resp';
import { db } from '@/core/db';
import { users } from '@/core/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { siteConfig } from '@/config';

const JWT_SECRET = siteConfig.auth_secret || process.env.AUTH_SECRET || 'dev-secret-change-in-production';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return respErr('缺少验证令牌', 400);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.purpose !== 'verify') {
      return respErr('无效的验证令牌', 400);
    }

    const email = decoded.email;

    // Find user by email
    const [user] = await db().select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) {
      return respErr('用户不存在', 404);
    }

    // Already verified?
    if (user.emailVerified) {
      return new Response(null, {
        status: 302,
        headers: { Location: '/auth/login?verified=already' },
      });
    }

    // Update user
    await db()
      .update(users)
      .set({ emailVerified: true, verifyToken: null, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    // Redirect to login with success message
    return new Response(null, {
      status: 302,
      headers: { Location: '/auth/login?verified=success' },
    });
  } catch (error) {
    return respErr('验证令牌已过期或无效，请重新注册', 400);
  }
}
