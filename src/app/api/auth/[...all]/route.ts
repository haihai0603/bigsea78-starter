// Better Auth catch-all route
import { getAuth } from '@/core/auth';

export async function POST(request: Request) {
  const auth = await getAuth();
  return auth.handler(request);
}

export async function GET(request: Request) {
  const auth = await getAuth();
  return auth.handler(request);
}
