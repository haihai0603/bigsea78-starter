// Admin endpoint to update product - called once to set up OSS download URL
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret } = body;
    
    // Simple auth
    if (secret !== process.env.AUTH_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { neon } = require('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL!);

    // Update the 智能抠图工具 Pro product
    await sql`
      UPDATE products 
      SET download_url = 'https://bigsea78.oss-cn-hongkong.aliyuncs.com/software/AI%E6%8A%A0%E5%9B%BE%E5%B7%A5%E5%85%B7_v2.0.exe',
          price = 0,
          name = 'AI智能抠图工具',
          description = '基于 AI 的智能抠图工具，一键去除背景，支持人像/商品/透明物体，输出 PNG 高清无损。完全免费！',
          updated_at = NOW()
      WHERE id = '3ee82f0d-0524-4a19-b5e5-f0b0681a9219'
    `;

    // Verify
    const [updated] = await sql`
      SELECT id, name, price, download_url FROM products WHERE id = '3ee82f0d-0524-4a19-b5e5-f0b0681a9219'
    `;

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error('Admin update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
