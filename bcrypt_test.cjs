const bcrypt = require('bcryptjs');

// Get the stored hash from DB
const { Pool } = require('pg');
async function run() {
    const pool = new Pool({
        connectionString: "postgresql://neondb_owner:npg_nQYzaOV3cbW1@ep-ancient-rice-aocsm9nj.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
        ssl: { rejectUnauthorized: false }
    });
    
    const r = await pool.query("SELECT \"passwordHash\" FROM users WHERE email = 'autotest_final@test.com'");
    const storedHash = r.rows[0].passwordHash;
    console.log('Stored hash:', storedHash);
    
    // Test bcrypt compare
    const testPassword = 'Test123456';
    const match = await bcrypt.compare(testPassword, storedHash);
    console.log('bcrypt.compare result:', match);
    
    // Also verify the hash was generated with the same version
    console.log('Hash prefix:', storedHash.substring(0, 4));
    
    await pool.end();
}
run().catch(e => { console.error(e.message); process.exit(1); });
