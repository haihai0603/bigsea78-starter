import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

export default function AdminPage() {
  // TODO: Add requireAdmin middleware
  return (
    <div className='container mx-auto px-4 py-10'>
      <h1 className='text-3xl font-bold mb-8'>管理后台</h1>
      <div className='grid md:grid-cols-3 gap-6'>
        {[
          { title: '产品管理', desc: '添加、编辑、下架产品', count: '0' },
          { title: '订单管理', desc: '查看订单、处理退款', count: '0' },
          { title: '用户管理', desc: '查看用户、设置权限', count: '0' },
        ].map((item) => (
          <Card key={item.title} className='cursor-pointer hover:shadow-md transition'>
            <CardHeader>
              <CardTitle className='text-lg'>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground'>{item.desc}</p>
              <p className='text-2xl font-bold mt-2'>{item.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
