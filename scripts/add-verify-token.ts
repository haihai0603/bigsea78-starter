import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_gcuxXHmvj72S@ep-floral-mode-ao70d9eg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require');

async function migrate() {
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS "verifyToken" text`;
    console.log('✅ Migration completed: verifyToken column added');
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log('✅ Column already exists');
    } else {
      console.error('❌ Migration error:', error.message);
    }
  }
  process.exit(0);
}

migrate();
