'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Separator } from '@/shared/components/ui/separator';

export default function LoginPage() {
  return (
    <div className='min-h-screen bg-background flex items-center justify-center px-4'>
      <Card className='max-w-md w-full'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl'>登录</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Social login */}
          <div className='grid grid-cols-2 gap-3'>
            <Button variant='outline' className='w-full' onClick={() => { window.location.href = '/api/auth/[...all]?provider=google'; }}>
              Google
            </Button>
            <Button variant='outline' className='w-full' onClick={() => { window.location.href = '/api/auth/[...all]?provider=github'; }}>
              GitHub
            </Button>
          </div>
          <Separator />
          {/* Email login */}
          <form className='space-y-3' onSubmit={(e) => { e.preventDefault(); /* TODO: call better-auth signIn */ }}>
            <Input type='email' placeholder='邮箱' required />
            <Input type='password' placeholder='密码' required />
            <Button type='submit' className='w-full'>登录</Button>
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
