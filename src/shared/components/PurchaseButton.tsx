'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';

export function PurchaseButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      });
      const json = await res.json();
      if (json.data?.checkoutUrl) {
        window.location.href = json.data.checkoutUrl;
      } else if (json.data?.free) {
        window.location.href = json.data.downloadUrl;
      } else {
        alert('创建订单失败：' + (json.error || '未知错误'));
      }
    } catch (e: any) {
      alert('网络错误：' + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size='lg' className='flex-1' onClick={handleClick} disabled={loading}>
      {loading ? '处理中...' : '立即购买'}
    </Button>
  );
}
