// Admin API - Products CRUD
import { requireAdmin } from '@/core/rbac/permission';
import { respData, respErr } from '@/shared/lib/resp';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getProductCount } from '@/core/db/queries';
import { getUuid } from '@/shared/lib/hash';

export async function GET(req: Request) {
  try {
    await requireAdmin(req);

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const category = url.searchParams.get('category') || undefined;

    const [items, total] = await Promise.all([
      getProducts({ category, active: undefined, limit, offset: (page - 1) * limit }),
      getProductCount(),
    ]);

    return respData({ items, total, page, limit });
  } catch (e: any) {
    return respErr(e.message);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin(req);
    const body = await req.json();

    if (!body.name || !body.category || body.price === undefined) {
      return respErr('name, category, and price are required');
    }

    const id = body.id || getUuid();
    await createProduct({
      id,
      name: body.name,
      description: body.description,
      price: body.price,
      currency: body.currency,
      category: body.category,
      coverImage: body.coverImage,
      downloadUrl: body.downloadUrl,
      metadata: body.metadata,
    });

    return respData({ id });
  } catch (e: any) {
    return respErr(e.message);
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin(req);
    const body = await req.json();

    if (!body.id) return respErr('id is required');

    await updateProduct(body.id, body);

    return respData({ success: true });
  } catch (e: any) {
    return respErr(e.message);
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin(req);
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) return respErr('id is required');

    await deleteProduct(id);

    return respData({ success: true });
  } catch (e: any) {
    return respErr(e.message);
  }
}
