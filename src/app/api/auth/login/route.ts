import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, sellerProfiles } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { setAuthCookie } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const schema = z.object({
  username: z.string(),
  password: z.string(),
  role: z.enum(['customer', 'seller', 'admin']),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, role } = schema.parse(body);

    const [user] = await db.select().from(users).where(eq(users.username, username));
    if (!user || user.role !== role) {
      return NextResponse.json({ error: 'Invalid credentials or incorrect role' }, { status: 401 });
    }

    if (user.isBanned) {
      return NextResponse.json({ error: 'Account is banned' }, { status: 403 });
    }

    // Block pending customers from logging in
    if (role === 'customer' && user.approvalStatus === 'pending') {
      return NextResponse.json({ error: 'Your account is pending admin approval. Please check back later.' }, { status: 403 });
    }
    if (role === 'customer' && user.approvalStatus === 'rejected') {
      return NextResponse.json({ error: 'Your account application was rejected.' }, { status: 403 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    let approvalStatus;
    if (role === 'seller') {
      const [seller] = await db.select().from(sellerProfiles).where(eq(sellerProfiles.userId, user.id));
      approvalStatus = seller?.approvalStatus;
    }

    await setAuthCookie({
      id: user.id,
      username: user.username,
      role: user.role as any,
      approvalStatus: approvalStatus as any,
    });

    let redirectUrl = '/customer/dashboard';
    if (role === 'admin') redirectUrl = '/admin/dashboard';
    if (role === 'seller') redirectUrl = approvalStatus === 'approved' ? '/seller/dashboard' : '/seller/pending';

    return NextResponse.json({ success: true, redirect: redirectUrl });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
}
