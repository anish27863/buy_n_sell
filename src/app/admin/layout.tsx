import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)]">
      <header className="sticky top-0 z-40 w-full border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/80 backdrop-blur-md px-8 py-4 flex justify-between items-center">
        <Link href="/admin/dashboard" className="text-2xl font-serif font-bold tracking-tight text-white">
          BAZAAR. <span className="text-sm font-sans tracking-widest uppercase text-[var(--color-text-muted)] italic">Admin</span>
        </Link>
        <nav className="flex items-center gap-8 text-sm font-medium text-[var(--color-text-secondary)]">
          <Link href="/admin/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          <Link href="/admin/sellers" className="hover:text-white transition-colors">Sellers</Link>
          <Link href="/admin/products" className="hover:text-white transition-colors">Products</Link>
          <Link href="/admin/users" className="hover:text-white transition-colors">Users</Link>
          
          <form action="/api/auth/logout" method="POST">
            <Button type="submit" variant="ghost" className="text-xs uppercase tracking-wider h-8">
              System Exit
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
