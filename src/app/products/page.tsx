import { getProducts } from '@/core/db/queries';
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
