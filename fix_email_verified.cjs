const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_PuIx2CHU0gNh@ep-cool-term-a1k9vjrm-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function fix() {
  const client = await pool.connect();
  try {
    // 先查看当前值
    const check = await client.query('SELECT id, email, "emailVerified" FROM users WHERE email = $1', ['autotest_final@test.com']);
    console.log('当前值:', check.rows);
    
    // 更新为 true
    const result = await client.query('UPDATE users SET "emailVerified" = true WHERE email = $1 RETURNING id, email, "emailVerified"', ['autotest_final@test.com']);
    console.log('更新结果:', result.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

fix().catch(console.error);
