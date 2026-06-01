import { site } from '@/site/config';

export default function RefundPage() {
  return (
    <div className='container mx-auto px-4 py-20 max-w-3xl'>
      <h1 className='text-3xl font-bold mb-8'>退款政策</h1>
      <div className='space-y-6 text-muted-foreground'>
        <h2 className='text-xl font-semibold text-foreground'>数字商品</h2>
        <p>由于数字商品的特殊性质，购买后一般不支持退款。但如果您遇到以下情况，请联系我们：</p>
        <ul className='list-disc list-inside space-y-1 ml-4'>
          <li>商品与描述严重不符</li>
          <li>无法正常下载或使用</li>
          <li>重复扣款</li>
        </ul>
        <h2 className='text-xl font-semibold text-foreground'>退款流程</h2>
        <p>购买后7天内，通过邮件联系我们的客服团队。我们将在3个工作日内处理您的请求。</p>
        <h2 className='text-xl font-semibold text-foreground'>联系方式</h2>
        <p>{site.footer.links.find(l => l.href.includes('mailto'))?.href?.replace('mailto:', '') || 'support@bigsea78.top'}</p>
      </div>
    </div>
  );
}
