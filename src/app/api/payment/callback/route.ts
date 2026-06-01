// Payment webhook callback - handle payment success/failure
import { paymentManager, StripeProvider, LemonSqueezyProvider } from '@/extensions/payment';
import { sendEmail, orderConfirmationEmail } from '@/extensions/email/resend';
import { siteConfig } from '@/config';
import { getUuid } from '@/shared/lib/hash';

export async function POST(req: Request) {
  try {
    // Determine provider from URL query or header
    const url = new URL(req.url);
    const provider = url.searchParams.get('provider') || 'stripe';

    const event = await paymentManager.getPaymentEvent(req, provider);

    if (event.eventType === 'payment.success' && event.orderNo) {
      // 1. Update order status to 'paid'
      // TODO: await updateOrderStatus(event.orderNo, 'paid', event.paymentInfo);

      // 2. Generate download token
      const downloadToken = getUuid();
      // TODO: await createDownloadToken(event.orderNo, downloadToken);

      // 3. Send email with download link
      if (event.paymentInfo?.email) {
        const downloadUrl = siteConfig.app_url + '/download?token=' + downloadToken;
        const emailContent = orderConfirmationEmail({
          productName: 'Product', // TODO: from order
          orderNo: event.orderNo,
          downloadUrl,
          amount: event.paymentInfo.amount,
          currency: event.paymentInfo.currency,
        });
        await sendEmail({
          to: event.paymentInfo.email,
          subject: emailContent.subject,
          html: emailContent.html,
        });
      }
    }

    return Response.json({ received: true });
  } catch (e: any) {
    console.error('Payment callback error:', e);
    return Response.json({ error: e.message }, { status: 400 });
  }
}

// Stripe sends POST, LemonSqueezy sends POST
export async function GET(req: Request) {
  return POST(req);
}
