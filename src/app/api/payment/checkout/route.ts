import { getAuth } from '@/core/auth';
import { db } from '@/core/db';
import { orders, products, downloads } from '@/core/db/schema';
import { respData, respErr } from '@/shared/lib/resp';
import { getUuid } from '@/shared/lib/hash';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return respErr('Unauthorized', 401);

    const body = await request.json();
    const { product_id, quantity } = body;

    if (!product_id) return respErr('product_id required');

    // Get product
    const product = await db().select().from(products).where(eq(products.id, product_id)).limit(1);
    if (!product[0]) return respErr('Product not found', 404);
    if (!product[0].active) return respErr('Product not available', 400);

    const qty = Math.max(1, Number(quantity) || 1);
    const totalAmount = product[0].price * qty;

    // Create order
    const orderNo = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const [order] = await db().insert(orders).values({
      id: getUuid(),
      orderNo,
      userId: session.user.id,
      productId: product_id,
      amount: totalAmount,
      currency: product[0].currency || 'cny',
      status: 'pending',
      quantity: qty,
    }).returning();

    // If free product, skip Stripe and mark paid immediately
    if (product[0].price === 0) {
      await db().update(orders).set({ status: 'paid', paidAt: new Date() }).where(eq(orders.id, order.id));

      // Create download token
      const token = getUuid();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await db().insert(downloads).values({
        id: getUuid(),
        orderId: order.id,
        userId: session.user.id,
        token,
        maxDownloads: 3,
        expiresAt,
      });

      return respData({
        orderNo,
        free: true,
        downloadUrl: `/api/download?token=${token}`,
      });
    }

    // TODO: Replace with real Stripe Checkout Session creation
    // For now, return a mock checkout URL for dev
    const mockCheckoutUrl = `/api/payment/mock-success?order_no=${orderNo}`;

    return respData({
      orderNo,
      checkoutUrl: mockCheckoutUrl,
    });
  } catch (e: any) {
    console.error('Checkout error:', e);
    return respErr(e.message, 500);
  }
}
