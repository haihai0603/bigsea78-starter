const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { users } = require('./src/core/db/schema');

const sql = neon("postgresql://neondb_owner:npg_nQYzaOV3cbW1@ep-ancient-rice-aocsm9nj.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require");
const db = drizzle(sql, { schema: require('./src/core/db/schema') });

async function run() {
    const result = await db.select().from(users).where(
        require('drizzle-orm').eq(users.email, 'autotest_final@test.com')
    ).limit(1);
    console.log('Drizzle result:', JSON.stringify(result));
    if (result[0]) {
        console.log('emailVerified type:', typeof result[0].emailVerified);
        console.log('emailVerified value:', result[0].emailVerified);
        console.log('passwordHash exists:', !!result[0].passwordHash);
    }
}
run().catch(e => { console.error(e.message); process.exit(1); });
