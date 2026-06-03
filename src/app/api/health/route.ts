// Health check endpoint for Railway / monitoring
import { respData } from '@/shared/lib/resp';
import { db } from '@/core/db';
import { products } from '@/core/db/schema';

export async function GET() {
  try {
    // Test database connection
    const result = await db().select().from(products).limit(1);
    return respData({ 
      status: 'ok', 
      timestamp: Date.now(),
      db: 'connected',
      productCount: result.length
    });
  } catch (error: any) {
    return respData({ 
      status: 'error', 
      timestamp: Date.now(),
      db: 'failed',
      error: error.message
    });
  }
}
