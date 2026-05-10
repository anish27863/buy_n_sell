import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, sellerProfiles } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { setAuthCookie } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const schema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  shopName: z.string().min(3).max(100),
  description: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, shopName, description } = schema.parse(body);

    const existingUser = await db.select().from(users).where(eq(users.username, username));
    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Use transaction for multiple inserts
    const [newUser] = await db.transaction(async (tx) => {
      const [u] = await tx.insert(users).values({
        username,
        passwordHash,
        role: 'seller',
      }).returning();

      await tx.insert(sellerProfiles).values({
        userId: u.id,
        shopName,
        description,
        approvalStatus: 'pending',
      });

      return [u];
    });

    await setAuthCookie({
      id: newUser.id,
      username: newUser.username,
      role: newUser.role as 'seller',
      approvalStatus: 'pending',
    });

    return NextResponse.json({ success: true, redirect: '/seller/pending' });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
}
