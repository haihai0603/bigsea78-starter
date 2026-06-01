'use client';

import { site } from '@/site/config';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';

// Mock products - will be replaced with DB fetch
const MOCK_PRODUCTS = [
  { id: '1', name: 'AI写作助手', description: '智能文案生成工具，支持多种风格', price: 9900, category: 'software', coverImage: '' },
  { id: '2', name: '视频剪辑速成课', description: '从零到一学会专业剪辑', price: 19900, category: 'course', coverImage: '' },
  { id: '3', name: '创业者电子书合集', description: '10本必读商业书籍精编版', price: 2900, category: 'ebook', coverImage: '' },
  { id: '4', name: '思源黑体定制版', description: '适合UI设计的字体优化版本', price: 0, category: 'font', coverImage: '' },
];

const CATEGORY_ICONS: Record<string, string> = {
  software: '💻', course: '🎓', ebook: '📖', font: '🔤', audio: '🎵', template: '📐',
};

export default function Home() {
  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <header className='sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='container mx-auto flex h-14 items-center justify-between px-4'>
          <div className='flex items-center gap-6'>
            <h1 className='text-lg font-bold'>{site.name}</h1>
            <nav className='hidden md:flex gap-6'>
              {site.nav.map((item) => (
                <a key={item.href} href={item.href} className='text-sm text-muted-foreground hover:text-foreground transition-colors'>
                  {item.title}
                </a>
              ))}
            </nav>
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='ghost' size='sm' onClick={() => { window.location.href = '/auth/login'; }}>登录</Button>
            <Button size='sm' onClick={() => { window.location.href = '/auth/register'; }}>注册</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className='container mx-auto px-4 py-20 text-center'>
        <h2 className='text-4xl font-bold tracking-tight sm:text-6xl'>
          {site.tagline}
        </h2>
        <p className='mx-auto mt-6 max-w-2xl text-lg text-muted-foreground'>
          {site.description}
        </p>
        <div className='mt-8 flex justify-center gap-4'>
          <Button size='lg'>浏览产品</Button>
          <Button size='lg' variant='outline'>了解更多</Button>
        </div>
      </section>

      {/* Categories */}
      <section className='container mx-auto px-4 py-10'>
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6'>
          {site.categories.map((cat) => (
            <Card key={cat.id} className='cursor-pointer hover:border-primary hover:shadow-sm transition-all'>
              <CardContent className='flex flex-col items-center py-6'>
                <span className='text-3xl mb-2'>{CATEGORY_ICONS[cat.id] || '📦'}</span>
                <span className='text-sm font-medium'>{cat.name}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className='container mx-auto' />

      {/* Products */}
      <section id='products' className='container mx-auto px-4 py-10'>
        <h3 className='text-2xl font-bold mb-8'>热门产品</h3>
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
          {MOCK_PRODUCTS.map((product) => (
            <Card key={product.id} className='hover:shadow-md transition-shadow'>
              <CardHeader>
                <div className='aspect-video bg-muted rounded-md flex items-center justify-center text-4xl mb-2'>
                  {CATEGORY_ICONS[product.category] || '📦'}
                </div>
                <div className='flex items-center gap-2'>
                  <CardTitle className='text-base'>{product.name}</CardTitle>
                  <Badge variant='secondary' className='text-xs'>
                    {site.categories.find(c => c.id === product.category)?.name || product.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground'>{product.description}</p>
              </CardContent>
              <CardFooter className='flex items-center justify-between'>
                <span className='text-lg font-bold'>
                  {product.price === 0 ? '免费' : `¥${(product.price / 100).toFixed(2)}`}
                </span>
                <Button size='sm'>{product.price === 0 ? '下载' : '购买'}</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className='border-t mt-20'>
        <div className='container mx-auto px-4 py-8'>
          <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
            <span className='text-sm text-muted-foreground'>&copy; {new Date().getFullYear()} {site.footer.copyright}. All rights reserved.</span>
            <div className='flex gap-4'>
              {site.footer.links.map((link) => (
                <a key={link.href} href={link.href} className='text-sm text-muted-foreground hover:text-foreground transition-colors'>
                  {link.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
