'use client';

import { Button } from '@/shared/components/ui/button';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const LazySheet = dynamic(
  () => import('@/shared/components/ui/sheet').then(mod => ({ default: mod.Sheet })),
  { ssr: false }
);
const LazySheetContent = dynamic(
  () => import('@/shared/components/ui/sheet').then(mod => ({ default: mod.SheetContent })),
  { ssr: false }
);

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export default function HeaderClient({ user }: { user: AuthUser | null }) {
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await fetch('/api/auth/sign-out', { method: 'POST', credentials: 'include' });
    window.location.href = '/';
  }

  return (
    <>
      {user ? (
        <>
          {user.role === 'admin' || user.email === 'bigsea78@outlook.com' && (
            <Button variant='ghost' size='sm' onClick={() => { window.location.href = '/admin/users'; }}>管理后台</Button>
          )}
          <span className='text-sm text-muted-foreground hidden sm:inline'>{user.name || user.email}</span>
          <Button variant='ghost' size='sm' onClick={handleLogout}>退出</Button>
        </>
      ) : (
        <>
          <Button variant='ghost' size='sm' onClick={() => { window.location.href = '/auth/login'; }}>登录</Button>
          <Button size='sm' onClick={() => { window.location.href = '/auth/register'; }}>注册</Button>
        </>
      )}

      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden"
        onClick={() => setMenuOpen(true)}
      >
        ☰
      </Button>

      {/* Lazy-loaded mobile sheet */}
      {menuOpen && (
        <LazySheet open={menuOpen} onOpenChange={setMenuOpen}>
          <LazySheetContent side="right" className="w-64">
            <nav className="flex flex-col gap-4 mt-8">
              {user ? (
                <>
                  <span className="text-sm text-muted-foreground">{user.name || user.email}</span>
                  <button onClick={handleLogout} className='text-base text-left hover:text-primary'>退出登录</button>
                </>
              ) : (
                <>
                  <a href="/auth/login" className="text-base">登录</a>
                  <a href="/auth/register" className="text-base">注册</a>
                </>
              )}
            </nav>
          </LazySheetContent>
        </LazySheet>
      )}
    </>
  );
}
