import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)]">
      <header className="sticky top-0 z-40 w-full border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/80 backdrop-blur-md px-8 py-4 flex justify-between items-center">
        <Link href="/seller/dashboard" className="text-2xl font-serif font-bold tracking-tight text-[var(--color-accent)]">
          BAZAAR. <span className="text-sm font-sans tracking-widest uppercase text-[var(--color-text-muted)] italic">Merchant</span>
        </Link>
        <nav className="flex items-center gap-8 text-sm font-medium text-[var(--color-text-secondary)]">
          <Link href="/seller/dashboard" className="hover:text-[var(--color-text-primary)] transition-colors">Dashboard</Link>
          <Link href="/seller/listings" className="hover:text-[var(--color-text-primary)] transition-colors">Listings</Link>
          <Link href="/seller/want-feed" className="hover:text-[var(--color-text-primary)] transition-colors">Want Feed</Link>
          
          <form action="/api/auth/logout" method="POST">
            <Button type="submit" variant="ghost" className="text-xs uppercase tracking-wider h-8">
              Sign Out
            </Button>
          </form>
        </nav>
      </header>
      
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
