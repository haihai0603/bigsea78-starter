import { ProductForm } from '@/shared/components/admin/ProductForm';
import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';

export default function NewProductPage() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>新增产品</h1>
        <Link href='/admin/products'>
          <Button variant='outline'>返回列表</Button>
        </Link>
      </div>

      <ProductForm />
    </div>
  );
}
