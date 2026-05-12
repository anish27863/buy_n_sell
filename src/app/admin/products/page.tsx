import { PageTransition } from '@/components/layout/PageTransition';
import { db } from '@/db';
import { products, sellerProfiles } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { AdminProductActions } from './AdminProductActions';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  let allProducts: any[] = [];
  try {
    allProducts = await db
      .select({
        id: products.id,
        title: products.title,
        category: products.category,
        mrp: products.mrp,
        quantityAvailable: products.quantityAvailable,
        quantityFrozen: products.quantityFrozen,
        isActive: products.isActive,
        createdAt: products.createdAt,
        images: products.images,
        shopName: sellerProfiles.shopName,
      })
      .from(products)
      .innerJoin(sellerProfiles, eq(products.sellerId, sellerProfiles.id))
      .orderBy(desc(products.createdAt));
  } catch (e) {
    console.error(e);
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-6 md:py-12">
        <h1 className="text-xl sm:text-2xl md:text-4xl font-serif mb-4 md:mb-8 border-b border-[var(--color-border)] pb-3 md:pb-6">
          All Products <span className="text-sm md:text-lg text-[var(--color-text-muted)] font-sans">({allProducts.length})</span>
        </h1>

        {allProducts.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-[var(--color-border)] rounded-xl text-[var(--color-text-muted)] italic text-sm">
            No products found.
          </div>
        ) : (
          <>
            {/* ── Mobile cards (< md) ── */}
            <div className="flex flex-col gap-3 md:hidden">
              {allProducts.map(p => (
                <div key={p.id} className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4 flex gap-3">
                  {/* Thumbnail */}
                  <div className="w-14 h-14 flex-shrink-0 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] overflow-hidden">
                    {p.images?.[0]
                      ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-[9px] text-[var(--color-text-muted)]">N/A</div>
                    }
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex justify-between items-start gap-2">
                      <div className="font-semibold text-sm truncate leading-snug">{p.title}</div>
                      <span className={`flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        p.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)]">
                      {p.shopName} · {p.category}
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <div className="text-xs text-[var(--color-text-secondary)]">
                        {p.mrp ? `Rs. ${Number(p.mrp).toFixed(2)}` : 'Negotiate'} · qty {p.quantityAvailable}
                      </div>
                      <AdminProductActions productId={p.id} isActive={p.isActive} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Desktop table (md+) ── */}
            <div className="hidden md:block overflow-x-auto bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border)] text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                  <tr>
                    <th className="p-4 font-medium">Image</th>
                    <th className="p-4 font-medium">Title</th>
                    <th className="p-4 font-medium">Shop</th>
                    <th className="p-4 font-medium">Category</th>
                    <th className="p-4 font-medium">MRP</th>
                    <th className="p-4 font-medium">Qty</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {allProducts.map(p => (
                    <tr key={p.id} className="hover:bg-[var(--color-bg-secondary)] transition-colors">
                      <td className="p-4">
                        <div className="w-10 h-10 rounded bg-[var(--color-bg-primary)] border border-[var(--color-border)] overflow-hidden">
                          {p.images?.[0]
                            ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-[9px] text-[var(--color-text-muted)]">N/A</div>
                          }
                        </div>
                      </td>
                      <td className="p-4 font-medium max-w-[200px] truncate">{p.title}</td>
                      <td className="p-4 text-[var(--color-text-secondary)]">{p.shopName}</td>
                      <td className="p-4 text-[var(--color-text-secondary)]">{p.category}</td>
                      <td className="p-4 font-mono">{p.mrp ? `Rs. ${Number(p.mrp).toFixed(2)}` : '—'}</td>
                      <td className="p-4">{p.quantityAvailable}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wider ${
                          p.isActive ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]' : 'bg-[var(--color-danger)]/20 text-[var(--color-danger)]'
                        }`}>
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <AdminProductActions productId={p.id} isActive={p.isActive} />
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
