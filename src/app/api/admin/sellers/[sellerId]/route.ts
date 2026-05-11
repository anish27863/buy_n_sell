import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sellerProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function PATCH(request: Request, { params }: { params: Promise<{ sellerId: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { sellerId } = await params;
  const { status } = await request.json();
  const id = parseInt(sellerId);

  const update: any = { approvalStatus: status };
  if (status === 'approved') update.approvedByAdminId = session.id;

  await db.update(sellerProfiles).set(update).where(eq(sellerProfiles.id, id));

  // Send email notification to admin
  try {
    const { adminProfiles } = await import('@/db/schema');
    const { sendEmail } = await import('@/lib/mailer');
    const [admin] = await db.select().from(adminProfiles).where(eq(adminProfiles.userId, session.id));
    if (admin?.email) {
      const [seller] = await db.select().from(sellerProfiles).where(eq(sellerProfiles.id, id));
      await sendEmail({
        to: admin.email,
        subject: `Seller Application ${status.toUpperCase()} - ${seller.shopName}`,
        text: `You have successfully ${status} the seller application for "${seller.shopName}".`
      });
    }
  } catch (e) {
    console.error('Failed to send notification email', e);
  }

  return NextResponse.json({ success: true });
}
