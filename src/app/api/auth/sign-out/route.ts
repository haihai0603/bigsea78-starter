import { respData } from '@/shared/lib/resp';

export async function POST() {
  const headers = new Headers();
  headers.append('Set-Cookie', 'auth_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');

  return respData({ success: true }, headers);
}
