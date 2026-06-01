import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';

export default async function DownloadPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <Card className='max-w-md w-full'>
          <CardHeader>
            <CardTitle>无效的下载链接</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground mb-4'>该下载链接无效或已过期。</p>
            <Button onClick={() => { window.location.href = '/'; }}>返回首页</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // TODO: Validate token from DB, check expiry and download count
  return (
    <div className='min-h-screen bg-background flex items-center justify-center'>
      <Card className='max-w-md w-full'>
        <CardHeader>
          <CardTitle>下载产品</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-muted-foreground'>您的产品已准备就绪，点击下方按钮开始下载。</p>
          <Button className='w-full' size='lg'>
            立即下载
          </Button>
          <p className='text-xs text-muted-foreground text-center'>
            下载链接有效期24小时，最多可下载3次
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
