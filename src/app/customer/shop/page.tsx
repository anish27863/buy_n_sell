import { PageTransition } from '@/components/layout/PageTransition';
import { db } from '@/db';
import { products, sellerProfiles } from '@/db/schema';
import { eq, and, gt, gte, lte, ilike } from 'drizzle-orm';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

const CATEGORIES = ['All', 'chips', 'drinks', 'biscuits', 'namkeen', 'medicine', 'others'];

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; minPrice?: string; maxPrice?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const selectedCategory = sp.category || 'All';
  const minPrice = sp.minPrice ? parseFloat(sp.minPrice) : null;
  const maxPrice = sp.maxPrice ? parseFloat(sp.maxPrice) : null;
  const query = sp.q?.trim() || '';

  let items: any[] = [];
  try {
    const conditions: any[] = [eq(products.isActive, true), gt(products.quantityAvailable, 0)];
    if (selectedCategory !== 'All') conditions.push(eq(products.category, selectedCategory));
    if (minPrice !== null) conditions.push(gte(products.mrp, minPrice.toString()));
    if (maxPrice !== null) conditions.push(lte(products.mrp, maxPrice.toString()));

    const raw = await db
      .select({
        id: products.id,
        title: products.title,
        category: products.category,
        mrp: products.mrp,
        images: products.images,
        quantityAvailable: products.quantityAvailable,
        quantityFrozen: products.quantityFrozen,
        sellerName: sellerProfiles.shopName,
        sellerRating: sellerProfiles.avgRating,
      })
      .from(products)
      .innerJoin(sellerProfiles, eq(products.sellerId, sellerProfiles.id))
      .where(and(...conditions))
      .limit(100);

    items = query
      ? raw.filter(i => i.title.toLowerCase().includes(query.toLowerCase()) || i.category.toLowerCase().includes(query.toLowerCase()))
      : raw;
  } catch (e) {
    console.error('DB fetch failed', e);
  }

  return (
    <PageTransition>
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-12 flex flex-col lg:flex-row gap-10">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-60 flex-shrink-0">
          <div className="lg:sticky lg:top-24">
            <form method="GET" action="/customer/shop" className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 space-y-6">
              <h3 className="font-serif text-lg border-b border-[var(--color-border)] pb-3">Filter</h3>

              {/* Search */}
              <div>
                <label className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest block mb-2">Search</label>
                <input
                  name="q"
                  defaultValue={query}
                  placeholder="Keywords..."
                  className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)] text-[var(--color-text-primary)]"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest block mb-2">Category</label>
                <div className="space-y-1.5">
                  {CATEGORIES.map(cat => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="category"
                        value={cat}
                        defaultChecked={selectedCategory === cat}
                        className="accent-[var(--color-accent)]"
                      />
                      <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors capitalize">
                        {cat}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest block mb-2">Price Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="minPrice"
                    defaultValue={sp.minPrice}
                    placeholder="Min"
                    min={0}
                    className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)] text-[var(--color-text-primary)]"
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    defaultValue={sp.maxPrice}
                    placeholder="Max"
                    min={0}
                    className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)] text-[var(--color-text-primary)]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Apply Filters
              </button>
              <a
                href="/customer/shop"
                className="block text-center text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors mt-1"
              >
                Clear all
              </a>
            </form>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          <header className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
            <h1 className="text-3xl md:text-4xl font-serif">Curated Goods</h1>
            <div className="text-sm text-[var(--color-text-secondary)]">
              {items.length} {items.length === 1 ? 'item' : 'items'} found
            </div>
          </header>

          {items.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-[var(--color-border)] rounded-xl">
              <p className="text-[var(--color-text-muted)] italic mb-4">No items match your filters.</p>
              <a href="/customer/shop" className="text-[var(--color-accent)] text-sm hover:underline">Clear filters</a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {items.map((item) => {
                const available = item.quantityAvailable - (item.quantityFrozen || 0);
                return (
                  <Link href={`/customer/shop/${item.id}`} key={item.id} className="group flex flex-col gap-3">
                    <div className="relative aspect-[4/5] bg-[var(--color-surface)] rounded-xl overflow-hidden border border-[var(--color-border)]">
                      {item.images?.[0] ? (
                        <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)] italic text-sm">No image</div>
                      )}
                      {available <= 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white text-xs uppercase tracking-widest font-semibold">Out of Stock</span>
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-[var(--color-bg-primary)] to-transparent">
                        <Button className="w-full shadow-xl shadow-black/50">View Details →</Button>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-[var(--color-accent)] uppercase tracking-widest mb-1">{item.category}</div>
                      <h2 className="font-serif text-lg leading-tight line-clamp-2 group-hover:text-[var(--color-accent)] transition-colors mb-2">{item.title}</h2>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[var(--color-surface)] flex items-center justify-center border border-[var(--color-border)] text-xs font-bold">
                            {item.sellerName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-[var(--color-text-muted)] text-xs">{item.sellerName}</span>
                        </div>
                        <div className="text-right">
                          {item.mrp ? (
                            <span className="font-mono text-[var(--color-text-primary)] font-semibold">${Number(item.mrp).toFixed(2)}</span>
                          ) : (
                            <span className="text-[var(--color-text-muted)] italic text-xs">Negotiate</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-[var(--color-text-muted)]">★ {Number(item.sellerRating || 0).toFixed(1)}</span>
                        <span className="text-xs text-[var(--color-text-muted)]">{available > 0 ? `${available} left` : 'Sold out'}</span>
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
