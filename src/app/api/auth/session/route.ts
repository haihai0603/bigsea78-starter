// Auth session API - get current session (for client-side auth checks)
import { getAuth } from '@/core/auth';
import { respData, respErr } from '@/shared/lib/resp';

export async function GET(request: Request) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return respData({ user: null, session: null });
    }
    return respData({ user: session.user, session: session.session });
  } catch (e: any) {
    return respErr(e.message);
  }
}
