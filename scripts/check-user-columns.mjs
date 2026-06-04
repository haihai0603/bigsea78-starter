import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function main() {
  try {
    const cols = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'user'
      ORDER BY ordinal_position
    `;
    console.log('User table columns:');
    console.log(JSON.stringify(cols, null, 2));

    // Also try a simple select
    const users = await sql`SELECT id, email FROM user LIMIT 1`;
    console.log('Sample user:', JSON.stringify(users));
  } catch (e) {
    console.error('Error:', e.message);
  }
}

main();
