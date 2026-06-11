const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

async function run() {
    const pool = new Pool({
        connectionString: "postgresql://neondb_owner:npg_nQYzaOV3cbW1@ep-ancient-rice-aocsm9nj.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
        ssl: { rejectUnauthorized: false }
    });
    
    const email = 'autotest_0610@test.com';
    const passwordHash = await bcrypt.hash('Test123456', 10);
    const id = require('crypto').randomUUID();
    
    // Use quoted identifiers for case-sensitive column names
    const result = await pool.query(`
        INSERT INTO users (id, email, name, "passwordHash", role, "emailVerified", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
        ON CONFLICT (email) DO UPDATE SET
            "passwordHash" = EXCLUDED."passwordHash",
            "emailVerified" = true,
            "updatedAt" = NOW()
        RETURNING id, email, name, role, "emailVerified"
    `, [id, email, 'AutoTest', passwordHash, 'user']);
    
    console.log('Upserted:', JSON.stringify(result.rows));
    await pool.end();
}
run().catch(e => { console.error('ERROR:', e.message); process.exit(1); });