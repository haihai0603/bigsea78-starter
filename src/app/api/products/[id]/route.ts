import { NextRequest, NextResponse } from 'next/server';
import { getProductById, updateProduct, deleteProduct } from '@/core/db/queries';
import { getAuth } from '@/core/auth';

// 验证 admin 权限
async function requireAdmin(request: NextRequest) {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const adminEmails = (process.env.ADMIN_EMAILS || 'bigsea78@outlook.com').split(',').map(e => e.trim());
  if (!adminEmails.includes(session.user.email || '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null; // null = 验证通过
}

// GET /api/products/[id] - 获取单个产品
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ data: product });
}

// PUT /api/products/[id] - 更新产品
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();
  const { name, description, price, currency, category, coverImage, downloadUrl, active } = body;

  await updateProduct(id, {
    name,
    description,
    price: price !== undefined ? Number(price) : undefined,
    currency,
    category,
    coverImage,
    downloadUrl,
    active: active !== undefined ? (active ? 1 : 0) : undefined,
  });

  return NextResponse.json({ message: '更新成功' });
}

// DELETE /api/products/[id] - 软删除（设为下架）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  await deleteProduct(id); // 实际上是 set active=0

  return NextResponse.json({ message: '已下架' });
}
