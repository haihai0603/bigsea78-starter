import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

const email = 'autotest_0610@test.com';
const passwordHash = await bcrypt.hash('Test123456', 10);
const id = crypto.randomUUID();

const result = await sql`
    INSERT INTO users (id, email, name, password_hash, role, email_verified, created_at, updated_at)
    VALUES (${id}, ${email}, 'AutoTest', ${passwordHash}, 'user', true, NOW(), NOW())
    ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        email_verified = true,
        updated_at = NOW()
    RETURNING id, email, name, role, email_verified
`;
console.log('Upserted:', JSON.stringify(result));