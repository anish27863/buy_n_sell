import { NextResponse } from 'next/server';
import { db } from '@/db';
import { wantPostReplies, sellerProfiles, users } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

// GET: fetch replies for a post
export async function GET(request: Request, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params;
    const pid = parseInt(postId);
    const replies = await db
      .select({
        id: wantPostReplies.id,
        message: wantPostReplies.message,
        createdAt: wantPostReplies.createdAt,
        shopName: sellerProfiles.shopName,
        sellerId: wantPostReplies.sellerId,
      })
      .from(wantPostReplies)
      .innerJoin(sellerProfiles, eq(wantPostReplies.sellerId, sellerProfiles.id))
      .where(eq(wantPostReplies.postId, pid))
      .orderBy(asc(wantPostReplies.createdAt));
    return NextResponse.json({ replies });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to fetch replies' }, { status: 500 });
  }
}

// POST: create a reply (sellers only)
export async function POST(request: Request, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params;
    const session = await getSession();
    if (!session || session.role !== 'seller') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const pid = parseInt(postId);
    const { message } = await request.json();
    if (!message?.trim()) return NextResponse.json({ error: 'Message is required' }, { status: 400 });

    const [profile] = await db.select().from(sellerProfiles).where(eq(sellerProfiles.userId, session.id));
    if (!profile) return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 });

    const [reply] = await db.insert(wantPostReplies).values({
      postId: pid,
      sellerId: profile.id,
      message: message.trim(),
    }).returning();

    return NextResponse.json({ success: true, reply });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to post reply' }, { status: 500 });
  }
}
