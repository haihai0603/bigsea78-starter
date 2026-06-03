import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { getProductById, getProducts } from '@/core/db/queries';
import { site } from '@/site/config';

const CATEGORY_ICONS: Record<string, string> = {
  software: '💻', course: '🎓', ebook: '📖', font: '🔤', audio: '🎵', template: '📐',
};

export const revalidate = 60;

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let product = null;
  try {
    product = await getProductById(id) as any;
  } catch (e) {
    console.error('DB error:', e);
  }

  if (!product) notFound();

  // Related products
  let related: any[] = [];
  try {
    const all = await getProducts({ category: product.category, active: true, limit: 4 });
    related = all.filter((p: any) => p.id !== product.id).slice(0, 3);
  } catch {}

  const highlights: string[] = product.metadata?.highlights ?? [];
  const categoryName = site.categories.find((c: any) => c.id === product.category)?.name || product.category;

  return (
    <div className='container mx-auto px-4 py-10'>
      <div className='grid md:grid-cols-2 gap-10'>
        {/* Left: Cover */}
        <div className='aspect-square bg-muted rounded-lg flex items-center justify-center text-8xl'>
          {CATEGORY_ICONS[product.category] || '📦'}
        </div>

        {/* Right: Details */}
        <div className='space-y-6'>
          <div>
            <Badge variant='secondary'>{categoryName}</Badge>
            <h1 className='text-3xl font-bold mt-2'>{product.name}</h1>
          </div>

          <div className='text-4xl font-bold'>
            {product.price === 0 ? '免费' : `¥${(product.price / 100).toFixed(0)}`}
            {product.price > 0 && (
              <span className='text-base font-normal text-muted-foreground ml-2'>一次性付费</span>
            )}
          </div>

          {highlights.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {highlights.map((h: string) => (
                <Badge key={h} variant='outline'>{h}</Badge>
              ))}
            </div>
          )}

          <div className='flex gap-3'>
            {product.price === 0 ? (
              <Link href={`/api/auth/sign-up/email?callbackUrl=/api/download?product_id=${product.id}`}>
                <Button size='lg' className='flex-1'>免费下载</Button>
              </Link>
            ) : (
              <Link href={`/api/payment/checkout?product_id=${product.id}`}>
                <Button size='lg' className='flex-1'>立即购买</Button>
              </Link>
            )}
          </div>

          <Separator />

          <div className='space-y-3 text-sm'>
            <div className='flex items-center gap-2'>
              <span className='text-green-600'>✓</span> 永久使用权
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-green-600'>✓</span> 免费更新
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-green-600'>✓</span> 购买后即时下载
            </div>
          </div>

          <Separator />

          {product.description && (
            <div className='prose prose-sm max-w-none'>
              <h3>产品介绍</h3>
              <p className='whitespace-pre-line text-muted-foreground'>{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className='mt-16'>
          <h3 className='text-2xl font-bold mb-6'>相关产品</h3>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
            {related.map((p: any) => (
              <Link key={p.id} href={`/product/${p.id}`}>
                <div className='border rounded-lg p-4 hover:shadow-md transition-shadow h-full flex flex-col'>
                  <h4 className='font-semibold text-base mb-2'>{p.name}</h4>
                  <p className='text-sm text-muted-foreground flex-1 line-clamp-2'>{p.description || '暂无描述'}</p>
                  <div className='mt-3 font-bold'>
                    {p.price === 0 ? '免费' : `¥${(p.price / 100).toFixed(0)}`}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
