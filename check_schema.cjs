const { Pool } = require('pg');

async function run() {
    const pool = new Pool({
        connectionString: "postgresql://neondb_owner:npg_nQYzaOV3cbW1@ep-ancient-rice-aocsm9nj.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
        ssl: { rejectUnauthorized: false }
    });
    
    // Find hash-related columns
    const cols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name LIKE '%hash%'");
    console.log('Hash columns:', cols.rows);
    
    // Also check sample user data
    const sample = await pool.query("SELECT * FROM users LIMIT 2");
    console.log('Sample user columns:', sample.fields.map(f => f.name));
    console.log('Sample user data:', sample.rows);
    
    await pool.end();
}
run().catch(e => { console.error('ERROR:', e.message); process.exit(1); });