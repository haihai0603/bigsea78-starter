'use client';

import { Button } from '@/shared/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/shared/components/ui/sheet';
import { useState, useEffect } from 'react';
import { site } from '@/site/config';

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export function Header() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/session', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setUser(data.data?.user || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/sign-out', { method: 'POST', credentials: 'include' });
    window.location.href = '/';
  }

  if (loading) {
    return (
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <a href="/" className="text-lg font-bold">{site.name}</a>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 animate-pulse bg-muted rounded" />
          </div>
        </div>
      </header>
    );
  }

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
          {user ? (
            <>
              {user.role === 'admin' && (
                <a href='/admin/users' className='text-sm text-muted-foreground hover:text-foreground transition-colors'>管理后台</a>
              )}
              <span className='text-sm text-muted-foreground'>{user.name || user.email}</span>
              <Button variant='ghost' size='sm' onClick={handleLogout}>退出登录</Button>
            </>
          ) : (
            <>
              <Button variant='ghost' size='sm' onClick={() => { window.location.href = '/auth/login'; }}>登录</Button>
              <Button size='sm' onClick={() => { window.location.href = '/auth/register'; }}>注册</Button>
            </>
          )}

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger className="md:hidden inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 px-3">
              菜单
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
                    {user.role === 'admin' && (
                      <a href='/admin/users' className='text-base hover:text-primary'>管理后台</a>
                    )}
                    <span className="text-sm text-muted-foreground">{user.name || user.email}</span>
                    <a href='#' onClick={handleLogout} className='text-base hover:text-primary'>退出登录</a>
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
