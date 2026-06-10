import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/core/auth';
import { updateUserRole } from '@/core/db/queries';

async function checkAdmin(request: NextRequest) {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const adminEmails = (process.env.ADMIN_EMAILS || 'bigsea78@outlook.com').split(',').map(e => e.trim());
  if (!adminEmails.includes(session.user.email || '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await checkAdmin(request);
  if (authError) return authError;
  try {
    const { id } = await params;
    const { role } = await request.json();
    if (!role || (role !== 'admin' && role !== 'user')) {
      return NextResponse.json({ error: '无效的角色' }, { status: 400 });
    }
    await updateUserRole(id, role);
    return NextResponse.json({ message: '角色更新成功' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '更新失败' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return POST(request, { params });
}
