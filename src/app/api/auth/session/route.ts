// Auth session API - get current user from JWT token
import { getCurrentUser } from '@/core/auth';
import { respData, respErr } from '@/shared/lib/resp';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
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
    return respErr(e.message);
  }
}
