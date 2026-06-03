// Better Auth catch-all route - with lazy loading and error logging
async function handleRequest(request: Request) {
  try {
    const { auth } = await import('@/core/auth');
    return await auth.handler(request);
  } catch (error: any) {
    console.error('[Auth Handler Error]', error);
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 10),
      name: error.name,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export const POST = handleRequest;
export const GET = handleRequest;
