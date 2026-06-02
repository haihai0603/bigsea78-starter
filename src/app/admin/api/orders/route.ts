// Admin API - Orders
import { requireAdmin } from '@/core/rbac/permission';
import { respData, respErr } from '@/shared/lib/resp';
import { getRecentOrders, getOrderCount, updateOrderStatus } from '@/core/db/queries';

export async function GET(req: Request) {
  try {
    await requireAdmin(req);

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    const [items, total] = await Promise.all([
      getRecentOrders(limit),
      getOrderCount(),
    ]);

    return respData({ items, total, page, limit });
  } catch (e: any) {
    return respErr(e.message);
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin(req);
    const { orderNo, status } = await req.json();

    if (!orderNo || !status) return respErr('orderNo and status are required');

    await updateOrderStatus(orderNo, status);

    return respData({ success: true });
  } catch (e: any) {
    return respErr(e.message);
  }
}
