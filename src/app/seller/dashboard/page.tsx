import { PageTransition } from '@/components/layout/PageTransition';
import { db } from '@/db';
import { orders, products, users, sellerProfiles } from '@/db/schema';
import { eq, desc, and, count, sum } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SellerDashboard() {
  const session = await getSession();
  const userId = session?.id || 0;

  let recentOrders: any[] = [];
  let stats = { listings: 0, frozenUnits: 0, activeNegotiations: 0, deliveredToday: 0 };

  try {
    // Get seller profile first
    const [profile] = await db.select().from(sellerProfiles).where(eq(sellerProfiles.userId, userId));

    if (profile) {
      // Fetch orders belonging to this seller only
      recentOrders = await db
        .select({
          id: orders.id,
          quantity: orders.quantity,
          status: orders.status,
          agreedPrice: orders.agreedPrice,
          createdAt: orders.createdAt,
          productTitle: products.title,
          customerName: users.username,
        })
        .from(orders)
        .innerJoin(products, eq(orders.productId, products.id))
        .innerJoin(users, eq(orders.customerId, users.id))
        .where(eq(orders.sellerId, profile.id))
        .orderBy(desc(orders.createdAt))
        .limit(20);

      // Real stats
      const allProducts = await db.select().from(products).where(eq(products.sellerId, profile.id));
      const activeListings = allProducts.filter(p => p.isActive).length;
      const frozenUnits = allProducts.reduce((sum, p) => sum + (p.quantityFrozen || 0), 0);
      const activeNegotiations = recentOrders.filter(o => o.status === 'negotiating').length;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const deliveredToday = recentOrders.filter(o =>
        o.status === 'delivered' && new Date(o.createdAt) >= today
      ).length;

      stats = { listings: activeListings, frozenUnits, activeNegotiations, deliveredToday };
    }
  } catch (e) {
    console.error('Seller dashboard error:', e);
  }

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        <h1 className="text-4xl font-serif mb-8 border-b border-[var(--color-border)] pb-6">Merchant Dashboard</h1>
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
            <div className="text-sm text-[var(--color-text-muted)] mb-2 uppercase tracking-widest">Active Listings</div>
            <div className="text-3xl font-serif">{stats.listings}</div>
          </div>
          <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
            <div className="text-sm text-[var(--color-text-muted)] mb-2 uppercase tracking-widest">Frozen Units</div>
            <div className="text-3xl font-serif text-[var(--color-warning)]">{stats.frozenUnits}</div>
          </div>
          <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
            <div className="text-sm text-[var(--color-text-muted)] mb-2 uppercase tracking-widest">Negotiating</div>
            <div className="text-3xl font-serif text-[var(--color-accent)]">{stats.activeNegotiations}</div>
          </div>
          <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
            <div className="text-sm text-[var(--color-text-muted)] mb-2 uppercase tracking-widest">Delivered Today</div>
            <div className="text-3xl font-serif text-[var(--color-success)]">{stats.deliveredToday}</div>
          </div>
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
                    <td className="p-4 font-medium">{order.productTitle}</td>
                    <td className="p-4 text-[var(--color-text-secondary)]">{order.customerName}</td>
                    <td className="p-4">{order.quantity}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wider ${
                        order.status === 'delivered' ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]' :
                        order.status === 'confirmed' ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]' :
                        'bg-[var(--color-warning)]/20 text-[var(--color-warning)]'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono">{order.agreedPrice ? `$${Number(order.agreedPrice).toFixed(2)}` : '—'}</td>
                    <td className="p-4">
                      <Link
                        href={`/seller/chat/${order.id}`}
                        className="text-sm font-medium text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors border-b border-[var(--color-text-primary)] hover:border-[var(--color-accent)]"
                      >
                        Open Chat
                      </Link>
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
