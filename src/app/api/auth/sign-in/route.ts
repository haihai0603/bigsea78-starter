// Sign in - authenticate user
import { signIn } from '@/core/auth';
import { respErr } from '@/shared/lib/resp';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return respErr('Email and password are required', 400);
    }

    const { user, token } = await signIn(email, password);

    const response = NextResponse.json({ code: 0, data: { user } });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
    return response;
  } catch (e: any) {
    return respErr(e.message || 'Sign in failed');
  }
}
