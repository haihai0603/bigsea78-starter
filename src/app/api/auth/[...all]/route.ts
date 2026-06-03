// Better Auth catch-all route - with error capture
export async function POST(request: Request) {
  try {
    const { auth } = await import('@/core/auth');
    return auth.handler(request);
  } catch (error: any) {
    console.error('[Auth POST Error]', error);
    return new Response(JSON.stringify({ error: error.message, stack: error.stack?.split('\n').slice(0, 5) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET(request: Request) {
  try {
    const { auth } = await import('@/core/auth');
    return auth.handler(request);
  } catch (error: any) {
    console.error('[Auth GET Error]', error);
    return new Response(JSON.stringify({ error: error.message, stack: error.stack?.split('\n').slice(0, 5) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
