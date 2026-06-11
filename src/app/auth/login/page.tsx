'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Separator } from '@/shared/components/ui/separator';
import { useState, useEffect } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const callbackUrl = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('callbackUrl') || '/'
    : '/';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === 'success') {
      setSuccess('邮箱验证成功！请登录');
    } else if (params.get('verified') === 'already') {
      setSuccess('邮箱已验证，请直接登录');
    }
  }, []);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        window.location.href = callbackUrl;
      } else {
        const data = await res.json();
        setError(data.message || '登录失败');
      }
    } catch {
      setError('网络错误');
    }
    setLoading(false);
  }

  function handleSocialLogin(provider: string) {
    window.location.href = `/api/auth/sign-in/social?provider=${provider}`;
  }

  return (
    <div className='min-h-[60vh] flex items-center justify-center px-4'>
      <Card className='max-w-md w-full'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl'>登录</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Social login */}
          <div className='grid grid-cols-2 gap-3'>
            <Button variant='outline' className='w-full' onClick={() => handleSocialLogin('google')}>
              Google
            </Button>
            <Button variant='outline' className='w-full' onClick={() => handleSocialLogin('github')}>
              GitHub
            </Button>
          </div>
          <Separator />
          {/* Email login */}
          <form className='space-y-3' onSubmit={handleEmailLogin}>
            {error && <p className='text-sm text-red-600 bg-red-50 p-3 rounded'>{error}</p>}
            {success && <p className='text-sm text-green-600 bg-green-50 p-3 rounded'>{success}</p>}
            <Input type='email' placeholder='邮箱' value={email} onChange={e => setEmail(e.target.value)} required />
            <Input type='password' placeholder='密码' value={password} onChange={e => setPassword(e.target.value)} required />
            <Button type='submit' className='w-full' disabled={loading}>{loading ? '登录中...' : '登录'}</Button>
          </form>
        </CardContent>
        <CardFooter className='justify-center'>
          <a href='/auth/register' className='text-sm text-muted-foreground hover:text-foreground'>
            没有账号？注册
          </a>
        </CardFooter>
      </Card>
    </div>
  );
}
