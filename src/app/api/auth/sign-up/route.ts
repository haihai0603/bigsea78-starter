// Sign up - create new user account
import { signUp } from '@/core/auth';
import { respErr } from '@/shared/lib/resp';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return respErr('Email and password are required', 400);
    }

    if (password.length < 6) {
      return respErr('Password must be at least 6 characters', 400);
    }

    const { user, verificationSent } = await signUp(email, password, name);

    // Auto-login: set auth cookie if user is auto-verified
    const autoVerified = !verificationSent;
    const response = NextResponse.json({
      code: 0,
      data: {
        message: verificationSent
          ? '验证邮件已发送，请查收邮箱并点击验证链接完成注册'
          : '注册成功！',
        user,
        autoVerified,
      },
    });

    if (autoVerified) {
      // Generate JWT and set cookie for auto-login
      const jwt = require('jsonwebtoken');
      const { siteConfig } = require('@/config');
      const secret = siteConfig.auth_secret || process.env.AUTH_SECRET || 'dev-secret-change-in-production';
      const token = jwt.sign(
        { sub: user.id, email: user.email, role: user.role, emailVerified: true },
        secret,
        { expiresIn: '7d' }
      );
      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });
    }

    return response;
  } catch (e: any) {
    if (e.message.includes('already registered')) {
      return respErr('Email already registered', 409);
    }
    return respErr(e.message || 'Sign up failed');
  }
}
