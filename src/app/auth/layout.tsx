import type { Metadata } from 'next';
import { site } from '@/site/config';

export const metadata: Metadata = {
  title: '用户登录',
  description: `登录${site.name}账户，管理您的订单和下载。`,
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      {children}
    </div>
  );
}
