'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';

export function DownloadButton({ token }: { token: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleDownload() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/download?token=' + token);
      const data = await res.json();
      if (data.data?.url) {
        window.location.href = data.data.url;
      } else {
        setError('下载链接获取失败');
      }
    } catch {
      setError('下载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button className='w-full' size='lg' onClick={handleDownload} disabled={loading}>
        {loading ? '获取下载链接...' : '立即下载'}
      </Button>
      {error && <p className='text-red-500 text-sm mt-2 text-center'>{error}</p>}
    </div>
  );
}
