import { NextResponse } from 'next/server';
import { db } from '@/db';
import { products, sellerProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'seller') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify seller is approved and get profile ID
    const [profile] = await db.select().from(sellerProfiles).where(eq(sellerProfiles.userId, session.id));
    if (!profile || profile.approvalStatus !== 'approved') {
      return NextResponse.json({ error: 'Account pending approval' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, category, mrp, quantityAvailable, tags, images } = body;

    if (!title || !category || !mrp || !quantityAvailable) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [newProduct] = await db.insert(products).values({
      sellerId: profile.id,
      title,
      description,
      category,
      mrp: mrp.toString(),
      quantityAvailable,
      tags,
      images: images && images.length > 0 ? images : null,
      isActive: true,
    }).returning();

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
