import { PageTransition } from '@/components/layout/PageTransition';
import { db } from '@/db';
import { orders, products, users, sellerProfiles } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SellerDashboard() {
  const session = await getSession();
  const userId = session?.id || 0;

  let recentOrders: any[] = [];
  let stats = { listings: 0, frozenUnits: 0, activeNegotiations: 0, deliveredToday: 0 };

  try {
    const [profile] = await db.select().from(sellerProfiles).where(eq(sellerProfiles.userId, userId));

    if (profile) {
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

  const statusColor = (s: string) =>
    s === 'delivered' ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]' :
    s === 'confirmed' ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]' :
    'bg-[var(--color-warning)]/20 text-[var(--color-warning)]';

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-3 sm:px-6 md:px-8 py-6 md:py-12">
        <h1 className="text-xl sm:text-2xl md:text-4xl font-serif mb-4 md:mb-8 border-b border-[var(--color-border)] pb-3 md:pb-6">
          Merchant Dashboard
        </h1>

        {/* Stats Grid — 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-12">
          {[
            { label: 'Active Listings', value: stats.listings, color: '' },
            { label: 'Frozen Units', value: stats.frozenUnits, color: 'text-[var(--color-warning)]' },
            { label: 'Negotiating', value: stats.activeNegotiations, color: 'text-[var(--color-accent)]' },
            { label: 'Delivered Today', value: stats.deliveredToday, color: 'text-[var(--color-success)]' },
          ].map(stat => (
            <div key={stat.label} className="bg-[var(--color-surface)] p-3 sm:p-5 md:p-6 rounded-xl border border-[var(--color-border)]">
              <div className="text-[10px] sm:text-xs text-[var(--color-text-muted)] mb-1 sm:mb-2 uppercase tracking-widest leading-tight">{stat.label}</div>
              <div className={`text-2xl sm:text-3xl font-serif ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Orders Section */}
        <h2 className="text-base sm:text-xl md:text-2xl font-serif mb-3 md:mb-6">
          Active Orders &amp; Negotiations
        </h2>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-[var(--color-border)] rounded-xl text-[var(--color-text-muted)] italic text-sm">
            No active orders found.
          </div>
        ) : (
          <>
            {/* Mobile card list — hidden on md+ */}
            <div className="flex flex-col gap-3 md:hidden">
              {recentOrders.map(order => (
                <div key={order.id} className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="font-medium text-sm leading-tight flex-1 min-w-0 truncate">{order.productTitle}</div>
                    <span className={`flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-[var(--color-text-secondary)]">
                    <span>👤 {order.customerName} · qty {order.quantity}</span>
                    <span className="font-mono">{order.agreedPrice ? `Rs. ${Number(order.agreedPrice).toFixed(2)}` : '—'}</span>
                  </div>
                  <Link
                    href={`/seller/chat/${order.id}`}
                    className="mt-1 block text-center text-xs font-medium py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
                  >
                    Open Chat →
                  </Link>
                </div>
              ))}
            </div>

            {/* Desktop table — hidden on mobile */}
            <div className="hidden md:block overflow-x-auto bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border)] text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
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
                  {recentOrders.map(order => (
                    <tr key={order.id} className="hover:bg-[var(--color-bg-secondary)] transition-colors">
                      <td className="p-4 font-medium max-w-[180px] truncate">{order.productTitle}</td>
                      <td className="p-4 text-[var(--color-text-secondary)]">{order.customerName}</td>
                      <td className="p-4">{order.quantity}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wider ${statusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 font-mono">{order.agreedPrice ? `Rs. ${Number(order.agreedPrice).toFixed(2)}` : '—'}</td>
                      <td className="p-4">
                        <Link
                          href={`/seller/chat/${order.id}`}
                          className="text-sm font-medium text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors border-b border-[var(--color-text-primary)] hover:border-[var(--color-accent)]"
                        >
                          Open Chat
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </PageTransition>
  );
}
