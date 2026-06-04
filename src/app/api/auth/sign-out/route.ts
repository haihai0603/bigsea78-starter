import { respData } from '@/shared/lib/resp';
import { serialize } from 'cookie';

export async function POST() {
  const headers = new Headers();
  headers.append(
    'Set-Cookie',
    serialize('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
    })
  );

  return respData({ success: true }, headers);
}
