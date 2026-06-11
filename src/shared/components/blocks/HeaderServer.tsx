import { site } from '@/site/config';
import { cookies } from 'next/headers';
import HeaderClient from './HeaderClient';

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

async function getSessionUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;

    const { verifyToken } = await import('@/core/auth');
    const payload = verifyToken(token);
    if (!payload) return null;

    return {
      id: payload.id,
      email: payload.email,
      name: payload.name || null,
      role: payload.role || 'user',
    };
  } catch {
    return null;
  }
}

export async function Header() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <a href="/" className="text-lg font-bold">{site.name}</a>
          <nav className="hidden md:flex gap-6">
            {site.nav.map((item) => (
              <a key={item.href} href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {item.title}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <HeaderClient user={user} />
        </div>
      </div>
    </header>
  );
}
