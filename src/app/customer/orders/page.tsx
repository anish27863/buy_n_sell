import { PageTransition } from '@/components/layout/PageTransition';
import { db } from '@/db';
import { orders, products, sellerProfiles } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function MyOrdersPage() {
  const session = await getSession();
  if (!session) redirect('/');

  let myOrders: any[] = [];
  try {
    myOrders = await db
      .select({
        id: orders.id,
        quantity: orders.quantity,
        status: orders.status,
        agreedPrice: orders.agreedPrice,
        createdAt: orders.createdAt,
        productTitle: products.title,
        productCategory: products.category,
        shopName: sellerProfiles.shopName,
      })
      .from(orders)
      .innerJoin(products, eq(orders.productId, products.id))
      .innerJoin(sellerProfiles, eq(orders.sellerId, sellerProfiles.id))
      .where(eq(orders.customerId, session.id))
      .orderBy(desc(orders.createdAt))
      .limit(50);
  } catch (e) {
    console.error(e);
  }

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
        <h1 className="text-4xl font-serif mb-8 border-b border-[var(--color-border)] pb-6">My Orders</h1>

        <div className="space-y-4">
          {myOrders.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-[var(--color-border)] rounded-lg">
              <p className="text-[var(--color-text-muted)] italic mb-4">You haven't placed any orders yet.</p>
              <Link href="/customer/shop">
                <Button className="font-serif italic">Browse the Shop →</Button>
              </Link>
            </div>
          ) : (
            myOrders.map((order) => (
              <div key={order.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 flex justify-between items-center hover:border-[var(--color-text-muted)] transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="font-serif text-lg">{order.productTitle}</h2>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                      order.status === 'delivered' ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]' :
                      order.status === 'confirmed' ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]' :
                      'bg-[var(--color-warning)]/20 text-[var(--color-warning)]'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)] flex gap-3">
                    <span className="uppercase tracking-widest text-[var(--color-accent)]">{order.productCategory}</span>
                    <span>·</span>
                    <span>Qty: {order.quantity}</span>
                    <span>·</span>
                    <span>Seller: {order.shopName}</span>
                    <span>·</span>
                    <span>{new Date(order.createdAt || Date.now()).toLocaleDateString()}</span>
                    {order.agreedPrice && (
                      <>
                        <span>·</span>
                        <span className="text-[var(--color-success)]">Agreed: ${Number(order.agreedPrice).toFixed(2)}</span>
                      </>
                    )}
                  </div>
                </div>
                <Link href={`/customer/chat/${order.id}`}>
                  <Button variant="ghost" className="text-xs font-serif italic border border-[var(--color-border)]">
                    Open Chat →
                  </Button>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </PageTransition>
  );
}
