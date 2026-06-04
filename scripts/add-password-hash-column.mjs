import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function main() {
  try {
    // Add passwordHash column
    await sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "passwordHash" text`;
    console.log('✅ passwordHash column added');

    // Verify
    const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'user' ORDER BY ordinal_position`;
    console.log('Current columns:', cols.map(c => c.column_name));
  } catch (e) {
    console.error('Error:', e.message);
  }
}

main();
