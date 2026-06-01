// LemonSqueezy Payment Provider - great for digital products
// Implements the PaymentProvider interface

import {
  type PaymentProvider,
  type PaymentOrder,
  type CheckoutInfo,
  type PaymentEvent,
} from './index';
import { siteConfig } from '@/config';

export class LemonSqueezyProvider implements PaymentProvider {
  readonly name = 'lemonsqueezy';

  async createPayment(order: PaymentOrder): Promise<CheckoutInfo> {
    if (!siteConfig.lemonsqueezy_api_key || !siteConfig.lemonsqueezy_store_id) {
      throw new Error('LemonSqueezy API key or store ID not configured');
    }

    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/vnd.api+json',
        Authorization: 'Bearer ' + siteConfig.lemonsqueezy_api_key,
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              custom: {
                orderNo: order.orderNo,
                ...order.metadata,
              },
            },
          },
          relationships: {
            store: {
              data: { type: 'stores', id: siteConfig.lemonsqueezy_store_id },
            },
            variant: {
              data: { type: 'variants', id: order.productId },
            },
          },
        },
      }),
    });

    const result = await response.json();
    const checkoutUrl = result.data?.attributes?.url;
    const sessionId = result.data?.id;

    if (!checkoutUrl) {
      throw new Error('Failed to create LemonSqueezy checkout');
    }

    return { sessionId: String(sessionId), checkoutUrl };
  }

  async getPaymentEvent(request: Request): Promise<PaymentEvent> {
    const body = await request.text();
    const signature = request.headers.get('x-signature');

    if (!signature || !siteConfig.lemonsqueezy_signing_secret) {
      throw new Error('Missing LemonSqueezy signature or signing secret');
    }

    // Verify HMAC signature
    const crypto = await import('crypto');
    const hmac = crypto
      .createHmac('sha256', siteConfig.lemonsqueezy_signing_secret)
      .update(body)
      .digest('hex');

    if (hmac !== signature) {
      throw new Error('Invalid LemonSqueezy webhook signature');
    }

    const payload = JSON.parse(body);
    const eventName = payload.meta?.event_name;

    if (eventName === 'order_created') {
      return {
        eventType: 'payment.success',
        provider: 'lemonsqueezy',
        orderNo: payload.meta?.custom_data?.orderNo,
        paymentInfo: {
          transactionId: payload.data?.id,
          amount: payload.data?.attributes?.total ?? 0,
          currency: payload.data?.attributes?.currency ?? 'usd',
          email: payload.data?.attributes?.user_email,
          paidAt: new Date(payload.data?.attributes?.created_at),
        },
        rawEvent: payload,
      };
    }

    return {
      eventType: 'payment.failed',
      provider: 'lemonsqueezy',
      rawEvent: payload,
    };
  }
}
