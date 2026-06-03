// Better Auth catch-all route
import { auth } from '@/core/auth';

export const POST = auth.handler;
export const GET = auth.handler;
