'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';

interface PayButtonProps {
  productId: string;
  productName: string;
}

export function PayButton({ productId, productName }: PayButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [orderInfo, setOrderInfo] = useState<{
    orderNo: string;
    wechatPayQR: string;
    amountYuan: string;
  } | null>(null);
  const [notifyStatus, setNotifyStatus] = useState<'idle' | 'loading' | 'sent'>('idle');
  const [error, setError] = useState('');

  async function handleBuy() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '创建订单失败');
        return;
      }
      if (data.data?.free) {
        window.location.href = data.data.downloadUrl;
        return;
      }
      setOrderInfo(data.data);
      setShowQR(true);
    } catch (e) {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  }

  async function handlePaid() {
    if (!orderInfo) return;
    setNotifyStatus('loading');
    try {
      const res = await fetch('/api/payment/pay-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNo: orderInfo.orderNo }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotifyStatus('sent');
      } else {
        setError(data.error || '通知失败');
        setNotifyStatus('idle');
      }
    } catch {
      setError('网络错误，请重试');
      setNotifyStatus('idle');
    }
  }

  if (showQR && orderInfo) {
    return (
      <div className="border rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-bold text-center">微信扫码支付</h3>
        <p className="text-center text-sm text-muted-foreground">
          请使用微信扫描下方收款码支付 <strong className="text-primary">¥{orderInfo.amountYuan}</strong>
        </p>
        <div className="flex justify-center">
          <img
            src={orderInfo.wechatPayQR}
            alt="微信收款码"
            className="w-48 h-48 border rounded"
          />
        </div>
        <p className="text-center text-xs text-muted-foreground">
          订单号：{orderInfo.orderNo}
        </p>

        {notifyStatus === 'sent' ? (
          <div className="text-center space-y-2">
            <p className="text-green-600 font-semibold">✅ 已通知管理员</p>
            <p className="text-sm text-muted-foreground">管理员确认收款后，下载链接将发送到您的注册邮箱</p>
          </div>
        ) : (
          <Button
            size="lg"
            className="w-full"
            onClick={handlePaid}
            disabled={notifyStatus === 'loading'}
          >
            {notifyStatus === 'loading' ? '提交中...' : '我已完成付款'}
          </Button>
        )}

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button size="lg" className="w-full" onClick={handleBuy} disabled={loading}>
        {loading ? '处理中...' : '立即购买'}
      </Button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
