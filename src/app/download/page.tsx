import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { getDownloadByToken, getProductById } from '@/core/db/queries';
import { DownloadButton } from './DownloadButton';

const CATEGORY_ICONS: Record<string, string> = {
  software: '💻', course: '🎓', ebook: '📖', font: '🔤', audio: '🎵', template: '📐',
};

export default async function DownloadPage({ searchParams }: { searchParams: Promise<{ token?: string; order?: string }> }) {
  const { token, order } = await searchParams;

  // No token but has order - payment pending
  if (!token && order) {
    return (
      <div className='min-h-[60vh] flex items-center justify-center'>
        <Card className='max-w-md w-full'>
          <CardHeader><CardTitle>支付处理中</CardTitle></CardHeader>
          <CardContent>
            <p className='text-muted-foreground mb-4'>您的支付正在处理中，确认后将发送下载链接到您的邮箱。</p>
            <a href='/' className='text-primary hover:underline'>返回首页</a>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!token) {
    return (
      <div className='min-h-[60vh] flex items-center justify-center'>
        <Card className='max-w-md w-full'>
          <CardHeader><CardTitle>无效的下载链接</CardTitle></CardHeader>
          <CardContent>
            <p className='text-muted-foreground mb-4'>该下载链接无效或已过期。</p>
            <a href='/' className='text-primary hover:underline'>返回首页</a>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Validate token from DB
  let download: any;
  let product: any;
  let remainingDownloads = 0;

  try {
    download = await getDownloadByToken(token);

    if (!download) {
      return (
        <div className='min-h-[60vh] flex items-center justify-center'>
          <Card className='max-w-md w-full'>
            <CardHeader><CardTitle>链接不存在</CardTitle></CardHeader>
            <CardContent>
              <p className='text-muted-foreground mb-4'>该下载链接不存在。</p>
              <a href='/' className='text-primary hover:underline'>返回首页</a>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Check expiry
    if (new Date(download.expiresAt) < new Date()) {
      return (
        <div className='min-h-[60vh] flex items-center justify-center'>
          <Card className='max-w-md w-full'>
            <CardHeader><CardTitle>链接已过期</CardTitle></CardHeader>
            <CardContent>
              <p className='text-muted-foreground mb-4'>下载链接已过期，请重新购买或联系客服。</p>
              <a href='/' className='text-primary hover:underline'>返回首页</a>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Check download count
    if (download.downloadCount >= download.maxDownloads) {
      return (
        <div className='min-h-[60vh] flex items-center justify-center'>
          <Card className='max-w-md w-full'>
            <CardHeader><CardTitle>下载次数已用完</CardTitle></CardHeader>
            <CardContent>
              <p className='text-muted-foreground mb-4'>该链接已达到最大下载次数（{download.maxDownloads}次），如需帮助请联系客服。</p>
              <a href='/' className='text-primary hover:underline'>返回首页</a>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Get product info from order
    try {
      // download.orderId is the order's ID, not orderNo
      // Need to find order by ID directly
      const { db } = await import('@/core/db');
      const { orders } = await import('@/core/db/schema');
      const { eq } = await import('drizzle-orm');
      const orderRows = await db().select().from(orders).where(eq(orders.id, download.orderId)).limit(1);
      const dbOrder = orderRows[0];
      if (dbOrder) {
        product = await getProductById(dbOrder.productId);
      }
    } catch {}

    product = product || { name: '数字产品', category: 'software' };
    remainingDownloads = download.maxDownloads - download.downloadCount - 1;

  } catch {
    return (
      <div className='min-h-[60vh] flex items-center justify-center'>
        <Card className='max-w-md w-full'>
          <CardHeader><CardTitle>系统错误</CardTitle></CardHeader>
          <CardContent>
            <p className='text-muted-foreground mb-4'>无法处理下载请求，请稍后重试。</p>
            <a href='/' className='text-primary hover:underline'>返回首页</a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-[60vh] flex items-center justify-center'>
      <Card className='max-w-md w-full'>
        <CardHeader>
          <CardTitle>下载产品</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center gap-3 p-3 bg-muted rounded-lg'>
            <span className='text-3xl'>{CATEGORY_ICONS[product?.category] || '📦'}</span>
            <div>
              <p className='font-medium'>{product?.name || '数字产品'}</p>
              <p className='text-sm text-muted-foreground'>订单号: {download?.orderId}</p>
            </div>
          </div>

          <DownloadButton token={token} />

          <div className='text-center space-y-1'>
            <p className='text-xs text-muted-foreground'>
              剩余下载次数：{remainingDownloads}次
            </p>
            <p className='text-xs text-muted-foreground'>
              链接有效期至：{download ? new Date(download.expiresAt).toLocaleString('zh-CN') : '--'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
