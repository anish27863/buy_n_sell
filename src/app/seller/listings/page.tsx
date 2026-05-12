import { PageTransition } from '@/components/layout/PageTransition';
import { db } from '@/db';
import { products, sellerProfiles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

const CATEGORIES = ['All', 'chips', 'drinks', 'biscuits', 'namkeen', 'medicine', 'others'];

export default async function SellerListings({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const session = await getSession();
  const userId = session?.id || 0;

  const selectedCategory = sp.category || 'All';
  const selectedStatus = sp.status || 'All';
  const query = sp.q?.trim() || '';

  let items: any[] = [];
  try {
    const [seller] = await db.select().from(sellerProfiles).where(eq(sellerProfiles.userId, userId));
    if (seller) {
      const conditions: any[] = [eq(products.sellerId, seller.id)];
      if (selectedCategory !== 'All') conditions.push(eq(products.category, selectedCategory));
      if (selectedStatus === 'Active') conditions.push(eq(products.isActive, true));
      if (selectedStatus === 'Inactive') conditions.push(eq(products.isActive, false));

      const raw = await db.select().from(products).where(and(...conditions));
      
      items = query
        ? raw.filter(i => i.title.toLowerCase().includes(query.toLowerCase()) || i.category.toLowerCase().includes(query.toLowerCase()))
        : raw;
    }
  } catch (e) {
    console.error('DB fetch failed', e);
  }

  return (
    <PageTransition>
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-12 flex flex-col lg:flex-row gap-10">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-60 flex-shrink-0">
          <div className="lg:sticky lg:top-24">
            <form method="GET" action="/seller/listings" className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 space-y-6">
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

              {/* Status */}
              <div>
                <label className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest block mb-2">Status</label>
                <select
                  name="status"
                  defaultValue={selectedStatus}
                  className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg p-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active Only</option>
                  <option value="Inactive">Inactive Only</option>
                </select>
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

              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Apply Filters
              </button>
              <a
                href="/seller/listings"
                className="block text-center text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors mt-1"
              >
                Clear all
              </a>
            </form>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          <header className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 border-b border-[var(--color-border)] pb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif mb-1">Your Listings</h1>
              <div className="text-sm text-[var(--color-text-secondary)]">
                {items.length} {items.length === 1 ? 'item' : 'items'} total
              </div>
            </div>
            <Link href="/seller/listings/new">
              <Button className="font-serif italic tracking-wide w-full sm:w-auto">+ New Listing</Button>
            </Link>
          </header>

          {items.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-[var(--color-border)] rounded-xl">
              <p className="text-[var(--color-text-muted)] italic mb-4">No listings found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {items.map((item) => (
                <div key={item.id} className="group flex flex-col gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 hover:border-[var(--color-text-muted)] transition-colors">
                  <div className="relative aspect-square bg-[var(--color-bg-primary)] rounded-lg overflow-hidden border border-[var(--color-border)]">
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)] italic text-sm">No image</div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                        item.isActive ? 'bg-[var(--color-success)] text-white' : 'bg-[var(--color-danger)] text-white'
                      }`}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-[var(--color-accent)] uppercase tracking-widest mb-1">{item.category}</div>
                    <h2 className="font-serif text-lg leading-tight line-clamp-2 mb-2">{item.title}</h2>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm bg-[var(--color-bg-tertiary)] p-3 rounded-lg border border-[var(--color-border)] mb-4">
                      <div>
                        <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest">Price</div>
                        <div className="font-mono text-[var(--color-text-primary)] font-semibold">
                          {item.mrp ? `Rs. ${Number(item.mrp).toFixed(2)}` : 'Negotiate'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest">Stock</div>
                        <div className="text-[var(--color-text-primary)]">
                          {item.quantityAvailable} <span className="text-[var(--color-warning)] text-xs">({item.quantityFrozen || 0} frozen)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="ghost" className="flex-1 text-xs border border-[var(--color-border)] h-8">Edit</Button>
                      <Button variant="ghost" className="flex-1 text-xs border border-[var(--color-danger)] text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 h-8">Delete</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
