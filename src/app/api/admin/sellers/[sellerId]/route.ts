import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sellerProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function PATCH(request: Request, { params }: { params: Promise<{ sellerId: string }> }) {
  try {
    const { sellerId } = await params;
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await request.json();
    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    await db.update(sellerProfiles)
      .set({ approvalStatus: newStatus })
      .where(eq(sellerProfiles.id, parseInt(sellerId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update seller status' }, { status: 500 });
  }
}
