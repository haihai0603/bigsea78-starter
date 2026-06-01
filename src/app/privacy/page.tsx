import { site } from '@/site/config';

export default function PrivacyPage() {
  return (
    <div className='container mx-auto px-4 py-20 max-w-3xl'>
      <h1 className='text-3xl font-bold mb-8'>隐私政策</h1>
      <div className='space-y-6 text-muted-foreground'>
        <p>最后更新：2026年6月</p>
        <h2 className='text-xl font-semibold text-foreground'>信息收集</h2>
        <p>我们收集您提供的个人信息（如邮箱、姓名），以及自动收集的使用数据（如IP地址、浏览器类型）。</p>
        <h2 className='text-xl font-semibold text-foreground'>信息使用</h2>
        <p>您的信息仅用于：处理订单、发送下载链接、改善服务体验。我们不会出售您的个人信息。</p>
        <h2 className='text-xl font-semibold text-foreground'>数据安全</h2>
        <p>我们采用行业标准的安全措施保护您的数据，包括SSL加密和安全存储。</p>
        <h2 className='text-xl font-semibold text-foreground'>联系我们</h2>
        <p>如有疑问，请联系：{site.footer.links.find(l => l.href.includes('mailto'))?.href?.replace('mailto:', '') || 'support@bigsea78.top'}</p>
      </div>
    </div>
  );
}
