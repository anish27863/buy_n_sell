'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

type NavItem = { label: string; href: string };

export function MobileNav({ items, brandHref, brand, brandTag }: {
  items: NavItem[];
  brandHref: string;
  brand: string;
  brandTag?: string;
}) {
  const [open, setOpen] = useState(false);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Hamburger — mobile only */}
      <button
        onClick={() => setOpen(o => !o)}
        className="md:hidden flex flex-col justify-center gap-[5px] w-9 h-9 p-2 rounded-lg hover:bg-white/5 transition-colors"
        aria-label="Toggle menu"
      >
        <span className={`block w-full h-0.5 bg-[var(--color-text-primary)] transition-all duration-300 origin-center ${open ? 'rotate-45 translate-y-[7px]' : ''}`} />
        <span className={`block w-full h-0.5 bg-[var(--color-text-primary)] transition-all duration-300 ${open ? 'opacity-0 scale-x-0' : ''}`} />
        <span className={`block w-full h-0.5 bg-[var(--color-text-primary)] transition-all duration-300 origin-center ${open ? '-rotate-45 -translate-y-[7px]' : ''}`} />
      </button>

      {/* Overlay + Drawer — rendered in place, controlled by translate */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Dim backdrop */}
        <div
          className="absolute inset-0 bg-black/70"
          onClick={() => setOpen(false)}
        />

        {/* Sidebar panel — slides in from right */}
        <div
          className={`absolute top-0 right-0 h-full w-72 flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ backgroundColor: '#1A1A18', borderLeft: '1px solid #3A3A36' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: '#3A3A36' }}>
            <Link
              href={brandHref}
              onClick={() => setOpen(false)}
              className="text-xl font-serif font-bold tracking-tight"
              style={{ color: '#F5F0E8' }}
            >
              {brand}
              {brandTag && (
                <span className="text-xs font-sans tracking-widest uppercase ml-2 italic" style={{ color: '#6B6660' }}>
                  {brandTag}
                </span>
              )}
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors text-lg"
              style={{ color: '#6B6660' }}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 flex flex-col px-4 py-6 gap-1 overflow-y-auto">
            {items.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-white/5"
                style={{ color: '#A8A39A' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] opacity-60" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Footer — Sign out */}
          <div className="px-4 pb-8 pt-4 border-t" style={{ borderColor: '#3A3A36' }}>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl text-xs uppercase tracking-widest font-medium transition-colors hover:bg-red-500/10"
                style={{ color: '#6B6660', border: '1px solid #3A3A36' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#E85454')}
                onMouseLeave={e => (e.currentTarget.style.color = '#6B6660')}
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
