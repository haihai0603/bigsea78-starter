'use client';

import { Button } from '@/shared/components/ui/button';
import { useState } from 'react';

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface HeaderClientProps {
  user: AuthUser | null;
}

export default function HeaderClient({ user }: HeaderClientProps) {
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await fetch('/api/auth/sign-out', { method: 'POST', credentials: 'include' });
    window.location.href = '/';
  }

  return (
    <>
      {user ? (
        <>
          {user.role === 'admin' && (
            <Button variant='ghost' size='sm' onClick={() => { window.location.href = '/admin/users'; }}>管理后台</Button>
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
    </>
  );
}
