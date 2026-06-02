import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/core/auth';
import { updateUserRole } from '@/core/db/queries';

// PATCH /api/users/[id]/role - 更新用户角色
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 验证 admin 权限
    const adminEmails = (process.env.ADMIN_EMAILS || 'bigsea78@outlook.com').split(',').map(e => e.trim());
    if (!adminEmails.includes(session.user.email || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const { role } = await request.json();

    if (!role || (role !== 'admin' && role !== 'user')) {
      return NextResponse.json({ error: '无效的角色' }, { status: 400 });
    }

    await updateUserRole(id, role);

    return NextResponse.json({ message: '角色更新成功' });
  } catch (error: any) {
    console.error('Update role error:', error);
    return NextResponse.json({ error: error.message || '更新失败' }, { status: 500 });
  }
}
