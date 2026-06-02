// Type exports for database schema
// Import types from here to avoid circular dependencies

import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type { user, products, orders, downloads } from './schema';

export type User = InferSelectModel<typeof user>;
export type NewUser = InferInsertModel<typeof user>;
export type Product = InferSelectModel<typeof products>;
export type NewProduct = InferInsertModel<typeof products>;
export type Order = InferSelectModel<typeof orders>;
export type NewOrder = InferInsertModel<typeof orders>;
export type Download = InferSelectModel<typeof downloads>;
export type NewDownload = InferInsertModel<typeof downloads>;
