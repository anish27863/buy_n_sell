import { PageTransition } from '@/components/layout/PageTransition';

export default function CartPage() {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-8 py-12">
        <h1 className="text-4xl font-serif mb-8 border-b border-[var(--color-border)] pb-6">Your Cart</h1>
        <div className="py-24 text-center border border-dashed border-[var(--color-border)] rounded-lg">
          <p className="text-[var(--color-text-muted)] italic">Your cart is empty.</p>
        </div>
      </div>
    </PageTransition>
  );
}
