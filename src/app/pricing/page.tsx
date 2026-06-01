import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { site } from '@/site/config';

export default function PricingPage() {
  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 py-20'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold'>定价方案</h1>
          <p className='mt-4 text-lg text-muted-foreground'>选择适合您的方案</p>
        </div>
        <div className='grid md:grid-cols-3 gap-6 max-w-5xl mx-auto'>
          {[
            { name: '免费体验', price: 0, features: ['基础功能', '社区支持', '每月3次下载'], badge: '' },
            { name: '标准版', price: 9900, features: ['全部功能', '优先支持', '无限下载', '邮件支持'], badge: '推荐' },
            { name: '专业版', price: 29900, features: ['全部功能', '1对1支持', '无限下载', '定制服务', 'API接入'], badge: '' },
          ].map((plan) => (
            <Card key={plan.name} className={plan.badge ? 'border-primary shadow-md' : ''}>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  {plan.name}
                  {plan.badge && <Badge>{plan.badge}</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='mb-4'>
                  <span className='text-4xl font-bold'>
                    {plan.price === 0 ? '免费' : `¥${(plan.price / 100).toFixed(0)}`}
                  </span>
                  {plan.price > 0 && <span className='text-muted-foreground'>/永久</span>}
                </div>
                <ul className='space-y-2'>
                  {plan.features.map((f) => (
                    <li key={f} className='text-sm text-muted-foreground flex items-center gap-2'>
                      <span className='text-primary'>✓</span> {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className='w-full' variant={plan.badge ? 'default' : 'outline'}>
                  {plan.price === 0 ? '开始使用' : '立即购买'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
