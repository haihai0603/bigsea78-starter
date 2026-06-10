'use client';

import { site } from '@/site/config';
import { Button } from '@/shared/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/shared/components/ui/sheet';
import { useState, useEffect } from 'react';

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch('/api/auth/session', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/sign-out', { method: 'POST', credentials: 'include' });
    setUser(null);
    window.location.href = '/';
  }

  // Prevent hydration mismatch: don't render user-dependent UI until after mount
  const showUserSection = mounted;

  return (
    <header className='sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container mx-auto flex h-14 items-center justify-between px-4'>
        <div className='flex items-center gap-6'>
          <a href='/' className='text-lg font-bold'>{site.name}</a>
          <nav className='hidden md:flex gap-6'>
            {site.nav.map((item) => (
              <a key={item.href} href={item.href} className='text-sm text-muted-foreground hover:text-foreground transition-colors'>
                {item.title}
              </a>
            ))}
          </nav>
        </div>
        <div className='flex items-center gap-2'>
          {showUserSection ? (
            user ? (
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
            )
          ) : null}

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className='md:hidden inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 px-3'>
              菜单
            </SheetTrigger>
            <SheetContent side='right' className='w-64'>
              <nav className='flex flex-col gap-4 mt-8'>
                {site.nav.map((item) => (
                  <a key={item.href} href={item.href} className='text-base hover:text-primary' onClick={() => setOpen(false)}>
                    {item.title}
                  </a>
                ))}
                <hr />
                {showUserSection ? (
                  user ? (
                    <>
                      {user.role === 'admin' && (
                        <a href='/admin/users' className='text-base hover:text-primary'>管理后台</a>
                      )}
                      <span className='text-sm text-muted-foreground'>{user.name || user.email}</span>
                      <a href='#' onClick={handleLogout} className='text-base hover:text-primary'>退出登录</a>
                    </>
                  ) : (
                    <>
                      <a href='/auth/login' className='text-base' onClick={() => setOpen(false)}>登录</a>
                      <a href='/auth/register' className='text-base' onClick={() => setOpen(false)}>注册</a>
                    </>
                  )
                ) : null}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
