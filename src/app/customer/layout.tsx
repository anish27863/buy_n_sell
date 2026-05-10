import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)]">
      <header className="sticky top-0 z-40 w-full border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/80 backdrop-blur-md px-8 py-4 flex justify-between items-center">
        <Link href="/customer/dashboard" className="text-2xl font-serif font-bold tracking-tight text-[var(--color-text-primary)]">
          BAZAAR.
        </Link>
        <nav className="flex items-center gap-8 text-sm font-medium text-[var(--color-text-secondary)]">
          <Link href="/customer/shop" className="hover:text-[var(--color-text-primary)] transition-colors">Shop</Link>
          <Link href="/customer/want" className="hover:text-[var(--color-text-primary)] transition-colors">Forum</Link>
          <Link href="/customer/cart" className="hover:text-[var(--color-text-primary)] transition-colors">Cart</Link>
          
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
