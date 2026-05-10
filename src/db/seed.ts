import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  console.log('Seeding database...');
  const passwordHash = await bcrypt.hash('changeme123', 12);
  
  await db.insert(schema.users).values({
    username: 'admin',
    passwordHash,
    role: 'admin',
  }).onConflictDoNothing({ target: schema.users.username });
  
  console.log('Admin user created successfully.');
  process.exit(0);
}

main().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
