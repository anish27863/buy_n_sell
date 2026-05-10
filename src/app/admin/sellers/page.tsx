import { PageTransition } from '@/components/layout/PageTransition';
import { db } from '@/db';
import { users, sellerProfiles } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { SellerActions } from './SellerActions';

export const dynamic = 'force-dynamic';

export default async function AdminSellersPage() {
  let sellersList: any[] = [];
  
  try {
    sellersList = await db
      .select({
        id: sellerProfiles.id,
        shopName: sellerProfiles.shopName,
        description: sellerProfiles.description,
        status: sellerProfiles.approvalStatus,
        createdAt: sellerProfiles.createdAt,
        username: users.username,
      })
      .from(sellerProfiles)
      .innerJoin(users, eq(sellerProfiles.userId, users.id))
      .orderBy(desc(sellerProfiles.createdAt));
  } catch (e) {
    console.error(e);
  }

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-8 py-12">
        <h1 className="text-4xl font-serif mb-8 border-b border-[var(--color-border)] pb-6">Merchant Approvals</h1>
        
        <div className="overflow-x-auto bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
          <table className="w-full text-left">
            <thead className="bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border)] text-sm uppercase tracking-wider text-[var(--color-text-muted)]">
              <tr>
                <th className="p-4 font-medium">Shop Name</th>
                <th className="p-4 font-medium">Owner</th>
                <th className="p-4 font-medium">Description</th>
                <th className="p-4 font-medium">Applied On</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {sellersList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--color-text-muted)] italic">No merchants found.</td>
                </tr>
              ) : (
                sellersList.map((seller) => (
                  <tr key={seller.id} className="hover:bg-[var(--color-bg-secondary)] transition-colors">
                    <td className="p-4 font-medium">{seller.shopName}</td>
                    <td className="p-4 text-[var(--color-text-secondary)]">{seller.username}</td>
                    <td className="p-4 text-sm text-[var(--color-text-secondary)] max-w-xs truncate">{seller.description || '—'}</td>
                    <td className="p-4 text-sm text-[var(--color-text-secondary)]">{new Date(seller.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wider ${
                        seller.status === 'approved' ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]' :
                        seller.status === 'rejected' ? 'bg-[var(--color-danger)]/20 text-[var(--color-danger)]' :
                        'bg-[var(--color-warning)]/20 text-[var(--color-warning)]'
                      }`}>
                        {seller.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {seller.status === 'pending' && (
                        <SellerActions sellerId={seller.id} />
                      )}
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
