// Stripe webhook handler
// POST: verify signature and handle checkout.session.completed
// GET: health check (Stripe webhook tester)

import { NextRequest, NextResponse } from 'next/server';
import { StripeProvider } from '@/extensions/payment/stripe';
import { siteConfig } from '@/config';
import {
  getOrderByNo,
  updateOrderStatus,
  createDownload,
  getProductById,
} from '@/core/db/queries';
import { sendEmail, orderConfirmationEmail } from '@/extensions/email/resend';
import { respData, respErr } from '@/shared/lib/resp';
import { randomUUID } from 'crypto';

// Disable Next.js body parsing (need raw body for Stripe)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Handle Stripe webhook POST
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for Stripe signature verification
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return respErr('Missing stripe-signature header', 400);
    }

    if (!siteConfig.stripe_signing_secret) {
      return respErr('Stripe webhook secret not configured', 500);
    }

    // Verify webhook event using StripeProvider
    const provider = new StripeProvider();
    
    // Construct the event
    const stripe = new (await import('stripe')).default(
      siteConfig.stripe_secret_key,
      { apiVersion: '2026-05-27.dahlia' as any }
    );
    
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      siteConfig.stripe_signing_secret
    );

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      
      // Get order number from metadata
      const orderNo = session.metadata?.orderNo;
      if (!orderNo) {
        console.error('No orderNo in session metadata');
        return respErr('Invalid session: missing orderNo', 400);
      }

      // Get order from database
      const order = await getOrderByNo(orderNo);
      if (!order) {
        console.error(`Order not found: ${orderNo}`);
        return respErr(`Order not found: ${orderNo}`, 404);
      }

      // Update order status to paid
      await updateOrderStatus(orderNo, 'paid', session.payment_intent as string);

      // Get product to create download record
      const product = await getProductById(order.productId);
      if (!product) {
        console.error(`Product not found: ${order.productId}`);
        return respErr(`Product not found: ${order.productId}`, 404);
      }

      // Create download record
      const downloadToken = randomUUID();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
      await createDownload({
        id: randomUUID(),
        orderId: order.id,
        userId: order.userId,
        token: downloadToken,
        expiresAt,
        maxDownloads: 3,
      });

      // Send confirmation email if email is available
      const customerEmail = session.customer_email || session.customer?.email;
      if (customerEmail) {
        try {
          const downloadUrl = `${siteConfig.app_url}/api/download?token=${downloadToken}`;
          const emailContent = orderConfirmationEmail({
            productName: product.name,
            orderNo: orderNo,
            downloadUrl: downloadUrl,
            amount: order.amount,
            currency: order.currency,
          });
          
          await sendEmail({
            to: customerEmail,
            subject: emailContent.subject,
            html: emailContent.html,
          });
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
          // Don't fail the webhook if email fails
        }
      }

      console.log(`Order ${orderNo} paid successfully, download token: ${downloadToken}`);
    }

    return respData({ received: true, type: event.type });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return respErr(error.message || 'Webhook handler failed', 400);
  }
}

/**
 * GET handler for Stripe webhook testing
 */
export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'Stripe webhook endpoint is active' });
}
