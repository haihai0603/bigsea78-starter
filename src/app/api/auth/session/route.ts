// Auth session API - get current user from JWT token
import { getCurrentUser } from '@/core/auth';
import { respData, respErr } from '@/shared/lib/resp';

export async function GET(request: Request) {
  try {
    const cookie = request.headers.get('cookie') || '';
    console.log('[Session] cookie header:', cookie.substring(0, 100));
    const user = await getCurrentUser(request);
    console.log('[Session] getCurrentUser result:', user?.email || null);
    if (!user) {
      return respData({ user: null, session: null });
    }
    return respData({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        image: null,
        role: user.role,
      },
      session: { user },
    });
  } catch (e: any) {
    console.error('[Session] error:', e);
    return respErr(e.message);
  }
}
