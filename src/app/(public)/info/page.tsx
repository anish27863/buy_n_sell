import { PageTransition } from '@/components/layout/PageTransition';

export default function InfoPage() {
  return (
    <PageTransition>
      <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-serif mb-12 border-b border-[var(--color-border)] pb-8">
          The Philosophy of <span className="text-[var(--color-accent)] italic">Buy&Sell.</span>
        </h1>
        
        <div className="space-y-16 text-lg text-[var(--color-text-secondary)] leading-relaxed font-light">
          <section>
            <h2 className="text-3xl font-serif text-[var(--color-text-primary)] mb-6">What is Buy&Sell?</h2>
            <p>
              Buy&Sell is an experiment in digital commerce. We reject the sterile, impersonal nature of modern online shopping. 
              Here, every transaction is a conversation. Prices are not fixed; they are discovered through mutual agreement.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-serif text-[var(--color-text-primary)] mb-6">The Daily Reset</h2>
            <p>
              Scarcity breeds value. Every day at 03:30 UTC, the shelves are wiped clean. 
              Sellers must consciously choose what to offer each day. 
              As a buyer, what you see today may not be here tomorrow.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-[var(--color-border)]">
            <div>
              <h3 className="text-2xl font-serif text-[var(--color-text-primary)] mb-4">For Buyers</h3>
              <ul className="space-y-4">
                <li>• Browse curated listings</li>
                <li>• Post your specific desires in the Forum</li>
                <li>• Enter private negotiations with sellers</li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-serif text-[var(--color-text-primary)] mb-4">For Sellers</h3>
              <ul className="space-y-4">
                <li>• Maintain a premium shop profile</li>
                <li>• Accept or counter offers in real-time</li>
                <li>• Build reputation through verified reviews</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </PageTransition>
  );
}
