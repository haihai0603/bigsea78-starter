// Database layer - supports singleton (server) and serverless (Vercel) modes
// Inspired by ShipAny's dual-mode design

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { siteConfig } from '@/config';

// Singleton for traditional server mode
let _db: ReturnType<typeof drizzle> | null = null;
let _sql: ReturnType<typeof neon> | null = null;

function getSqlConnection() {
  if (!_sql) {
    _sql = neon(siteConfig.database_url);
  }
  return _sql;
}

export function db() {
  if (siteConfig.database_provider === 'postgresql') {
    // Serverless mode: new connection per request (safe for Vercel)
    if (!siteConfig.database_url) {
      throw new Error('DATABASE_URL is not configured');
    }
    const sql = neon(siteConfig.database_url);
    return drizzle(sql, { schema });
  }

  // Singleton mode: reuse connection (for long-running server)
  if (!_db) {
    const sql = getSqlConnection();
    _db = drizzle(sql, { schema });
  }
  return _db;
}

export * from './schema';
