import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, adminProfiles } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const schema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { username, password, email } = schema.parse(body);

    const existingUser = await db.select().from(users).where(eq(users.username, username));
    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }

    const existingEmail = await db.select().from(adminProfiles).where(eq(adminProfiles.email, email));
    if (existingEmail.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const newUsers = await db.insert(users).values({
      username,
      passwordHash,
      role: 'admin',
    }).returning();
    const newUser = (newUsers as any[])[0];

    await db.insert(adminProfiles).values({
      userId: newUser.id,
      email,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Admin creation error:', error);
    return NextResponse.json({ error: error?.message || 'Invalid data' }, { status: 400 });
  }
}
