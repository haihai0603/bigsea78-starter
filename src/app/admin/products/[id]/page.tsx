import { getProductById } from '@/core/db/queries';
import { ProductForm } from '@/shared/components/admin/ProductForm';
import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>编辑产品</h1>
        <Link href='/admin/products'>
          <Button variant='outline'>返回列表</Button>
        </Link>
      </div>

      <ProductForm product={product} />
    </div>
  );
}
