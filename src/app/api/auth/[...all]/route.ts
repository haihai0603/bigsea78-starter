// Auth catch-all route - simple JWT auth
import { NextRequest, NextResponse } from 'next/server';
import { signUp, signIn, verifyToken, createAuthCookie } from '@/core/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Determine if sign-up or sign-in based on URL
    const url = new URL(request.url);
    const path = url.pathname;

    if (path.includes('/sign-up') || path.includes('/register')) {
      const user = await signUp(email, password, name);
      return NextResponse.json({ user, message: 'Registration successful' });
    }

    if (path.includes('/sign-in') || path.includes('/login')) {
      const { user, token } = await signIn(email, password);
      const response = NextResponse.json({ user, message: 'Login successful' });
      response.headers.set('Set-Cookie', createAuthCookie(token));
      return response;
    }

    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 404 });
  } catch (error: any) {
    console.error('[Auth POST Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ user: null });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('[Auth GET Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
