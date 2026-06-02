import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_gcuxXHmvj72S@ep-ancient-rice-aocsm9nj-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

const r = await pool.query(`
  SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_name = 'user' AND table_schema = 'public'
  ORDER BY ordinal_position
`);
console.log(JSON.stringify(r.rows, null, 2));
await pool.end();
