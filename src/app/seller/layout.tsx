import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { MobileNav } from '@/components/layout/MobileNav';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { label: 'Dashboard', href: '/seller/dashboard' },
    { label: 'Listings', href: '/seller/listings' },
    { label: 'Want Feed', href: '/seller/want-feed' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)]">
      <header className="sticky top-0 z-40 w-full border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/80 backdrop-blur-md px-4 md:px-8 py-4 flex justify-between items-center">
        <Link href="/seller/dashboard" className="text-xl md:text-2xl font-serif font-bold tracking-tight text-[var(--color-accent)]">
          BUY&SELL. <span className="text-sm font-sans tracking-widest uppercase text-[var(--color-text-muted)] italic">Merchant</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-text-secondary)]">
          {navItems.map(i => (
            <Link key={i.href} href={i.href} className="hover:text-[var(--color-text-primary)] transition-colors">{i.label}</Link>
          ))}
          <form action="/api/auth/logout" method="POST">
            <Button type="submit" variant="ghost" className="text-xs uppercase tracking-wider h-8">Sign Out</Button>
          </form>
        </nav>
        <MobileNav items={navItems} brandHref="/seller/dashboard" brand="BUY&SELL." brandTag="Merchant" />
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
