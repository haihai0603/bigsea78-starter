// 创建测试用户（仅开发/Vercel临时用，创建后删除此文件）
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/core/db';
import { users } from '@/core/db/schema';
import { eq } from 'drizzle-orm';

export async function POST() {
  // 简单密码保护
  const authHeader = null; // 暂时无保护，快速验证用
  
  const TEST_EMAIL = 'bigsea@bigsea78.top';
  const TEST_PASSWORD = 'Bigsea78!';
  const TEST_NAME = 'BigSea78管理员';

  try {
    // 检查是否已存在
    const existing = await db().select().from(users).where(eq(users.email, TEST_EMAIL)).limit(1);
    
    if (existing.length > 0) {
      // 已有则返回成功（已创建过）
      return NextResponse.json({ 
        code: 0, 
        message: '测试用户已存在',
        email: TEST_EMAIL,
        note: '直接登录即可，无需重新创建'
      });
    }

    // 创建用户（已验证邮箱，跳过邮件）
    const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);
    const [newUser] = await db().insert(users).values({
      id: crypto.randomUUID(),
      email: TEST_EMAIL,
      name: TEST_NAME,
      passwordHash,
      role: 'admin',
      emailVerified: true, // 直接标记已验证，跳过邮件
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    // 直接返回登录 token
    const jwt = await import('jsonwebtoken');
    const token = jwt.default.sign(
      { sub: newUser.id, email: newUser.email, role: newUser.role },
      process.env.AUTH_SECRET || 'dev-secret',
      { expiresIn: '30d' }
    );

    const response = NextResponse.json({ 
      code: 0, 
      message: '测试用户创建成功',
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      token,
      nextStep: '使用 token 访问 /api/auth/session 或在浏览器登录'
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (e: any) {
    console.error('[CreateTestUser] error:', e);
    return NextResponse.json({ code: 500, message: e.message }, { status: 500 });
  }
}
