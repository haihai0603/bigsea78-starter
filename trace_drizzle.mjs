// Trace what Drizzle actually returns for emailVerified
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';

const sql = neon("postgresql://neondb_owner:npg_nQYzaOV3cbW1@ep-ancient-rice-aocsm9nj.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require");

// Import schema via dynamic import
const schema = await import('./src/core/db/schema/index.js').catch(() => {
    // Try different path
    return import('./src/core/db/schema.js');
});

const schemaKeys = Object.keys(schema).filter(k => k !== '__esModule');
console.log('Schema exports:', schemaKeys);

// Find users table
const usersTable = schema.default?.users || schema.users;
if (!usersTable) {
    console.error('Could not find users table in schema');
    process.exit(1);
}

const db = drizzle(sql, { schema: { users: usersTable } });

const result = await db.select().from(usersTable).where(
    eq(usersTable.email, 'autotest_final@test.com')
).limit(1);

console.log('Drizzle result:', JSON.stringify(result, null, 2));
if (result[0]) {
    console.log('emailVerified type:', typeof result[0].emailVerified);
    console.log('emailVerified value:', result[0].emailVerified);
    console.log('Boolean(emailVerified):', !!result[0].emailVerified);
    console.log('passwordHash exists:', !!result[0].passwordHash);
}