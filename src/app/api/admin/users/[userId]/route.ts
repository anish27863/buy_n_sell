import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function PATCH(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { userId } = await params;
  const { action } = await request.json();
  const id = parseInt(userId);

  if (action === 'ban') {
    await db.update(users).set({ isBanned: true }).where(eq(users.id, id));
  } else if (action === 'unban') {
    await db.update(users).set({ isBanned: false }).where(eq(users.id, id));
  } else if (action === 'approve' || action === 'reject') {
    if (action === 'approve') {
      await db.update(users).set({ approvalStatus: 'approved', approvedByAdminId: session.id }).where(eq(users.id, id));
    } else {
      await db.update(users).set({ approvalStatus: 'rejected' }).where(eq(users.id, id));
    }

    // Send email notification to admin
    try {
      const { adminProfiles } = await import('@/db/schema');
      const { sendEmail } = await import('@/lib/mailer');
      const [admin] = await db.select().from(adminProfiles).where(eq(adminProfiles.userId, session.id));
      if (admin?.email) {
        const [customer] = await db.select().from(users).where(eq(users.id, id));
        await sendEmail({
          to: admin.email,
          subject: `Customer Application ${action.toUpperCase()}D - ${customer.username}`,
          text: `You have successfully ${action}ed the customer application for "${customer.username}".`
        });
      }
    } catch (e) {
      console.error('Failed to send notification email', e);
    }
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
