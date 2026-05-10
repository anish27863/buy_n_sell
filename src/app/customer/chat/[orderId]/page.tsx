import { PageTransition } from '@/components/layout/PageTransition';
import { ChatBox } from '@/components/chat/ChatBox';
import { db } from '@/db';
import { orders, products, sellerProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';

export default async function CustomerChatPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const session = await getSession();
  if (!session) redirect('/');

  const oid = parseInt(orderId);
  if (isNaN(oid)) return notFound();

  let order: any = null;
  let product: any = null;
  let seller: any = null;

  try {
    const [o] = await db.select().from(orders).where(eq(orders.id, oid));
    if (!o || o.customerId !== session.id) return notFound();
    order = o;

    const [p] = await db.select().from(products).where(eq(products.id, o.productId));
    product = p;

    if (p) {
      const [s] = await db.select().from(sellerProfiles).where(eq(sellerProfiles.id, p.sellerId));
      seller = s;
    }
  } catch (e) {
    console.error(e);
  }

  if (!order) return notFound();

  return (
    <PageTransition>
      <div className="flex flex-col h-[calc(100vh-73px)]">
        {/* Chat Header */}
        <div className="border-b border-[var(--color-border)] px-6 py-4 flex justify-between items-center bg-[var(--color-bg-secondary)]">
          <div>
            <h1 className="font-serif text-xl">{product?.title || 'Order Chat'}</h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              Negotiating with <span className="text-[var(--color-accent)]">{seller?.shopName || 'Seller'}</span>
              {' '} · Qty: {order.quantity}
              {order.status === 'negotiating' && ' · 🔴 Negotiating'}
              {order.status === 'confirmed' && ' · 🟢 Confirmed'}
              {order.status === 'delivered' && ' · ✅ Delivered'}
            </p>
          </div>
          <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest">
            Order #{order.id}
          </div>
        </div>

        <ChatBox orderId={oid} currentUserId={session.id} />
      </div>
    </PageTransition>
  );
}
