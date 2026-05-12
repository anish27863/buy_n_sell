import { PageTransition } from '@/components/layout/PageTransition';
import { db } from '@/db';
import { users, sellerProfiles, products } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function AdminDashboard() {
  let stats = { users: 0, sellers: 0, pending: 0, products: 0 };
  
  try {
    const allUsers = await db.select({ id: users.id, role: users.role, approvalStatus: users.approvalStatus }).from(users);
    const allSellers = await db.select({ id: sellerProfiles.id, status: sellerProfiles.approvalStatus }).from(sellerProfiles);
    const allProducts = await db.select({ id: products.id }).from(products).where(eq(products.isActive, true));

    stats.users = allUsers.filter(u => u.role === 'customer' && u.approvalStatus === 'approved').length;
    stats.sellers = allSellers.filter(s => s.status === 'approved').length;
    stats.pending = allSellers.filter(s => s.status === 'pending').length;
    stats.products = allProducts.length;
  } catch (e) {}

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-3 sm:px-6 md:px-8 py-6 md:py-12">
        <h1 className="text-xl sm:text-2xl md:text-4xl font-serif mb-6 md:mb-8 border-b border-[var(--color-border)] pb-3 md:pb-6">System Overview</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-12">
          <div className="bg-[var(--color-surface)] p-4 md:p-6 rounded-xl border border-[var(--color-border)]">
            <div className="text-[10px] sm:text-xs text-[var(--color-text-muted)] mb-1 sm:mb-2 uppercase tracking-widest leading-tight">Total Customers</div>
            <div className="text-2xl sm:text-3xl font-serif">{stats.users}</div>
          </div>
          <div className="bg-[var(--color-surface)] p-4 md:p-6 rounded-xl border border-[var(--color-border)]">
            <div className="text-[10px] sm:text-xs text-[var(--color-text-muted)] mb-1 sm:mb-2 uppercase tracking-widest leading-tight">Approved Sellers</div>
            <div className="text-2xl sm:text-3xl font-serif">{stats.sellers}</div>
          </div>
          <div className="bg-[var(--color-surface)] p-4 md:p-6 rounded-xl border border-[var(--color-border)]">
            <div className="text-[10px] sm:text-xs text-[var(--color-text-muted)] mb-1 sm:mb-2 uppercase tracking-widest leading-tight">Pending Approvals</div>
            <div className="text-2xl sm:text-3xl font-serif text-[var(--color-warning)]">{stats.pending}</div>
          </div>
          <div className="bg-[var(--color-surface)] p-4 md:p-6 rounded-xl border border-[var(--color-border)]">
            <div className="text-[10px] sm:text-xs text-[var(--color-text-muted)] mb-1 sm:mb-2 uppercase tracking-widest leading-tight">Active Listings</div>
            <div className="text-2xl sm:text-3xl font-serif text-[var(--color-accent)]">{stats.products}</div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
