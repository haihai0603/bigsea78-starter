// Better Auth catch-all route - with error logging
import { auth } from '@/core/auth';

async function handleRequest(request: Request) {
  try {
    return await auth.handler(request);
  } catch (error: any) {
    console.error('[Auth Handler Error]', error);
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 5),
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export const POST = handleRequest;
export const GET = handleRequest;
