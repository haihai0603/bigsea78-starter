// Sign in - authenticate user
import { signIn } from '@/core/auth';
import { respData, respErr } from '@/shared/lib/resp';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return respErr('Email and password are required', 400);
    }

    const { user, token } = await signIn(email, password);

    const response = respData({ user });
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
