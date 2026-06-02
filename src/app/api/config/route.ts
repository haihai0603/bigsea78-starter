import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/core/auth';

// GET /api/config - 读取当前配置（从 DB 或环境变量）
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 简单读取环境变量状态
    const config = {
      appName: process.env.NEXT_PUBLIC_APP_NAME || 'BigSea78',
      appUrl: process.env.NEXT_PUBLIC_APP_URL || '',
      stripeEnabled: !!process.env.STRIPE_SECRET_KEY,
      resendEnabled: !!process.env.RESEND_API_KEY,
      r2Enabled: !!process.env.R2_ACCOUNT_ID,
    };

    return NextResponse.json(config);
  } catch (error: any) {
    console.error('Get config error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/config - 更新配置（写入 .env 或 DB）
export async function PUT(request: NextRequest) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 简单 admin 检查
    const adminEmails = (process.env.ADMIN_EMAILS || 'bigsea78@outlook.com').split(',').map(e => e.trim());
    if (!adminEmails.includes(session.user.email || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { appName, appUrl } = body;

    // 注意：生产环境中，应该将配置存储到数据库而不是 .env 文件
    // 这里仅做演示，实际应该创建 `settings` 表
    console.log('Config update requested:', { appName, appUrl });

    return NextResponse.json({ message: '配置已更新（演示模式）' });
  } catch (error: any) {
    console.error('Update config error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
