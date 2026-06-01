import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';

// TODO: Fetch from DB
const MOCK = { id: '1', name: 'AI写作助手', description: '智能文案生成工具，支持多种风格和语言。基于先进的大语言模型，为您提供专业的文案创作体验。', price: 9900, category: 'software' };

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = MOCK; // TODO: await getProductById(id)

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 py-10'>
        <div className='grid lg:grid-cols-2 gap-10'>
          {/* Left - Product image/preview */}
          <div className='aspect-square bg-muted rounded-xl flex items-center justify-center text-6xl'>
            💻
          </div>
          {/* Right - Product info */}
          <div className='flex flex-col gap-6'>
            <div>
              <Badge variant='secondary' className='mb-2'>{product.category}</Badge>
              <h1 className='text-3xl font-bold'>{product.name}</h1>
            </div>
            <p className='text-muted-foreground text-lg'>{product.description}</p>
            <Separator />
            <div className='flex items-center gap-4'>
              <span className='text-3xl font-bold'>¥{(product.price / 100).toFixed(2)}</span>
              <Button size='lg' className='flex-1'>立即购买</Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>产品特点</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2 text-sm text-muted-foreground'>
                  <li>✅ 永久使用权</li>
                  <li>✅ 免费更新</li>
                  <li>✅ 3次下载机会</li>
                  <li>✅ 邮件发送下载链接</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
