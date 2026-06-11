// Admin seed endpoint - update product data for OSS download
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/core/db';
import { products } from '@/core/db/schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, productId, updates } = body;
    
    // Simple auth check
    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!productId || !updates) {
      return NextResponse.json({ error: 'Missing productId or updates' }, { status: 400 });
    }
    
    // Update product using drizzle
    const result = await db.update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where((products as any).id ? (products as any).id : null)
      .returning();
    
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Admin seed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
