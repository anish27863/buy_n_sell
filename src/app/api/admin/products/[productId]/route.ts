import { NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function PATCH(request: Request, { params }: { params: Promise<{ productId: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { productId } = await params;
  const { action } = await request.json();
  const id = parseInt(productId);

  if (action === 'activate') {
    await db.update(products).set({ isActive: true }).where(eq(products.id, id));
  } else if (action === 'deactivate') {
    await db.update(products).set({ isActive: false }).where(eq(products.id, id));
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
