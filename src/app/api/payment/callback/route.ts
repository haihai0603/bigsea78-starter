// Payment webhook callback - handle payment success/failure
import { paymentManager, StripeProvider, LemonSqueezyProvider } from '@/extensions/payment';
import { sendEmail, orderConfirmationEmail } from '@/extensions/email/resend';
import { siteConfig } from '@/config';
import { getUuid } from '@/shared/lib/hash';
import {
  getOrderByNo,
  updateOrderStatus,
  createDownload,
  getProductById,
} from '@/core/db/queries';

export async function POST(req: Request) {
  try {
    // Determine provider from URL query
    const url = new URL(req.url);
    const provider = url.searchParams.get('provider') || 'stripe';

    const event = await paymentManager.getPaymentEvent(req, provider);

    if (event.eventType === 'payment.success' && event.orderNo) {
      const order = await getOrderByNo(event.orderNo);
      if (!order) {
        console.error('Order not found:', event.orderNo);
        return Response.json({ error: 'Order not found' }, { status: 404 });
      }

      // Skip if already paid (idempotency)
      if (order.status === 'paid') {
        return Response.json({ received: true });
      }

      // 1. Update order status to 'paid'
      await updateOrderStatus(
        event.orderNo,
        'paid',
        event.paymentInfo?.transactionId
      );

      // 2. Generate download token (24h expiry, 3 downloads max)
      const downloadToken = getUuid();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await createDownload({
        id: getUuid(),
        orderId: order.id,
        userId: order.userId,
        token: downloadToken,
        expiresAt,
      });

      // 3. Send email with download link
      const product = await getProductById(order.productId);
      const recipientEmail = event.paymentInfo?.email;

      if (recipientEmail && product) {
        const downloadUrl = siteConfig.app_url + '/download?token=' + downloadToken;
        const emailContent = orderConfirmationEmail({
          productName: product.name,
          orderNo: event.orderNo,
          downloadUrl,
          amount: order.amount,
          currency: order.currency,
        });
        try {
          await sendEmail({
            to: recipientEmail,
            subject: emailContent.subject,
            html: emailContent.html,
          });
        } catch (emailErr) {
          console.error('Failed to send order email:', emailErr);
          // Don't fail the webhook if email fails
        }
      }
    }

    return Response.json({ received: true });
  } catch (e: any) {
    console.error('Payment callback error:', e);
    return Response.json({ error: e.message }, { status: 400 });
  }
}

// Stripe success redirect (GET) - redirect user to download page
export async function GET(req: Request) {
  const url = new URL(req.url);
  const orderNo = url.searchParams.get('order_no');

  if (orderNo) {
    // Redirect to a success page with the order number
    return Response.redirect(siteConfig.app_url + '/download?order=' + orderNo);
  }

  return Response.redirect(siteConfig.app_url);
}
