'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Separator } from '@/shared/components/ui/separator';

export default function RegisterPage() {
  return (
    <div className='min-h-screen bg-background flex items-center justify-center px-4'>
      <Card className='max-w-md w-full'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl'>注册</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-3'>
            <Button variant='outline' className='w-full'>Google</Button>
            <Button variant='outline' className='w-full'>GitHub</Button>
          </div>
          <Separator />
          <form className='space-y-3' onSubmit={(e) => { e.preventDefault(); /* TODO: call better-auth signUp */ }}>
            <Input type='text' placeholder='用户名' required />
            <Input type='email' placeholder='邮箱' required />
            <Input type='password' placeholder='密码' required />
            <Input type='password' placeholder='确认密码' required />
            <Button type='submit' className='w-full'>注册</Button>
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
