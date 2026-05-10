import Link from 'next/link';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Subtle Grain Overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%22")' }}></div>

      <header className="absolute top-0 w-full z-40 px-8 py-6 flex justify-between items-center bg-transparent">
        <Link href="/" className="text-2xl font-serif font-bold tracking-tight text-[var(--color-text-primary)]">
          BAZAAR.
        </Link>
        <nav className="flex gap-8 text-sm uppercase tracking-widest text-[var(--color-text-secondary)]">
          <Link href="/login?role=seller" className="hover:text-[var(--color-text-primary)] transition-colors">Seller Login</Link>
          <Link href="/login?role=admin" className="hover:text-[var(--color-text-primary)] transition-colors">Admin Login</Link>
          <Link href="/info" className="hover:text-[var(--color-accent)] transition-colors">About</Link>
        </nav>
      </header>
      
      <main className="flex-1 relative z-10">
        {children}
      </main>
    </div>
  );
}
