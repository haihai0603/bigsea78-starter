const { Pool } = require('pg');
async function run() {
    const pool = new Pool({
        connectionString: "postgresql://neondb_owner:npg_nQYzaOV3cbW1@ep-ancient-rice-aocsm9nj.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
        ssl: { rejectUnauthorized: false }
    });
    // Check with explicit case
    const r = await pool.query("SELECT id, email, \"emailVerified\" FROM users WHERE email = 'autotest_final@test.com'");
    console.log('Direct PG query:', JSON.stringify(r.rows));
    
    // Also check autotest_0610
    const r2 = await pool.query("SELECT id, email, \"emailVerified\" FROM users WHERE email = 'autotest_0610@test.com'");
    console.log('autotest_0610:', JSON.stringify(r2.rows));
    
    await pool.end();
}
run().catch(e => { console.error(e.message); process.exit(1); });
