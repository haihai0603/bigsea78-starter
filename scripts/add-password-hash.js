// Add passwordHash column to user table if not exists
const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');

const sql = neon(process.env.DATABASE_URL || '');
const db = drizzle(sql);

async function main() {
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
