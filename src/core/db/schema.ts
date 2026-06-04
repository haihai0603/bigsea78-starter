// Database schema - Drizzle ORM with PostgreSQL
// Shared across all sites using this template
// Auth tables match Better Auth expectations exactly

import { pgTable, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';

// === Auth tables (Better Auth expects: singular table names, camelCase columns) ===

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').default(false),
  image: text('image'),
  passwordHash: text('passwordHash'),
  role: text('role').default('user'), // user | admin
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('userId').references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expiresAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('userId').references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  idToken: text('idToken'),
  password: text('password'), // for credential provider
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
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
  downloadUrl: text('download_url'),
  metadata: jsonb('metadata'),
  active: integer('active').notNull().default(1),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  userId: text('userId').references(() => users.id).notNull(),
  productId: text('productId').references(() => products.id).notNull(),
  orderNo: text('orderNo').notNull().unique(),
  status: text('status').notNull().default('pending'), // pending|paid|failed|refunded
  paymentProvider: text('paymentProvider'), // stripe|lemonsqueezy
  paymentId: text('paymentId'), // provider's payment/session ID
  amount: integer('amount').notNull(), // in cents
  currency: text('currency').notNull().default('cny'),
  paidAt: timestamp('paidAt'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export const downloads = pgTable('downloads', {
  id: text('id').primaryKey(),
  orderId: text('orderId').references(() => orders.id).notNull(),
  userId: text('userId').references(() => users.id).notNull(),
  token: text('token').notNull().unique(), // download token
  expiresAt: timestamp('expiresAt').notNull(),
  downloadCount: integer('downloadCount').notNull().default(0),
  maxDownloads: integer('maxDownloads').notNull().default(3),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

// === Permissions (optional admin) ===

export const permissions = pgTable('permissions', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export const rolePermissions = pgTable('role_permissions', {
  id: text('id').primaryKey(),
  role: text('role').notNull(),
  permissionId: text('permissionId').references(() => permissions.id).notNull(),
});
