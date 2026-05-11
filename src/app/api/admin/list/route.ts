import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, adminProfiles } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admins = await db
      .select({
        id: users.id,
        username: users.username,
        email: adminProfiles.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .leftJoin(adminProfiles, eq(users.id, adminProfiles.userId))
      .where(eq(users.role, 'admin'))
      .orderBy(desc(users.createdAt));

    return NextResponse.json({ admins });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch admins' }, { status: 500 });
  }
}
