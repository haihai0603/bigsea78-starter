'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

const CATEGORIES = [
  { value: 'software', label: '实用软件' },
  { value: 'course', label: '精品课程' },
  { value: 'ebook', label: '电子书' },
  { value: 'font', label: '字体资源' },
  { value: 'audio', label: '音频素材' },
  { value: 'template', label: '模板' },
];

export function ProductForm({ product }: { product?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product ? (product.price / 100).toString() : '',
    currency: product?.currency || 'cny',
    category: product?.category || '',
    coverImage: product?.coverImage || '',
    downloadUrl: product?.downloadUrl || '',
    active: product?.active ?? true,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: form.name,
      description: form.description,
      price: Math.round(parseFloat(form.price || '0') * 100), // 转为分
      currency: form.currency,
      category: form.category,
      coverImage: form.coverImage,
      downloadUrl: form.downloadUrl,
      active: form.active,
    };

    try {
      const url = product ? `/api/products/${product.id}` : '/api/products';
      const method = product ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push('/admin/products');
      } else {
        const err = await res.json();
        alert('保存失败：' + (err.error || '未知错误'));
      }
    } catch (e: any) {
      alert('网络错误：' + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6 max-w-2xl'>
      <div className='space-y-2'>
        <label className='text-sm font-medium'>产品名称 *</label>
        <Input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder='输入产品名称'
        />
      </div>

      <div className='space-y-2'>
        <label className='text-sm font-medium'>产品描述</label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder='输入产品描述'
          rows={4}
        />
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>价格（元）*</label>
          <Input
            required
            type='number'
            step='0.01'
            min='0'
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder='0.00'
          />
          <p className='text-xs text-muted-foreground'>填 0 为免费产品</p>
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-medium'>货币</label>
          <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='cny'>人民币 (CNY)</SelectItem>
              <SelectItem value='usd'>美元 (USD)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='space-y-2'>
        <label className='text-sm font-medium'>分类</label>
        <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
          <SelectTrigger>
            <SelectValue placeholder='选择分类' />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-2'>
        <label className='text-sm font-medium'>封面图 URL</label>
        <Input
          value={form.coverImage}
          onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
          placeholder='https://...'
        />
      </div>

      <div className='space-y-2'>
        <label className='text-sm font-medium'>下载链接 / R2 Key *</label>
        <Input
          required
          value={form.downloadUrl}
          onChange={(e) => setForm({ ...form, downloadUrl: e.target.value })}
          placeholder='https://... 或 R2 文件路径'
        />
        <p className='text-xs text-muted-foreground'>
          付费产品：Stripe 支付后生成下载 token
          <br />
          免费产品：用户注册后直接下载
        </p>
      </div>

      <div className='flex items-center space-x-2'>
        <input
          type='checkbox'
          id='active'
          checked={form.active}
          onChange={(e) => setForm({ ...form, active: e.target.checked })}
        />
        <label htmlFor='active' className='text-sm'>立即上架</label>
      </div>

      <div className='flex gap-3'>
        <Button type='submit' disabled={loading}>
          {loading ? '保存中...' : product ? '更新产品' : '创建产品'}
        </Button>
        <Button type='button' variant='outline' onClick={() => router.back()}>
          取消
        </Button>
      </div>
    </form>
  );
}
