import { NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { headers } from 'next/headers';

export async function GET(request: Request) {
  const h = await headers();
  const authHeader = h.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // The prompt requires deleting ALL rows from products daily
    await db.delete(products);
    return NextResponse.json({ success: true, message: 'All listings reset successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reset listings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return await GET(request);
}
