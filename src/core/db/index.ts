// Database layer - Neon PostgreSQL only
import { siteConfig } from '@/config';
import * as schema from './schema';

let _db: any = null;

export function db() {
  if (_db) return _db;

  // Neon PostgreSQL
  const { neon } = require('@neondatabase/serverless');
  const { drizzle } = require('drizzle-orm/neon-http');
  const sql = neon(siteConfig.database_url);
  _db = drizzle(sql, { schema });

  return _db;
}

export * from './schema';
