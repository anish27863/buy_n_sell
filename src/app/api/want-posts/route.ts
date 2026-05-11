import { NextResponse } from 'next/server';
import { db } from '@/db';
import { wantPosts, wantPostReplies, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

// GET: list all open want posts with reply counts
export async function GET() {
  try {
    const posts = await db
      .select({
        id: wantPosts.id,
        title: wantPosts.title,
        description: wantPosts.description,
        budget: wantPosts.budget,
        category: wantPosts.category,
        createdAt: wantPosts.createdAt,
        isOpen: wantPosts.isOpen,
        customerId: wantPosts.customerId,
        customerName: users.username,
      })
      .from(wantPosts)
      .innerJoin(users, eq(wantPosts.customerId, users.id))
      .where(eq(wantPosts.isOpen, true))
      .orderBy(desc(wantPosts.createdAt))
      .limit(100);

    // Get reply counts in a separate query
    const allReplies = await db.select({ postId: wantPostReplies.postId }).from(wantPostReplies);
    const replyCounts: Record<number, number> = {};
    allReplies.forEach(r => { replyCounts[r.postId] = (replyCounts[r.postId] || 0) + 1; });

    const enriched = posts.map(p => ({ ...p, replyCount: replyCounts[p.id] || 0 }));
    return NextResponse.json({ posts: enriched });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST: create a new want post (customers only)
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { title, description, budget, category } = await request.json();
    if (!title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

    const [post] = await db.insert(wantPosts).values({
      customerId: session.id,
      title: title.trim(),
      description: description?.trim() || null,
      budget: budget ? budget.toString() : null,
      category: category?.trim() || null,
      isOpen: true,
    }).returning();

    return NextResponse.json({ success: true, post });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
