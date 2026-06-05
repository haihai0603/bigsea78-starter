import { getAuth } from '@/core/auth';
import { db } from '@/core/db';
import { orders, products } from '@/core/db/schema';
import { respData, respErr } from '@/shared/lib/resp';
import { getUuid } from '@/shared/lib/hash';
import { eq } from 'drizzle-orm';

// WeChat pay QR code URL (static collection code)
const WECHAT_PAY_QR_URL = process.env.WECHAT_PAY_QR_URL || '/wechat-pay-qr.png';

export async function POST(request: Request) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return respErr('请先登录', 401);

    const body = await request.json();
    const { product_id } = body;

    if (!product_id) return respErr('product_id required');

    // Get product
    const product = await db().select().from(products).where(eq(products.id, product_id)).limit(1);
    if (!product[0]) return respErr('Product not found', 404);
    if (!product[0].active) return respErr('Product not available', 400);

    const totalAmount = product[0].price;

    // Create order with pending status
    const orderNo = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    await db().insert(orders).values({
      id: getUuid(),
      orderNo,
      userId: session.user.id,
      productId: product_id,
      amount: totalAmount,
      currency: product[0].currency || 'cny',
      status: 'pending',
    });

    // Free product - auto approve
    if (product[0].price === 0) {
      const { db: dbConn } = await import('@/core/db');
      const { downloads } = await import('@/core/db/schema');
      const token = getUuid();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await dbConn().insert(downloads).values({
        id: getUuid(),
        orderId: orderNo, // will use order id
        userId: session.user.id,
        token,
        maxDownloads: 3,
        expiresAt,
      });
      return respData({ orderNo, free: true, downloadUrl: `/api/download?token=${token}` });
    }

    // Paid product - return WeChat QR + order info
    const priceYuan = (totalAmount / 100).toFixed(2);
    return respData({
      orderNo,
      wechatPayQR: WECHAT_PAY_QR_URL,
      amount: totalAmount,
      amountYuan: priceYuan,
      productName: product[0].name,
      currency: product[0].currency || 'cny',
    });
  } catch (e: any) {
    console.error('Checkout error:', e);
    return respErr(e.message, 500);
  }
}
