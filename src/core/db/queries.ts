// Database query layer - all DB operations go through here
// This is the ONLY place that imports drizzle query builders

import { db } from './index';
import { user, products, orders, downloads, permissions, rolePermissions } from './schema';
import { eq, and, desc, count, like, sql } from 'drizzle-orm';
import type { Product, Order, Download, User } from './schema-types';

// Aliases for convenience
const users = user;

// === Users ===

export async function getUserById(id: string): Promise<User | undefined> {
  const rows = await db().select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] as User | undefined;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const rows = await db().select().from(users).where(eq(users.email, email)).limit(1);
  return rows[0] as User | undefined;
}

export async function updateUserRole(userId: string, role: string) {
  await db().update(users).set({ role } as any).where(eq(users.id, userId));
}

export async function getUsers(options?: {
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<User[]> {
  let query = db().select().from(users);

  if (options?.search) {
    query = query.where(
      like(users.email, `%${options.search}%`)
    ) as any;
  }

  return query
    .orderBy(desc(users.createdAt))
    .limit(options?.limit ?? 50)
    .offset(options?.offset ?? 0) as unknown as Promise<User[]>;
}

export async function getUserCount(search?: string): Promise<number> {
  const conditions = search
    ? [like(users.email, `%${search}%`)]
    : [];
  const result = await db()
    .select({ count: count() })
    .from(users)
    .where(conditions.length > 0 ? and(...conditions) : undefined) as any;
  return result[0]?.count ?? 0;
}

// === Products ===

export async function getProducts(options?: {
  category?: string;
  active?: boolean;
  limit?: number;
  offset?: number;
}): Promise<Product[]> {
  let query = db().select().from(products);

  const conditions = [];
  if (options?.category) conditions.push(eq(products.category, options.category));
  if (options?.active !== undefined) conditions.push(eq(products.active, options.active ? 1 : 0));

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  const q = query.orderBy(desc(products.createdAt)).limit(options?.limit ?? 50).offset(options?.offset ?? 0);
  return q as unknown as Promise<Product[]>;
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const rows = await db().select().from(products).where(eq(products.id, id)).limit(1);
  return rows[0] as Product | undefined;
}

export async function createProduct(data: {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  category: string;
  coverImage?: string;
  downloadUrl?: string;
  metadata?: any;
}): Promise<void> {
  await db().insert(products).values({
    ...data,
    currency: data.currency ?? 'cny',
    active: 1,
  });
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
  await db().update(products).set({ ...data, updatedAt: new Date() } as any).where(eq(products.id, id));
}

export async function deleteProduct(id: string): Promise<void> {
  await db().update(products).set({ active: 0, updatedAt: new Date() } as any).where(eq(products.id, id));
}

export async function getProductCount(): Promise<number> {
  const result = await db().select({ count: count() }).from(products);
  return result[0]?.count ?? 0;
}

// === Orders ===

export async function createOrder(data: {
  id: string;
  userId: string;
  productId: string;
  orderNo: string;
  amount: number;
  currency?: string;
  paymentProvider?: string;
}): Promise<void> {
  await db().insert(orders).values({
    ...data,
    status: 'pending',
    currency: data.currency ?? 'cny',
  });
}

export async function getOrderByNo(orderNo: string): Promise<Order | undefined> {
  const rows = await db().select().from(orders).where(eq(orders.orderNo, orderNo)).limit(1);
  return rows[0] as Order | undefined;
}

export async function getOrdersByUser(userId: string): Promise<Order[]> {
  return db().select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt)) as unknown as Promise<Order[]>;
}

export async function getOrders(options?: {
  limit?: number;
  offset?: number;
}): Promise<Order[]> {
  return db()
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(options?.limit ?? 50)
    .offset(options?.offset ?? 0) as unknown as Promise<Order[]>;
}

export async function updateOrderStatus(orderNo: string, status: string, paymentId?: string): Promise<void> {
  const updates: any = { status, updatedAt: new Date() };
  if (status === 'paid') updates.paidAt = new Date();
  if (paymentId) updates.paymentId = paymentId;
  await db().update(orders).set(updates).where(eq(orders.orderNo, orderNo));
}

export async function getOrderCount(): Promise<number> {
  const result = await db().select({ count: count() }).from(orders);
  return result[0]?.count ?? 0;
}

export async function getRecentOrders(limit = 10): Promise<Order[]> {
  return db().select().from(orders).orderBy(desc(orders.createdAt)).limit(limit) as unknown as Promise<Order[]>;
}

// === Downloads ===

export async function createDownload(data: {
  id: string;
  orderId: string;
  userId: string;
  token: string;
  expiresAt: Date;
  maxDownloads?: number;
}): Promise<void> {
  await db().insert(downloads).values({
    ...data,
    maxDownloads: data.maxDownloads ?? 3,
  });
}

export async function getDownloadByToken(token: string): Promise<Download | undefined> {
  const rows = await db().select().from(downloads).where(eq(downloads.token, token)).limit(1);
  return rows[0] as Download | undefined;
}

export async function incrementDownloadCount(token: string): Promise<void> {
  await db()
    .update(downloads)
    .set({ downloadCount: sql`download_count + 1` } as any)
    .where(eq(downloads.token, token));
}

// === Stats ===

export async function getDashboardStats() {
  const [productCount, orderCount] = await Promise.all([
    getProductCount(),
    getOrderCount(),
  ]);
  const userCount = (await db().select({ count: count() }).from(users))[0]?.count ?? 0;
  const recentOrders = await getRecentOrders(5);

  return { productCount, orderCount, userCount, recentOrders };
}
