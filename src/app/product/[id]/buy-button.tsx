'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';

export function BuyButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (e) {
      console.error('Checkout failed:', e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="lg" className="flex-1" onClick={handleClick} disabled={loading}>
      {loading ? '处理中...' : '立即购买'}
    </Button>
  );
}
