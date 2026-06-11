import type { Metadata } from 'next';
import { site } from '@/site/config';

export const metadata: Metadata = {
  title: '退款政策',
  description: `${site.name}退款政策说明，购买后7天内可申请退款。`,
};

export default function RefundPage() {
  return (
    <div className='container mx-auto py-12 max-w-3xl'>
      <h1 className='text-3xl font-bold mb-4'>退款政策</h1>
      <p className='text-muted-foreground'>退款政策页面建设中...</p>
    </div>
  );
}
