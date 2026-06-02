import { getProducts } from '@/core/db/queries';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';

export default async function AdminProductsPage() {
  const products = await getProducts({ limit: 100 });

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>产品管理</h1>
        <Link href='/admin/products/new'>
          <Button>新增产品</Button>
        </Link>
      </div>

      <Card className='overflow-hidden'>
        <table className='w-full text-sm'>
          <thead className='bg-muted/50'>
            <tr>
              <th className='text-left p-3'>名称</th>
              <th className='text-left p-3'>分类</th>
              <th className='text-left p-3'>价格</th>
              <th className='text-left p-3'>状态</th>
              <th className='text-left p-3'>创建时间</th>
              <th className='text-right p-3'>操作</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className='text-center p-6 text-muted-foreground'>
                  暂无产品，<Link href='/admin/products/new' className='text-primary underline'>点击新增</Link>
                </td>
              </tr>
            )}
            {products.map((product: any) => (
              <tr key={product.id} className='border-t'>
                <td className='p-3 font-medium'>{product.name}</td>
                <td className='p-3 text-muted-foreground'>{product.category || '-'}</td>
                <td className='p-3'>
                  {product.price === 0 ? (
                    <span className='text-green-600'>免费</span>
                  ) : (
                    `¥${(product.price / 100).toFixed(2)}`
                  )}
                </td>
                <td className='p-3'>
                  <span className={product.active ? 'text-green-600' : 'text-muted-foreground'}>
                    {product.active ? '上架' : '下架'}
                  </span>
                </td>
                <td className='p-3 text-muted-foreground'>
                  {new Date(product.createdAt).toLocaleDateString('zh-CN')}
                </td>
                <td className='p-3 text-right space-x-2'>
                  <Link href={`/admin/products/${product.id}`}>
                    <Button variant='outline' size='sm'>编辑</Button>
                  </Link>
                  <form action={`/api/products/${product.id}/delete`} method='POST' className='inline'>
                    <Button variant='ghost' size='sm' className='text-destructive'>删除</Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
