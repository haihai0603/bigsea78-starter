import { getAuth } from '@/core/auth';
import { db } from '@/core/db';
import { orders, products } from '@/core/db/schema';
import { respData, respErr } from '@/shared/lib/resp';
import { sendEmail } from '@/extensions/email/resend';
import { siteConfig } from '@/config';
import { eq } from 'drizzle-orm';

// User clicks "I've paid" → send notification email to admin
export async function POST(request: Request) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return respErr('请先登录', 401);

    const body = await request.json();
    const { orderNo } = body;
    if (!orderNo) return respErr('orderNo required');

    // Verify order belongs to this user
    const orderRows = await db().select().from(orders).where(eq(orders.orderNo, orderNo)).limit(1);
    if (!orderRows[0]) return respErr('订单不存在', 404);
    if (orderRows[0].userId !== session.user.id) return respErr('无权操作', 403);
    if (orderRows[0].status === 'paid') return respErr('订单已支付', 400);
    if (orderRows[0].status === 'confirmed') return respErr('订单已确认，等待发货', 400);

    // Get product info
    const productRows = await db().select().from(products).where(eq(products.id, orderRows[0].productId)).limit(1);
    const productName = productRows[0]?.name || '未知产品';
    const priceYuan = (orderRows[0].amount / 100).toFixed(2);

    // Update order status to 'confirmed' (user claimed paid, waiting admin verify)
    await db().update(orders).set({ status: 'confirmed' }).where(eq(orders.orderNo, orderNo));

    // Send email to admin
    const adminEmail = process.env.ADMIN_EMAIL || 'bigsea78@outlook.com';
    const confirmUrl = `${siteConfig.app_url}/api/payment/admin-confirm?orderNo=${orderNo}`;
    const rejectUrl = `${siteConfig.app_url}/api/payment/admin-confirm?orderNo=${orderNo}&action=reject`;

    const html = `
      <div style="max-width:600px;margin:0 auto;font-family:sans-serif">
        <h2>💸 新订单待确认</h2>
        <p>用户 <strong>${session.user.email}</strong> 声称已完成支付，请确认收款后点击下方按钮：</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;border:1px solid #eee">订单号</td><td style="padding:8px;border:1px solid #eee">${orderNo}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee">产品</td><td style="padding:8px;border:1px solid #eee">${productName}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee">金额</td><td style="padding:8px;border:1px solid #eee">¥${priceYuan}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee">用户</td><td style="padding:8px;border:1px solid #eee">${session.user.name || session.user.email}</td></tr>
        </table>
        <div style="margin:20px 0">
          <a href="${confirmUrl}" style="background:#22c55e;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;margin-right:12px">✅ 确认收款并发货</a>
          <a href="${rejectUrl}" style="background:#ef4444;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px">❌ 拒绝</a>
        </div>
        <p style="color:#999;font-size:12px">如果按钮无法点击，请复制链接到浏览器打开：<br>${confirmUrl}</p>
      </div>
    `;

    try {
      await sendEmail({
        to: adminEmail,
        subject: `新订单待确认: ${productName} ¥${priceYuan}`,
        html,
      });
    } catch (emailErr) {
      console.error('Failed to send admin email:', emailErr);
      // Still return success - order is saved, admin can check manually
    }

    return respData({ message: '已通知管理员，请等待确认后发送下载链接到您的邮箱' });
  } catch (e: any) {
    console.error('Pay-notify error:', e);
    return respErr(e.message, 500);
  }
}
