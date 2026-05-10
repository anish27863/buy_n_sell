import { NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, products, chatSessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, quantity } = await request.json();

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json({ error: 'Invalid order data' }, { status: 400 });
    }

    // Fetch product and verify availability
    const [product] = await db.select().from(products).where(eq(products.id, productId));
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const available = product.quantityAvailable - (product.quantityFrozen || 0);
    if (quantity > available) {
      return NextResponse.json({ error: 'Not enough stock available' }, { status: 400 });
    }

    // Create order
    const [newOrder] = await db.insert(orders).values({
      customerId: session.id,
      sellerId: product.sellerId,
      productId: product.id,
      quantity,
      status: 'negotiating',
    }).returning();

    // Create chat session for this order
    await db.insert(chatSessions).values({
      orderId: newOrder.id,
      isActive: true,
    });

    // Freeze the requested quantity
    await db.update(products)
      .set({ quantityFrozen: (product.quantityFrozen || 0) + quantity })
      .where(eq(products.id, product.id));

    return NextResponse.json({ success: true, orderId: newOrder.id });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
