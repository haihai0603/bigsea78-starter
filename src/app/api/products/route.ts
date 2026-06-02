import { NextRequest, NextResponse } from 'next/server';
import { createProduct, getProducts } from '@/core/db/queries';
import { getAuth } from '@/core/auth';
import { randomUUID } from 'crypto';

// GET /api/products - 公开产品列表
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || undefined;
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  const products = await getProducts({ category, limit, offset });
  return NextResponse.json({ data: products });
}

// POST /api/products - 新增产品（Admin only）
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminEmails = (process.env.ADMIN_EMAILS || 'bigsea78@outlook.com')
      .split(',')
      .map((e: string) => e.trim());
    if (!adminEmails.includes(session.user.email || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, price, currency, category, coverImage, downloadUrl, active } = body;

    if (!name || price === undefined) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }

    const id = randomUUID();
    await createProduct({
      id,
      name,
      description: description || '',
      price: Number(price),
      currency: currency || 'cny',
      category: category || '',
      coverImage: coverImage || '',
      downloadUrl: downloadUrl || '',
      active: active !== false ? 1 : 0,
    });

    return NextResponse.json({ data: { id }, message: '产品创建成功' });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: error.message || '创建失败' }, { status: 500 });
  }
}
