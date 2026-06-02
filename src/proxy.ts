import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  '/',
  '/about',
  '/pricing',
  '/privacy',
  '/refund',
  '/auth/login',
  '/auth/register',
  '/product',
  '/download',
];

// Paths that require admin role
const ADMIN_PATHS = ['/admin'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow API auth routes (Better Auth handles its own auth)
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    // For /admin, check auth cookie
    if (ADMIN_PATHS.some(p => pathname.startsWith(p))) {
      // Better Auth sets a session cookie
      const sessionCookie = request.cookies.get('better-auth.session_token');
      if (!sessionCookie) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }
      // TODO: Verify session and check admin role
      // For now, just check cookie existence
    }
    return NextResponse.next();
  }

  // For API routes, let them handle their own auth
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Static files
  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
