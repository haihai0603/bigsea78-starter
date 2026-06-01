// Payment Manager - pluggable multi-provider payment system
// Inspired by ShipAny's PaymentManager pattern

// === Types ===
export interface PaymentPrice {
  amount: number; // in cents
  currency: string;
}

export interface PaymentCustomer {
  id?: string;
  email?: string;
  name?: string;
}

export interface PaymentOrder {
  orderNo: string;
  productId?: string;
  price: PaymentPrice;
  customer?: PaymentCustomer;
  description?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, any>;
}

export interface CheckoutInfo {
  sessionId: string;
  checkoutUrl: string;
}

export interface PaymentInfo {
  transactionId?: string;
  amount: number;
  currency: string;
  email?: string;
  paidAt?: Date;
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface PaymentEvent {
  eventType: 'checkout.success' | 'payment.success' | 'payment.failed';
  provider: string;
  orderNo?: string;
  paymentInfo?: PaymentInfo;
  rawEvent: any;
}

export interface PaymentProvider {
  readonly name: string;
  createPayment(order: PaymentOrder): Promise<CheckoutInfo>;
  getPaymentEvent(request: Request): Promise<PaymentEvent>;
}

// === PaymentManager ===
export class PaymentManager {
  private providers: Map<string, PaymentProvider> = new Map();
  private defaultProvider?: PaymentProvider;

  addProvider(provider: PaymentProvider, isDefault = false) {
    this.providers.set(provider.name, provider);
    if (isDefault) {
      this.defaultProvider = provider;
    }
  }

  getProvider(name?: string): PaymentProvider {
    if (name) {
      const provider = this.providers.get(name);
      if (!provider) throw new Error('Payment provider not found: ' + name);
      return provider;
    }
    if (!this.defaultProvider && this.providers.size > 0) {
      this.defaultProvider = this.providers.values().next().value;
    }
    if (!this.defaultProvider) throw new Error('No payment provider configured');
    return this.defaultProvider;
  }

  async createPayment(order: PaymentOrder, providerName?: string): Promise<CheckoutInfo> {
    const provider = this.getProvider(providerName);
    return provider.createPayment(order);
  }

  async getPaymentEvent(request: Request, providerName: string): Promise<PaymentEvent> {
    const provider = this.getProvider(providerName);
    return provider.getPaymentEvent(request);
  }

  getProviderNames(): string[] {
    return Array.from(this.providers.keys());
  }
}

// Global singleton
export const paymentManager = new PaymentManager();

// Re-export providers
export * from './stripe';
export * from './lemonsqueezy';
