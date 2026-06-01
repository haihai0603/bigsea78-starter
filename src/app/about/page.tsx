import { site } from '@/site/config';

export default function AboutPage() {
  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 py-20 max-w-3xl'>
        <h1 className='text-4xl font-bold mb-8'>关于 {site.name}</h1>
        <div className='prose prose-neutral dark:prose-invert max-w-none space-y-6'>
          <p className='text-lg text-muted-foreground'>
            {site.name} 是一个数字商品商城，致力于为创作者和用户提供优质的数字产品交易体验。
          </p>
          <h2 className='text-2xl font-semibold'>我们的使命</h2>
          <p className='text-muted-foreground'>
            让知识变现更简单，让优质数字产品触手可及。
          </p>
          <h2 className='text-2xl font-semibold'>联系方式</h2>
          <p className='text-muted-foreground'>
            微信：{site.social.wechat}<br />
            GitHub：{site.social.github}<br />
            邮箱：{site.footer.links.find(l => l.href.includes('mailto'))?.href?.replace('mailto:', '') || 'support@bigsea78.top'}
          </p>
        </div>
      </div>
    </div>
  );
}
