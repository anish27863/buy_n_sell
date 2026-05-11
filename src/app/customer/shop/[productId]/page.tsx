import { PageTransition } from '@/components/layout/PageTransition';
import { db } from '@/db';
import { products, sellerProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/Button';

import { BuyNowButton } from './BuyNowButton';

export default async function ProductDetailPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const id = parseInt(productId);
  if (isNaN(id)) return notFound();

  let product = null;
  let seller = null;

  try {
    const [p] = await db.select().from(products).where(eq(products.id, id));
    product = p;
    if (p) {
      const [s] = await db.select().from(sellerProfiles).where(eq(sellerProfiles.id, p.sellerId));
      seller = s;
    }
  } catch (e) {
    console.error(e);
  }

  if (!product) {
    return (
      <div className="py-32 text-center text-[var(--color-text-muted)]">Product not found.</div>
    );
  }

  const available = product.quantityAvailable - (product.quantityFrozen || 0);

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
            {product.images && product.images[0] ? (
              <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)] italic">No image provided</div>
            )}
          </div>
          {/* Gallery thumbnails would go here */}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="mb-8">
            <div className="text-sm text-[var(--color-accent)] uppercase tracking-widest mb-3 font-semibold">{product.category}</div>
            <h1 className="text-4xl md:text-5xl font-serif leading-tight mb-6">{product.title}</h1>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">{product.description || 'No description provided.'}</p>
          </div>

          <div className="py-6 border-y border-[var(--color-border)] mb-8 flex justify-between items-center">
            <div>
              <div className="text-sm text-[var(--color-text-muted)] mb-1">Availability</div>
              <div className="font-medium text-lg text-[var(--color-text-primary)]">
                {available > 0 ? `${available} units available` : <span className="text-[var(--color-danger)]">Out of Stock</span>}
              </div>
            </div>
            
            <BuyNowButton productId={product.id} available={available} />
          </div>

          {/* Seller Info */}
          {seller && (
            <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] flex items-center justify-center text-xl font-serif">
                  {seller.shopName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">{seller.shopName}</div>
                  <div className="text-sm text-[var(--color-text-muted)]">★ {Number(seller.avgRating).toFixed(1)} ({seller.totalReviews} reviews)</div>
                </div>
              </div>
              <Button variant="ghost" className="w-full text-sm">View Seller Profile</Button>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
