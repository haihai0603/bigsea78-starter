'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';

interface SiteConfig {
  appName: string;
  appUrl: string;
  stripeEnabled: boolean;
  resendEnabled: boolean;
  r2Enabled: boolean;
}

export function SettingsForm() {
  const [config, setConfig] = useState<SiteConfig>({
    appName: '',
    appUrl: '',
    stripeEnabled: false,
    resendEnabled: false,
    r2Enabled: false,
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // 从环境变量读取当前配置（通过 API）
    fetch('/api/config')
      .then((r) => r.json())
      .then((data) => setConfig(data))
      .catch(() => {});
  }, []);

  async function handleSave() {
    setLoading(true);
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {
      alert('保存失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='space-y-6 max-w-2xl'>
      <div>
        <h2 className='text-lg font-semibold'>基本设置</h2>
        <p className='text-sm text-muted-foreground'>网站名称和 URL 配置</p>
      </div>

      <Card className='p-4 space-y-4'>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>网站名称</label>
          <Input
            value={config.appName}
            onChange={(e) => setConfig({ ...config, appName: e.target.value })}
            placeholder='BigSea78'
          />
        </div>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>网站 URL</label>
          <Input
            value={config.appUrl}
            onChange={(e) => setConfig({ ...config, appUrl: e.target.value })}
            placeholder='https://bigsea78.top'
          />
        </div>
      </Card>

      <Separator />

      <div>
        <h2 className='text-lg font-semibold'>服务状态</h2>
        <p className='text-sm text-muted-foreground'>第三方服务配置状态</p>
      </div>

      <Card className='p-4 space-y-3'>
        {[
          { key: 'stripeEnabled', label: 'Stripe 支付', desc: '信用卡支付渠道' },
          { key: 'resendEnabled', label: 'Resend 邮件', desc: '邮件发送服务' },
          { key: 'r2Enabled', label: 'Cloudflare R2', desc: '数字产品存储' },
        ].map((item) => (
          <div key={item.key} className='flex items-center justify-between py-2'>
            <div>
              <p className='font-medium text-sm'>{item.label}</p>
              <p className='text-xs text-muted-foreground'>{item.desc}</p>
            </div>
            <span className={config[item.key as keyof SiteConfig] ? 'text-green-600 text-sm' : 'text-muted-foreground text-sm'}>
              {config[item.key as keyof SiteConfig] ? '已配置' : '未配置'}
            </span>
          </div>
        ))}
      </Card>

      <div className='flex gap-3'>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? '保存中...' : '保存设置'}
        </Button>
        {saved && (
          <span className='text-green-600 text-sm self-center'>✅ 已保存</span>
        )}
      </div>

      <Separator />

      <div>
        <h2 className='text-lg font-semibold text-destructive'>危险操作</h2>
      </div>
      <Card className='p-4 space-y-3 border-destructive/50'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='font-medium text-sm'>重新 Seed 示例数据</p>
            <p className='text-xs text-muted-foreground'>重新写入示例产品（会创建重复数据）</p>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={async () => {
              if (confirm('确定要重新写入示例数据吗？可能创建重复产品！')) {
                await fetch('/api/seed', { method: 'POST' });
                alert('已触发 seed，请刷新产品列表查看');
              }
            }}
          >
            执行 Seed
          </Button>
        </div>
      </Card>
    </div>
  );
}
