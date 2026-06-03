import { getDashboardStats, getRecentOrders } from '@/core/db/queries';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';

export default async function AdminDashboard() {
  const stats = await getDashboardStats();
  const recentOrders = await getRecentOrders(5);

  const statCards = [
    { label: '产品总数', value: stats.productCount, icon: '📦', href: '/admin/products' },
    { label: '订单总数', value: stats.orderCount, icon: '📋', href: '/admin/orders' },
    { label: '用户总数', value: stats.userCount, icon: '👥', href: '/admin/users' },
    { label: '总收入', value: '¥0.00', icon: '💰', href: '/admin/orders' },
  ];

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold'>仪表盘</h1>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {statCards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className='p-4 hover:shadow-md transition-shadow cursor-pointer'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>{card.label}</p>
                  <p className='text-2xl font-bold mt-1'>{card.value}</p>
                </div>
                <span className='text-3xl'>{card.icon}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className='flex gap-3 flex-wrap'>
        <Link href='/admin/products/new'>
          <Button>新增产品</Button>
        </Link>
        <Link href='/admin/settings'>
          <Button variant='outline'>系统设置</Button>
        </Link>
      </div>

      {/* Recent Orders */}
      <div>
        <h2 className='text-xl font-semibold mb-4'>最近订单</h2>
        <Card className='overflow-hidden'>
          <table className='w-full text-sm'>
            <thead className='bg-muted/50'>
              <tr>
                <th className='text-left p-3'>订单号</th>
                <th className='text-left p-3'>用户</th>
                <th className='text-left p-3'>金额</th>
                <th className='text-left p-3'>状态</th>
                <th className='text-left p-3'>时间</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className='text-center p-6 text-muted-foreground'>
                    暂无订单
                  </td>
                </tr>
              )}
              {recentOrders.map((order: any) => (
                <tr key={order.id} className='border-t'>
                  <td className='p-3 font-mono text-xs'>{order.orderNo}</td>
                  <td className='p-3'>{order.user?.name || order.userId}</td>
                  <td className='p-3'>¥{(order.amount / 100).toFixed(2)}</td>
                  <td className='p-3'>
                    <span className={order.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}>
                      {order.status === 'paid' ? '已支付' : order.status === 'pending' ? '待支付' : order.status}
                    </span>
                  </td>
                  <td className='p-3 text-muted-foreground'>
                    {new Date(order.createdAt).toLocaleDateString('zh-CN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
