import Link from 'next/link';
import { site } from '@/site/config';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { getProducts } from '@/core/db/queries';
import { ProductImage } from '@/shared/components/ProductImage';

export const revalidate = 60; // ISR: 60秒重新验证

export default async function HomePage() {
  let products: any[] = [];
  try {
    products = await getProducts({ active: true, limit: 6 });
  } catch {
    // DB unavailable
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <section className="container mx-auto px-6 py-24 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            欢迎来到 {site.name}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            高品质产品，极致体验。我们精心挑选每一件商品，为您提供值得信赖的购物选择。
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Link href="/products">
              <Button size="lg">浏览产品</Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg">了解更多</Button>
            </Link>
          </div>
        </section>

        <section className="container mx-auto px-6 py-16">
          <h3 className="text-2xl font-bold text-center mb-12">我们的优势</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: '品质保障', desc: '严格筛选供应链，确保每件商品都符合最高品质标准。' },
              { title: '极速配送', desc: '与主流物流深度合作，下单后快速送达您的手中。' },
              { title: '贴心服务', desc: '专业客服团队全天候在线，随时为您解答疑问。' },
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
                  <p className="text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-6 py-16">
          <h3 className="text-2xl font-bold text-center mb-12">热门产品</h3>
          {products.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <Card key={p.id}>
                  <CardContent className="p-6">
                    <ProductImage src={p.coverImage} alt={p.name} />
                    <h4 className="font-semibold">{p.name}</h4>
                    {p.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{p.description}</p>}
                    {p.price != null && <p className="mt-2 font-bold">{p.price === 0 ? '免费' : `¥${(p.price / 100).toFixed(0)}`}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">暂无产品，敬请期待。</p>
          )}
        </section>

        <section className="bg-muted/50 py-20">
          <div className="container mx-auto px-6 text-center">
            <h3 className="text-3xl font-bold">准备好开始了吗？</h3>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              立即探索我们的产品系列，找到最适合您的那一款。
            </p>
            <Link href="/products">
              <Button size="lg" className="mt-8">立即选购</Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
