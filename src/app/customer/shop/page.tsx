import { PageTransition } from '@/components/layout/PageTransition';
import { db } from '@/db';
import { products, sellerProfiles } from '@/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

// Scaffolding the shop page
export default async function ShopPage() {
  // In a real app we'd handle searchParams for filtering, sorting etc.
  // We'd also aggregate reviews to get seller avg rating.
  // For now, let's fetch active products with quantity > 0
  
  // NOTE: Neon requires the DB URL to be valid to run this. If it's empty, this page will error.
  let items: any[] = [];
  try {
    items = await db
      .select({
        id: products.id,
        title: products.title,
        category: products.category,
        images: products.images,
        quantityAvailable: products.quantityAvailable,
        quantityFrozen: products.quantityFrozen,
        sellerName: sellerProfiles.shopName,
        sellerRating: sellerProfiles.avgRating,
        sellerReviews: sellerProfiles.totalReviews,
      })
      .from(products)
      .innerJoin(sellerProfiles, eq(products.sellerId, sellerProfiles.id))
      .where(and(eq(products.isActive, true), gt(products.quantityAvailable, 0)))
      .limit(50);
  } catch (e) {
    console.error('DB fetch failed (likely missing credentials)', e);
  }

  return (
    <PageTransition>
      <div className="max-w-[1600px] mx-auto px-8 py-12 flex gap-12">
        {/* Sidebar Filters */}
        <aside className="w-64 flex-shrink-0 hidden lg:block">
          <div className="sticky top-24 space-y-8">
            <div>
              <h3 className="font-serif text-xl mb-4 border-b border-[var(--color-border)] pb-2">Filter</h3>
              {/* Filter scaffold */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-[var(--color-text-secondary)] block mb-2">Category</label>
                  <select className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md p-2 text-sm focus:outline-none focus:border-[var(--color-accent)]">
                    <option>All Categories</option>
                    <option>Antiques</option>
                    <option>Art</option>
                    <option>Fashion</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-[var(--color-text-secondary)] block mb-2">Minimum Seller Rating</label>
                  <input type="range" min="1" max="5" defaultValue="1" className="w-full accent-[var(--color-accent)]" />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <header className="mb-8 flex justify-between items-end">
            <h1 className="text-4xl font-serif">Curated Goods</h1>
            <div className="text-sm text-[var(--color-text-secondary)]">Showing {items.length} items</div>
          </header>

          {items.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-[var(--color-border)] rounded-lg">
              <p className="text-[var(--color-text-muted)] italic">No items available currently.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((item) => {
                const available = item.quantityAvailable - (item.quantityFrozen || 0);
                return (
                  <Link href={`/customer/shop/${item.id}`} key={item.id} className="group flex flex-col gap-3">
                    {/* Image Aspect Ratio Container */}
                    <div className="relative aspect-[4/5] bg-[var(--color-surface)] rounded-xl overflow-hidden border border-[var(--color-border)]">
                      {item.images && item.images[0] ? (
                        <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)] italic">No image</div>
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-[var(--color-bg-primary)] to-transparent">
                        <Button className="w-full shadow-xl shadow-black/50">View Details &rarr;</Button>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h2 className="font-serif text-lg leading-tight line-clamp-2 group-hover:text-[var(--color-accent)] transition-colors">{item.title}</h2>
                      </div>
                      <div className="text-sm text-[var(--color-text-secondary)] mb-2 uppercase tracking-wide text-xs">{item.category}</div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[var(--color-surface)] flex items-center justify-center border border-[var(--color-border)] text-xs">
                            {item.sellerName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-[var(--color-text-muted)]">{item.sellerName}</span>
                        </div>
                        <span className="text-[var(--color-text-muted)]">★ {Number(item.sellerRating).toFixed(1)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
