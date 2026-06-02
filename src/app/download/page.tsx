import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { getDownloadByToken, incrementDownloadCount, getOrderByNo } from '@/core/db/queries';
import { getProductById } from '@/core/db/queries';
import { getPresignedDownloadUrl } from '@/extensions/storage/r2';
import { site } from '@/site/config';

const CATEGORY_ICONS: Record<string, string> = {
  software: '💻', course: '🎓', ebook: '📖', font: '🔤', audio: '🎵', template: '📐',
};

export default async function DownloadPage({ searchParams }: { searchParams: Promise<{ token?: string; order?: string }> }) {
  const { token, order } = await searchParams;

  // If no token but has order, show pending message
  if (!token && order) {
    return (
      <div className='min-h-[60vh] flex items-center justify-center'>
        <Card className='max-w-md w-full'>
          <CardHeader>
            <CardTitle>支付处理中</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground mb-4'>您的支付正在处理中，确认后将发送下载链接到您的邮箱。</p>
            <Button onClick={() => window.location.href = '/'}>返回首页</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!token) {
    return (
      <div className='min-h-[60vh] flex items-center justify-center'>
        <Card className='max-w-md w-full'>
          <CardHeader>
            <CardTitle>无效的下载链接</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground mb-4'>该下载链接无效或已过期。</p>
            <Button onClick={() => window.location.href = '/'}>返回首页</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Validate token from DB
  let download: any;
  let product: any;
  let downloadUrl: string | null = null;

  try {
    download = await getDownloadByToken(token);

    if (!download) {
      return (
        <div className='min-h-[60vh] flex items-center justify-center'>
          <Card className='max-w-md w-full'>
            <CardHeader><CardTitle>链接不存在</CardTitle></CardHeader>
            <CardContent>
              <p className='text-muted-foreground mb-4'>该下载链接不存在。</p>
              <Button onClick={() => window.location.href = '/'}>返回首页</Button>
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
              <Button onClick={() => window.location.href = '/'}>返回首页</Button>
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
              <Button onClick={() => window.location.href = '/'}>返回首页</Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Get order → product → download URL
    const order = await getOrderByNo(
      (await import('@/core/db/queries')).getOrderByNo.name // just get order from download
    );

    // Simplified: get product info
    // For now, use a simple approach
    product = { name: '数字产品', category: 'software', downloadUrl: '' };

    // Increment download count
    await incrementDownloadCount(token);

  } catch (err) {
    // DB not configured or error - show mock download
    downloadUrl = null;
  }

  const remainingDownloads = download ? download.maxDownloads - download.downloadCount - 1 : 0;

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

          <Button
            className='w-full'
            size='lg'
            onClick={async () => {
              try {
                // Call download API to get presigned URL
                const res = await fetch('/api/download?token=' + token);
                const data = await res.json();
                if (data.data?.url) {
                  window.location.href = data.data.url;
                }
              } catch {
                alert('下载失败，请稍后重试');
              }
            }}
          >
            立即下载
          </Button>

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
