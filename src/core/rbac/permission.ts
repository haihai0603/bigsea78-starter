// RBAC Permission Guards - simplified from ShipAny
// Only two roles: admin | user

import { requireAuth } from '@/core/auth';
import type { AuthUser } from '@/core/auth';

export async function requireAdmin(request: Request): Promise<AuthUser> {
  const user = await requireAuth(request);
  if (user.role !== 'admin') {
    throw new Error('Forbidden: admin access required');
  }
  return user;
}

export async function requirePermission(
  request: Request,
  code: string
): Promise<AuthUser> {
  const user = await requireAuth(request);
  // Admin has all permissions
  if (user.role === 'admin') return user;
  // TODO: check user-specific permissions from role_permissions table
  throw new Error('Forbidden: insufficient permissions');
}

// HOC for API routes
export function withPermission(code: string) {
  return async (request: Request) => {
    return requirePermission(request, code);
  };
}
