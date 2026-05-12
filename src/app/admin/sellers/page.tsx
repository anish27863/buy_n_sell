import { PageTransition } from '@/components/layout/PageTransition';
import { db } from '@/db';
import { users, sellerProfiles } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { SellerActions } from './SellerActions';

export const dynamic = 'force-dynamic';

const statusStyle = (s: string) =>
  s === 'approved' ? { bg: '#4CAF8720', text: '#4CAF87' } :
  s === 'rejected' ? { bg: '#E8545420', text: '#E85454' } :
  { bg: '#F0C04020', text: '#F0C040' };

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
      <div className="max-w-6xl mx-auto px-3 sm:px-6 md:px-8 py-6 md:py-12">
        <h1 className="text-xl sm:text-2xl md:text-4xl font-serif mb-4 md:mb-8 border-b border-[var(--color-border)] pb-3 md:pb-6">
          Merchant Approvals
        </h1>

        {sellersList.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-[var(--color-border)] rounded-xl text-[var(--color-text-muted)] italic text-sm">
            No merchant applications found.
          </div>
        ) : (
          <>
            {/* ── Mobile card list (< md) ── */}
            <div className="flex flex-col gap-3 md:hidden">
              {sellersList.map(seller => {
                const { bg, text } = statusStyle(seller.status);
                return (
                  <div key={seller.id} className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-sm leading-snug truncate">{seller.shopName}</div>
                        <div className="text-xs text-[var(--color-text-muted)] mt-0.5">@{seller.username}</div>
                      </div>
                      <span
                        className="flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                        style={{ backgroundColor: bg, color: text }}
                      >
                        {seller.status}
                      </span>
                    </div>

                    {seller.description && (
                      <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">{seller.description}</p>
                    )}

                    <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">
                      Applied {new Date(seller.createdAt).toLocaleDateString()}
                    </div>

                    {seller.status === 'pending' && (
                      <SellerActions sellerId={seller.id} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── Desktop table (md+) ── */}
            <div className="hidden md:block overflow-x-auto bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border)] text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
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
                  {sellersList.map(seller => {
                    const { bg, text } = statusStyle(seller.status);
                    return (
                      <tr key={seller.id} className="hover:bg-[var(--color-bg-secondary)] transition-colors">
                        <td className="p-4 font-medium">{seller.shopName}</td>
                        <td className="p-4 text-[var(--color-text-secondary)]">{seller.username}</td>
                        <td className="p-4 text-sm text-[var(--color-text-secondary)] max-w-xs truncate">{seller.description || '—'}</td>
                        <td className="p-4 text-sm text-[var(--color-text-secondary)]">{new Date(seller.createdAt).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span
                            className="px-2 py-1 rounded text-xs font-medium uppercase tracking-wider"
                            style={{ backgroundColor: bg, color: text }}
                          >
                            {seller.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {seller.status === 'pending' && <SellerActions sellerId={seller.id} />}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </PageTransition>
  );
}
