'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Separator } from '@/shared/components/ui/separator';
import { useState } from 'react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Get callbackUrl from URL params
  const callbackUrl = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('callbackUrl') || '/'
    : '/';

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('两次密码不一致');
      return;
    }
    if (password.length < 8) {
      setError('密码至少8位');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.data?.autoVerified) {
          // Auto-verified, redirect to callbackUrl (already logged in)
          window.location.href = callbackUrl;
          return;
        }
        setSuccess('EMAIL_SENT');
      } else {
        setError(data.message || '注册失败');
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
          <CardTitle className='text-2xl'>注册</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-3'>
            <Button variant='outline' className='w-full' onClick={() => handleSocialLogin('google')}>Google</Button>
            <Button variant='outline' className='w-full' onClick={() => handleSocialLogin('github')}>GitHub</Button>
          </div>
          <Separator />
          {success === 'EMAIL_SENT' ? (
            <div className='space-y-4 text-center'>
              <div className='text-4xl'>📧</div>
              <h3 className='text-lg font-semibold'>验证邮件已发送</h3>
              <p className='text-sm text-muted-foreground'>
                请查收 <span className='font-medium text-foreground'>{email}</span> 的收件箱<br/>
                并点击邮件中的验证链接完成注册
              </p>
              <p className='text-xs text-muted-foreground'>如果没有收到，请检查垃圾邮件文件夹</p>
              <div className='space-y-2'>
                <a href='/auth/login' className='block w-full'>
                  <Button variant='default' className='w-full'>验证完成后，去登录</Button>
                </a>
                <Button variant='ghost' className='w-full' onClick={() => { setSuccess(''); setError(''); }}>
                  重新注册
                </Button>
              </div>
            </div>
          ) : (
            <form className='space-y-3' onSubmit={handleRegister}>
              {error && <p className='text-sm text-red-600 bg-red-50 p-3 rounded'>{error}</p>}
              <Input type='text' placeholder='用户名' value={name} onChange={e => setName(e.target.value)} required />
              <Input type='email' placeholder='邮箱' value={email} onChange={e => setEmail(e.target.value)} required />
              <Input type='password' placeholder='密码（至少8位）' value={password} onChange={e => setPassword(e.target.value)} required />
              <Input type='password' placeholder='确认密码' value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              <Button type='submit' className='w-full' disabled={loading}>{loading ? '注册中...' : '注册'}</Button>
            </form>
          )}
        </CardContent>
        {success !== 'EMAIL_SENT' && (
          <CardFooter className='justify-center'>
            <a href='/auth/login' className='text-sm text-muted-foreground hover:text-foreground'>
              已有账号？登录
            </a>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
