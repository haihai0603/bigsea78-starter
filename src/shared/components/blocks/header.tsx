'use client';

import { site } from '@/site/config';
import { Button } from '@/shared/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/shared/components/ui/sheet';
import { useState } from 'react';

const CATEGORY_ICONS: Record<string, string> = {
  software: '💻', course: '🎓', ebook: '📖', font: '🔤', audio: '🎵', template: '📐',
};

export function Header() {
  const [open, setOpen] = useState(false);

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
          <Button variant='ghost' size='sm' onClick={() => { window.location.href = '/auth/login'; }}>登录</Button>
          <Button size='sm' onClick={() => { window.location.href = '/auth/register'; }}>注册</Button>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger>
              <Button variant='ghost' size='sm' className='md:hidden'>☰</Button>
            </SheetTrigger>
            <SheetContent side='right' className='w-64'>
              <nav className='flex flex-col gap-4 mt-8'>
                {site.nav.map((item) => (
                  <a key={item.href} href={item.href} className='text-base hover:text-primary' onClick={() => setOpen(false)}>
                    {item.title}
                  </a>
                ))}
                <hr />
                <a href='/auth/login' className='text-base' onClick={() => setOpen(false)}>登录</a>
                <a href='/auth/register' className='text-base' onClick={() => setOpen(false)}>注册</a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
