// Add passwordHash column to user table if not exists
import { siteConfig } from '@/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

async function main() {
  const sql = neon(siteConfig.database_url);
  const db = drizzle(sql);

  try {
    // Check if column exists
    const check = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user' AND column_name = 'passwordHash'
    `;

    if (check.length === 0) {
      console.log('Adding passwordHash column to user table...');
      await sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT`;
      console.log('✓ Column added successfully');
    } else {
      console.log('Column passwordHash already exists');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
