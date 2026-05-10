import { PageTransition } from '@/components/layout/PageTransition';
import { db } from '@/db';
import { products, sellerProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default async function SellerListings() {
  const session = await getSession();
  const userId = session?.id || 0;

  let items = [];
  try {
    const [seller] = await db.select().from(sellerProfiles).where(eq(sellerProfiles.userId, userId));
    if (seller) {
      items = await db.select().from(products).where(eq(products.sellerId, seller.id));
    }
  } catch (e) {}

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-8 py-12">
        <header className="flex justify-between items-end mb-8 border-b border-[var(--color-border)] pb-6">
          <h1 className="text-4xl font-serif">Your Listings</h1>
          <Link href="/seller/listings/new">
            <Button className="font-serif italic tracking-wide">+ New Listing</Button>
          </Link>
        </header>

        <div className="overflow-x-auto bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
          <table className="w-full text-left">
            <thead className="bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border)] text-sm uppercase tracking-wider text-[var(--color-text-muted)]">
              <tr>
                <th className="p-4 font-medium">Image</th>
                <th className="p-4 font-medium">Title</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">MRP</th>
                <th className="p-4 font-medium">Listed Qty</th>
                <th className="p-4 font-medium">Frozen</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[var(--color-text-muted)] italic">You have no active listings.</td>
                </tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="hover:bg-[var(--color-bg-secondary)] transition-colors">
                    <td className="p-4">
                      <div className="w-12 h-12 rounded bg-[var(--color-bg-primary)] border border-[var(--color-border)] overflow-hidden">
                        {item.images && item.images[0] ? (
                          <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-[var(--color-text-muted)]">N/A</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-medium">{item.title}</td>
                    <td className="p-4 text-sm text-[var(--color-text-secondary)]">{item.category}</td>
                    <td className="p-4 font-mono text-[var(--color-text-secondary)]">${Number(item.mrp).toFixed(2)}</td>
                    <td className="p-4">{item.quantityAvailable}</td>
                    <td className="p-4 text-[var(--color-warning)]">{item.quantityFrozen || 0}</td>
                    <td className="p-4">
                      {item.isActive ? (
                        <span className="text-[var(--color-success)] text-xs uppercase tracking-widest">Active</span>
                      ) : (
                        <span className="text-[var(--color-danger)] text-xs uppercase tracking-widest">Inactive</span>
                      )}
                    </td>
                    <td className="p-4 flex gap-3">
                      <button className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">Edit</button>
                      <button className="text-sm text-[var(--color-danger)] hover:text-red-400 transition-colors">Delete</button>
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
