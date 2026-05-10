import { PageTransition } from '@/components/layout/PageTransition';
import { db } from '@/db';
import { users, sellerProfiles, products } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function AdminDashboard() {
  let stats = { users: 0, sellers: 0, pending: 0, products: 0 };
  
  try {
    const allUsers = await db.select({ id: users.id, role: users.role }).from(users);
    const allSellers = await db.select({ id: sellerProfiles.id, status: sellerProfiles.approvalStatus }).from(sellerProfiles);
    const allProducts = await db.select({ id: products.id }).from(products).where(eq(products.isActive, true));

    stats.users = allUsers.filter(u => u.role === 'customer').length;
    stats.sellers = allSellers.filter(s => s.status === 'approved').length;
    stats.pending = allSellers.filter(s => s.status === 'pending').length;
    stats.products = allProducts.length;
  } catch (e) {}

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-8 py-12">
        <h1 className="text-4xl font-serif mb-8 border-b border-[var(--color-border)] pb-6">System Overview</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
            <div className="text-sm text-[var(--color-text-muted)] mb-2 uppercase tracking-widest">Total Customers</div>
            <div className="text-3xl font-serif">{stats.users}</div>
          </div>
          <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
            <div className="text-sm text-[var(--color-text-muted)] mb-2 uppercase tracking-widest">Approved Sellers</div>
            <div className="text-3xl font-serif">{stats.sellers}</div>
          </div>
          <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
            <div className="text-sm text-[var(--color-text-muted)] mb-2 uppercase tracking-widest">Pending Approvals</div>
            <div className="text-3xl font-serif text-[var(--color-warning)]">{stats.pending}</div>
          </div>
          <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
            <div className="text-sm text-[var(--color-text-muted)] mb-2 uppercase tracking-widest">Active Listings</div>
            <div className="text-3xl font-serif text-[var(--color-accent)]">{stats.products}</div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
