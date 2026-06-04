// Test JWT auth dependencies
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test 1: Import bcryptjs
    const bcrypt = await import('bcryptjs');
    
    // Test 2: Import jsonwebtoken  
    const jwt = await import('jsonwebtoken');
    
    // Test 3: Try to hash a password
    const hash = await bcrypt.hash('test123', 10);
    
    // Test 4: Try to create a JWT
    const token = jwt.sign({ test: 'data' }, 'secret', { expiresIn: '1h' });
    
    return NextResponse.json({
      status: 'ok',
      bcryptImport: 'success',
      jwtImport: 'success',
      hashTest: hash.substring(0, 20) + '...',
      tokenTest: token.substring(0, 20) + '...',
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5),
    }, { status: 500 });
  }
}
