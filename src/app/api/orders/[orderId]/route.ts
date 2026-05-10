import { NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, products, sellerProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

// PATCH /api/orders/[orderId] — mark as delivered
export async function PATCH(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params;
    const session = await getSession();
    if (!session || session.role !== 'seller') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const oid = parseInt(orderId);
    const { action } = await request.json();

    if (action !== 'deliver') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Fetch order and verify it belongs to this seller
    const [order] = await db.select().from(orders).where(eq(orders.id, oid));
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // Verify seller owns this order
    const [profile] = await db.select().from(sellerProfiles).where(eq(sellerProfiles.userId, session.id));
    if (!profile || order.sellerId !== profile.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (order.status === 'delivered') {
      return NextResponse.json({ error: 'Order already delivered' }, { status: 400 });
    }

    // Mark order as delivered
    await db.update(orders).set({ status: 'delivered' }).where(eq(orders.id, oid));

    // Update product: decrement both quantityAvailable and quantityFrozen by the ordered qty
    const [product] = await db.select().from(products).where(eq(products.id, order.productId));
    if (product) {
      const newFrozen = Math.max(0, (product.quantityFrozen || 0) - order.quantity);
      const newAvailable = Math.max(0, product.quantityAvailable - order.quantity);
      await db.update(products)
        .set({ quantityFrozen: newFrozen, quantityAvailable: newAvailable })
        .where(eq(products.id, product.id));
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Order PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
