import { db } from '@/core/db';
import { orders, products, downloads, users } from '@/core/db/schema';
import { sendEmail, orderConfirmationEmail } from '@/extensions/email/resend';
import { siteConfig } from '@/config';
import { getUuid } from '@/shared/lib/hash';
import { eq } from 'drizzle-orm';

// Admin confirms payment → mark order paid → send download link to user
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const orderNo = url.searchParams.get('orderNo');
    const action = url.searchParams.get('action') || 'confirm';

    if (!orderNo) {
      return new Response('Missing orderNo', { status: 400 });
    }

    // Get order
    const orderRows = await db().select().from(orders).where(eq(orders.orderNo, orderNo)).limit(1);
    if (!orderRows[0]) {
      return new Response('Order not found', { status: 404 });
    }
    const order = orderRows[0];

    // Reject
    if (action === 'reject') {
      await db().update(orders).set({ status: 'failed' }).where(eq(orders.orderNo, orderNo));
      return new Response('订单已拒绝', { status: 200 });
    }

    // Already paid?
    if (order.status === 'paid') {
      return new Response('订单已处理过，无需重复确认', { status: 200 });
    }

    // Confirm: mark paid
    await db().update(orders).set({ status: 'paid', paidAt: new Date() }).where(eq(orders.orderNo, orderNo));

    // Get product
    const productRows = await db().select().from(products).where(eq(products.id, order.productId)).limit(1);
    const productName = productRows[0]?.name || '未知产品';

    // Generate download token
    const token = getUuid();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db().insert(downloads).values({
      id: getUuid(),
      orderId: order.id,
      userId: order.userId,
      token,
      maxDownloads: 3,
      expiresAt,
    });

    // Get user email
    const userRows = await db().select().from(users).where(eq(users.id, order.userId)).limit(1);
    const userEmail = userRows[0]?.email;

    // Send download email to user
    if (userEmail && productRows[0]) {
      const downloadUrl = siteConfig.app_url + '/download?token=' + token;
      const emailContent = orderConfirmationEmail({
        productName,
        orderNo,
        downloadUrl,
        amount: order.amount,
        currency: order.currency || 'cny',
      });

      try {
        await sendEmail({
          to: userEmail,
          subject: emailContent.subject,
          html: emailContent.html,
        });
      } catch (emailErr) {
        console.error('Failed to send download email to user:', emailErr);
      }
    }

    return new Response('✅ 订单已确认，下载链接已发送至用户邮箱！', { status: 200 });
  } catch (e: any) {
    console.error('Admin confirm error:', e);
    return new Response('Error: ' + e.message, { status: 500 });
  }
}
