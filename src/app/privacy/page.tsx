import type { Metadata } from 'next';
import { site } from '@/site/config';

export const metadata: Metadata = {
  title: '隐私政策',
  description: `了解${site.name}如何保护您的个人信息。`,
};

export default function PrivacyPage() {
  return (
    <div className='container mx-auto py-12 max-w-3xl'>
      <h1 className='text-3xl font-bold mb-4'>隐私政策</h1>
      <p className='text-muted-foreground'>隐私政策页面建设中...</p>
    </div>
  );
}
