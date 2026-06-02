// Health check endpoint for Railway / monitoring
import { respData } from '@/shared/lib/resp';

export async function GET() {
  // TODO: add DB connectivity check if needed
  return respData({ status: 'ok', timestamp: Date.now() });
}
