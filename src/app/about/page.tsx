import type { Metadata } from 'next';
import { site } from '@/site/config';

export const metadata: Metadata = {
  title: '关于我们',
  description: `了解${site.name}的故事，我们致力于为用户提供优质的数字商品和服务。`,
};

export default function AboutPage() {
  return (
    <div className='container mx-auto py-12 max-w-3xl'>
      <h1 className='text-3xl font-bold mb-4'>关于我们</h1>
      <p className='text-muted-foreground'>BigSea78 是数字商品平台，提供课程、软件、电子书、字体、音频等资源。</p>
    </div>
  );
}
