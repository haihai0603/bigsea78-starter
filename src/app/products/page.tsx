import { getProducts } from '@/core/db/queries';
import { site } from '@/site/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '所有产品',
  description: `浏览${site.name}的全部数字商品，包括软件、课程、电子书、字体等优质资源。`,
};
import { ProductCard } from '@/shared/components/ProductCard';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const products = await getProducts({ limit: 50, offset: 0 });

  return (
    <div className='container mx-auto py-12'>
      <h1 className='text-3xl font-bold mb-8'>所有产品</h1>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
