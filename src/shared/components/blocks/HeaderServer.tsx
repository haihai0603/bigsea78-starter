import { cookies } from 'next/headers';
import { site } from '@/site/config';
import { Button } from '@/shared/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/shared/components/ui/sheet';
import HeaderClient from './HeaderClient';
import { verifyToken, getUserById } from '@/core/auth';

async function getUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    const userId = payload.id;
    if (!userId) return null;

    const user = await getUserById(userId);
    if (!user || !user.emailVerified) return null;

    return user;
  } catch (e) {
    console.error('[getUser] error:', e);
    return null;
  }
}

export async function Header() {
  const user = await getUser();

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

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger>
              <Button variant="ghost" size="sm" className="md:hidden">菜单</Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="flex flex-col gap-4 mt-8">
                {site.nav.map((item) => (
                  <a key={item.href} href={item.href} className="text-base hover:text-primary">
                    {item.title}
                  </a>
                ))}
                <hr />
                {user ? (
                  <>
                    <span className="text-sm text-muted-foreground">{user.name || user.email}</span>
                    <form action="/api/auth/sign-out" method="POST">
                      <Button variant="ghost" size="sm" className="justify-start px-0" type="submit">退出登录</Button>
                    </form>
                  </>
                ) : (
                  <>
                    <a href="/auth/login" className="text-base">登录</a>
                    <a href="/auth/register" className="text-base">注册</a>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
