import { PageTransition } from '@/components/layout/PageTransition';
import { db } from '@/db';
import { orders, products, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { headers } from 'next/headers';

export default async function SellerDashboard() {
  const h = await headers();
  const userId = parseInt(h.get('x-user-id') || '0');

  let recentOrders = [];
  try {
    // In real app, we'd filter by seller's profile ID instead of user ID directly, 
    // but for scaffold we just show the structure.
    recentOrders = await db
      .select({
        id: orders.id,
        quantity: orders.quantity,
        status: orders.status,
        agreedPrice: orders.agreedPrice,
        productTitle: products.title,
        customerName: users.username,
      })
      .from(orders)
      .innerJoin(products, eq(orders.productId, products.id))
      .innerJoin(users, eq(orders.customerId, users.id))
      .orderBy(desc(orders.createdAt))
      .limit(10);
  } catch (e) {}

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-8 py-12">
        <h1 className="text-4xl font-serif mb-8 border-b border-[var(--color-border)] pb-6">Merchant Dashboard</h1>
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
            <div className="text-sm text-[var(--color-text-muted)] mb-2 uppercase tracking-widest">Active Listings</div>
            <div className="text-3xl font-serif">12</div>
          </div>
          <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
            <div className="text-sm text-[var(--color-text-muted)] mb-2 uppercase tracking-widest">Frozen Units</div>
            <div className="text-3xl font-serif text-[var(--color-warning)]">4</div>
          </div>
          <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
            <div className="text-sm text-[var(--color-text-muted)] mb-2 uppercase tracking-widest">Active Negotiations</div>
            <div className="text-3xl font-serif text-[var(--color-accent)]">3</div>
          </div>
          <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
            <div className="text-sm text-[var(--color-text-muted)] mb-2 uppercase tracking-widest">Delivered Today</div>
            <div className="text-3xl font-serif text-[var(--color-success)]">7</div>
          </div>
        </div>

        {/* Next Reset Timer */}
        <div className="mb-12 bg-gradient-to-r from-[var(--color-surface)] to-transparent p-6 rounded-xl border-l-4 border-[var(--color-accent)]">
          <h3 className="font-serif text-lg mb-1">Next Inventory Reset</h3>
          <p className="text-[var(--color-text-secondary)] text-sm">All products will be wiped at 03:30 UTC. Make sure to complete your deliveries.</p>
        </div>

        {/* Orders Table */}
        <h2 className="text-2xl font-serif mb-6">Active Orders & Negotiations</h2>
        <div className="overflow-x-auto bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
          <table className="w-full text-left">
            <thead className="bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border)] text-sm uppercase tracking-wider text-[var(--color-text-muted)]">
              <tr>
                <th className="p-4 font-medium">Product</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Qty</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Agreed Price</th>
                <th className="p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--color-text-muted)] italic">No active orders found.</td>
                </tr>
              ) : (
                recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-[var(--color-bg-secondary)] transition-colors">
                    <td className="p-4">{order.productTitle}</td>
                    <td className="p-4">{order.customerName}</td>
                    <td className="p-4">{order.quantity}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wider ${order.status === 'delivered' ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]' : 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4">{order.agreedPrice ? `$${order.agreedPrice}` : '—'}</td>
                    <td className="p-4">
                      <a href={`/seller/chat/${order.id}`} className="text-sm font-medium text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors border-b border-[var(--color-text-primary)] hover:border-[var(--color-accent)]">Open Chat</a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageTransition>
  );
}
