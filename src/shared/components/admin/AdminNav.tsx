'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/lib/utils';

const navItems = [
  { href: '/admin', label: '仪表盘', icon: '📊' },
  { href: '/admin/products', label: '产品管理', icon: '📦' },
  { href: '/admin/orders', label: '订单管理', icon: '📋' },
  { href: '/admin/users', label: '用户管理', icon: '👥' },
  { href: '/admin/settings', label: '系统设置', icon: '⚙️' },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className='space-y-1'>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
            pathname === item.href
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted'
          )}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
