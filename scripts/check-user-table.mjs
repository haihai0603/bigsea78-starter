import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function main() {
  try {
    // Try raw column names from information_schema
    const cols = await sql`SELECT * FROM information_schema.columns WHERE table_name = 'user' ORDER BY ordinal_position`;
    console.log('Schema columns:', JSON.stringify(cols, null, 2));

    // Try selecting with explicit column names
    const result = await sql`SELECT id, email, name FROM "user" LIMIT 1`;
    console.log('Raw select result:', JSON.stringify(result));
  } catch (e) {
    console.error('Error:', e.message);
    // Try without quotes
    try {
      const result2 = await sql`SELECT id, email, name FROM user LIMIT 1`;
      console.log('Without quotes:', JSON.stringify(result2));
    } catch (e2) {
      console.error('Without quotes error:', e2.message);
    }
  }
}

main();
