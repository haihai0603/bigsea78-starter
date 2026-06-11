import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { site } from '@/site/config';
import { getProducts } from '@/core/db/queries';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '定价方案',
  description: `查看${site.name}的全部产品定价，一次性付费，永久使用，免费更新。`,
};

export const revalidate = 60;

export default async function PricingPage() {
  let products: any[] = [];
  try {
    products = await getProducts({ active: true, limit: 12 });
  } catch {
    // DB not configured, show empty state
  }

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 py-20'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold'>所有产品</h1>
          <p className='mt-4 text-lg text-muted-foreground'>选择适合您的数字商品</p>
        </div>

        {products.length === 0 ? (
          <p className='text-center text-muted-foreground py-20'>暂无产品，请先在管理后台添加。</p>
        ) : (
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto'>
            {products.map((product) => (
              <Card key={product.id} className='flex flex-col'>
                <CardHeader>
                  <div className='flex items-center gap-2'>
                    <CardTitle className='text-lg'>{product.name}</CardTitle>
                    {product.price === 0 && <Badge variant='secondary'>免费</Badge>}
                  </div>
                  {product.category && (
                    <p className='text-sm text-muted-foreground'>
                      {site.categories.find(c => c.id === product.category)?.name || product.category}
                    </p>
                  )}
                </CardHeader>
                <CardContent className='flex-1'>
                  <p className='text-sm text-muted-foreground line-clamp-3'>
                    {product.description || '暂无描述'}
                  </p>
                </CardContent>
                <CardFooter className='flex items-center justify-between'>
                  <span className='text-xl font-bold'>
                    {product.price === 0 ? '免费' : `¥${(product.price / 100).toFixed(0)}`}
                  </span>
                  <Link href={`/product/${product.id}`}>
                    <Button variant={product.price === 0 ? 'outline' : 'default'} size='sm'>
                      {product.price === 0 ? '免费获取' : '查看详情'}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
