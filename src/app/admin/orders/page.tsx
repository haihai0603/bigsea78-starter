import { getOrders, getOrderCount } from '@/core/db/queries';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  pending: { label: '待支付', className: 'text-yellow-600' },
  paid: { label: '已支付', className: 'text-green-600' },
  failed: { label: '失败', className: 'text-red-600' },
  refunded: { label: '已退款', className: 'text-gray-600' },
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageStr } = await searchParams;
  const page = parseInt(pageStr || '1', 10);
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  const [orders, total] = await Promise.all([
    getOrders({ limit: pageSize, offset }),
    getOrderCount(),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold'>订单管理</h1>

      <Card className='overflow-hidden'>
        <table className='w-full text-sm'>
          <thead className='bg-muted/50'>
            <tr>
              <th className='text-left p-3'>订单号</th>
              <th className='text-left p-3'>用户</th>
              <th className='text-left p-3'>金额</th>
              <th className='text-left p-3'>状态</th>
              <th className='text-left p-3'>支付渠道</th>
              <th className='text-left p-3'>时间</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className='text-center p-6 text-muted-foreground'>
                  暂无订单
                </td>
              </tr>
            )}
            {orders.map((order: any) => {
              const status = STATUS_MAP[order.status] || { label: order.status, className: '' };
              return (
                <tr key={order.id} className='border-t'>
                  <td className='p-3 font-mono text-xs'>{order.orderNo}</td>
                  <td className='p-3'>{order.user?.name || order.userId}</td>
                  <td className='p-3 font-medium'>
                    {order.currency === 'cny' ? '¥' : '$'}
                    {(order.amount / 100).toFixed(2)}
                  </td>
                  <td className='p-3'>
                    <span className={status.className}>{status.label}</span>
                  </td>
                  <td className='p-3 text-muted-foreground'>{order.paymentProvider || '-'}</td>
                  <td className='p-3 text-muted-foreground'>
                    {new Date(order.createdAt).toLocaleDateString('zh-CN')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex justify-center gap-2'>
          {page > 1 && (
            <Link href={`/admin/orders?page=${page - 1}`}>
              <Button variant='outline' size='sm'>上一页</Button>
            </Link>
          )}
          <span className='text-sm text-muted-foreground self-center'>
            第 {page} / {totalPages} 页
          </span>
          {page < totalPages && (
            <Link href={`/admin/orders?page=${page + 1}`}>
              <Button variant='outline' size='sm'>下一页</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
