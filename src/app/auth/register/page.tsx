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
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');

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
      const res = await fetch('/api/auth/sign-up/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (res.ok) {
        window.location.href = '/';
      } else {
        const data = await res.json();
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
          <form className='space-y-3' onSubmit={handleRegister}>
            {error && <p className='text-sm text-red-600'>{error}</p>}
            <Input type='text' placeholder='用户名' value={name} onChange={e => setName(e.target.value)} required />
            <Input type='email' placeholder='邮箱' value={email} onChange={e => setEmail(e.target.value)} required />
            <Input type='password' placeholder='密码（至少8位）' value={password} onChange={e => setPassword(e.target.value)} required />
            <Input type='password' placeholder='确认密码' value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            <Button type='submit' className='w-full' disabled={loading}>{loading ? '注册中...' : '注册'}</Button>
          </form>
        </CardContent>
        <CardFooter className='justify-center'>
          <a href='/auth/login' className='text-sm text-muted-foreground hover:text-foreground'>
            已有账号？登录
          </a>
        </CardFooter>
      </Card>
    </div>
  );
}
