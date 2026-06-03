// Database layer - Neon PostgreSQL only
import { siteConfig } from '@/config';
import * as schema from './schema';

let _db: any = null;
let _sql: any = null;

export function db() {
  if (_db) return _db;

  // Neon PostgreSQL with better connection handling
  const { neon } = require('@neondatabase/serverless');
  const { drizzle } = require('drizzle-orm/neon-http');
  
  // Use DATABASE_URL as-is (Neon pooler endpoints work fine)
  _sql = neon(siteConfig.database_url);
  _db = drizzle(_sql, { schema });

  return _db;
}

export function testDb() {
  return _sql?.select(1).then(() => true).catch(() => false);
}

export * from './schema';
