// Sign up - create new user account
import { signUp } from '@/core/auth';
import { respData, respErr } from '@/shared/lib/resp';

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

    const user = await signUp(email, password, name);
    return respData({ user });
  } catch (e: any) {
    if (e.message.includes('already registered')) {
      return respErr('Email already registered', 409);
    }
    return respErr(e.message || 'Sign up failed');
  }
}
