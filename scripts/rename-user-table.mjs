import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function main() {
  try {
    // Rename user to users (user is a reserved keyword in PostgreSQL)
    await sql`ALTER TABLE "user" RENAME TO "users"`;
    console.log('✅ Table renamed: "user" → "users"');

    // Rename session to sessions (session is also reserved)
    await sql`ALTER TABLE "session" RENAME TO "sessions"`;
    console.log('✅ Table renamed: "session" → "sessions"');

    // Verify
    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`;
    console.log('All tables:', tables.map(t => t.table_name));
  } catch (e) {
    console.error('Error:', e.message);
  }
}

main();
