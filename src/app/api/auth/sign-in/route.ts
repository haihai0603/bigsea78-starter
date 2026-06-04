// Sign in - authenticate user
import { signIn, createAuthCookie } from '@/core/auth';
import { respData, respErr } from '@/shared/lib/resp';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return respErr('Email and password are required', 400);
    }

    const { user, token } = await signIn(email, password);

    const headers = new Headers();
    headers.set('Set-Cookie', createAuthCookie(token));
    headers.set('Content-Type', 'application/json');

    return new Response(JSON.stringify(respData({ user })), {
      status: 200,
      headers,
    });
  } catch (e: any) {
    return respErr(e.message || 'Sign in failed');
  }
}
