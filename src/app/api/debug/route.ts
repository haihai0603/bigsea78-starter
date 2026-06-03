// Debug endpoint - check env vars (REMOVE IN PRODUCTION)
import { NextResponse } from 'next/server';

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  const authSecret = process.env.AUTH_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  
  return NextResponse.json({
    DATABASE_URL: dbUrl ? `${dbUrl.substring(0, 20)}...(${dbUrl.length} chars)` : 'MISSING',
    AUTH_SECRET: authSecret ? `${authSecret.substring(0, 5)}...(${authSecret.length} chars)` : 'MISSING',
    NEXT_PUBLIC_APP_URL: appUrl || 'MISSING',
    allEnvKeys: Object.keys(process.env).filter(k => !k.startsWith('npm_') && !k.startsWith('_')).sort(),
  });
}
