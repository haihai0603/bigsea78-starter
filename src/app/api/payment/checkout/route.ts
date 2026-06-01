// Payment checkout API - create a payment session
import { requireAuth } from '@/core/auth';
import { paymentManager, StripeProvider, LemonSqueezyProvider } from '@/extensions/payment';
import { siteConfig } from '@/config';
import { getSnowId } from '@/shared/lib/hash';
import { respData, respErr } from '@/shared/lib/resp';

// Initialize providers on first call
let providersInitialized = false;
function initProviders() {
  if (providersInitialized) return;
  if (siteConfig.stripe_secret_key) {
    paymentManager.addProvider(new StripeProvider(), true);
  }
  if (siteConfig.lemonsqueezy_api_key) {
    paymentManager.addProvider(new LemonSqueezyProvider());
  }
  providersInitialized = true;
}

export async function POST(req: Request) {
  try {
    initProviders();

    const { product_id, payment_provider } = await req.json();
    if (!product_id) return respErr('product_id is required');

    // Get current user
    const user = await requireAuth(req);

    // TODO: Fetch product from DB, validate price server-side
    // const product = await getProductById(product_id);
    // if (!product) return respErr('Product not found');

    const orderNo = getSnowId();

    // Create payment session
    const checkout = await paymentManager.createPayment(
      {
        orderNo,
        productId: product_id, // will be payment provider's product ID
        price: {
          amount: 9900, // TODO: from product.price
          currency: 'cny',
        },
        customer: {
          email: user.email,
          name: user.name,
        },
        description: 'Product Name', // TODO: from product.name
        successUrl: siteConfig.app_url + '/api/payment/callback?order_no=' + orderNo,
        cancelUrl: siteConfig.app_url + '/pricing',
        metadata: {
          user_id: user.id,
          product_id,
        },
      },
      payment_provider
    );

    // TODO: Create order in DB with status=pending

    return respData(checkout);
  } catch (e: any) {
    return respErr('Checkout failed: ' + e.message);
  }
}
