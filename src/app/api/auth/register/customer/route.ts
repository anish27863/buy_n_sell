import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { setAuthCookie } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const schema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = schema.parse(body);

    const existingUser = await db.select().from(users).where(eq(users.username, username));
    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [newUser] = await db.insert(users).values({
      username,
      passwordHash,
      role: 'customer',
    }).returning();

    await setAuthCookie({
      id: newUser.id,
      username: newUser.username,
      role: newUser.role as 'customer',
    });

    return NextResponse.json({ success: true, redirect: '/customer/dashboard' });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
}
