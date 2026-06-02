import { neon } from '@neondatabase/serverless';
const sql = neon('postgresql://neondb_owner:npg_gcuxXHmvj72S@ep-ancient-rice-aocsm9nj-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require');
const rows = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'products' ORDER BY ordinal_position`;
console.log(rows);
process.exit(0);
