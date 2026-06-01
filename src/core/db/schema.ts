// Database schema - Drizzle ORM with PostgreSQL
// Shared across all sites using this template

import { pgTable, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';

// === Auth tables (Better Auth expects these) ===

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified').notNull().default(0),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  idToken: text('id_token'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// === Business tables ===

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: integer('price').notNull(), // in cents
  currency: text('currency').notNull().default('cny'),
  category: text('category').notNull(), // software|course|ebook|font|audio|template
  coverImage: text('cover_image'),
  downloadUrl: text('download_url'), // R2 path or external URL
  metadata: jsonb('metadata'), // arbitrary product-specific data
  active: integer('active').notNull().default(1),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  productId: text('product_id').references(() => products.id).notNull(),
  orderNo: text('order_no').notNull().unique(),
  status: text('status').notNull().default('pending'), // pending|paid|failed|refunded
  paymentProvider: text('payment_provider'), // stripe|lemonsqueezy
  paymentId: text('payment_id'), // provider's payment/session ID
  amount: integer('amount').notNull(), // in cents
  currency: text('currency').notNull().default('cny'),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const downloads = pgTable('downloads', {
  id: text('id').primaryKey(),
  orderId: text('order_id').references(() => orders.id).notNull(),
  userId: text('user_id').references(() => users.id).notNull(),
  token: text('token').notNull().unique(), // download token
  expiresAt: timestamp('expires_at').notNull(),
  downloadCount: integer('download_count').notNull().default(0),
  maxDownloads: integer('max_downloads').notNull().default(3),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// === Permissions (optional admin) ===

export const permissions = pgTable('permissions', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const rolePermissions = pgTable('role_permissions', {
  id: text('id').primaryKey(),
  role: text('role').notNull(),
  permissionId: text('permission_id').references(() => permissions.id).notNull(),
});
