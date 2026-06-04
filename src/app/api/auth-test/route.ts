// Simple auth test - no Better Auth, just check if module loads
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test 1: Check if better-auth can be imported
    const { betterAuth } = await import('better-auth');
    
    // Test 2: Check DATABASE_URL
    const dbUrl = process.env.DATABASE_URL || 'NOT_SET';
    const dbUrlPrefix = dbUrl.substring(0, 30);
    
    return NextResponse.json({
      status: 'ok',
      betterAuthImport: 'success',
      databaseUrlPrefix: dbUrlPrefix,
      databaseUrlLength: dbUrl.length,
      nodeEnv: process.env.NODE_ENV,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5),
    }, { status: 500 });
  }
}
