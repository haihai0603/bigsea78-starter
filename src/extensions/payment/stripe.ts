// Stripe Payment Provider
// Implements the PaymentProvider interface

import Stripe from 'stripe';
import {
  type PaymentProvider,
  type PaymentOrder,
  type CheckoutInfo,
  type PaymentEvent,
  type PaymentInfo,
  PaymentStatus,
} from './index';
import { siteConfig } from '@/config';

export class StripeProvider implements PaymentProvider {
  readonly name = 'stripe';
  private client: Stripe;

  constructor() {
    if (!siteConfig.stripe_secret_key) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    this.client = new Stripe(siteConfig.stripe_secret_key, {
      apiVersion: '2026-05-27.dahlia',
    });
  }

  async createPayment(order: PaymentOrder): Promise<CheckoutInfo> {
    const session = await this.client.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: order.price.currency,
            unit_amount: order.price.amount,
            product_data: {
              name: order.description || order.orderNo,
            },
          },
          quantity: 1,
        },
      ],
      success_url: order.successUrl,
      cancel_url: order.cancelUrl,
      metadata: {
        orderNo: order.orderNo,
        ...order.metadata,
      },
      customer_email: order.customer?.email,
    });

    return {
      sessionId: session.id,
      checkoutUrl: session.url!,
    };
  }

  async getPaymentEvent(request: Request): Promise<PaymentEvent> {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    if (!sig || !siteConfig.stripe_signing_secret) {
      throw new Error('Missing Stripe signature or signing secret');
    }

    const event = this.client.webhooks.constructEvent(
      body,
      sig,
      siteConfig.stripe_signing_secret
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      return {
        eventType: 'payment.success',
        provider: 'stripe',
        orderNo: session.metadata?.orderNo,
        paymentInfo: {
          transactionId: session.payment_intent as string,
          amount: session.amount_total ?? 0,
          currency: session.currency ?? 'usd',
          email: session.customer_email ?? undefined,
          paidAt: new Date(),
        },
        rawEvent: event,
      };
    }

    return {
      eventType: 'payment.failed',
      provider: 'stripe',
      rawEvent: event,
    };
  }
}
