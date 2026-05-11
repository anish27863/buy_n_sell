'use client';
import { useState } from 'react';
import Link from 'next/link';

type NavItem = { label: string; href: string };

export function MobileNav({ items, brandHref, brand, brandTag }: {
  items: NavItem[];
  brandHref: string;
  brand: string;
  brandTag?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button — only visible on mobile */}
      <button
        onClick={() => setOpen(o => !o)}
        className="md:hidden flex flex-col gap-1.5 p-1.5 rounded-lg hover:bg-[var(--color-surface)] transition-colors"
        aria-label="Toggle menu"
      >
        <span className={`block w-6 h-0.5 bg-[var(--color-text-primary)] transition-transform duration-200 ${open ? 'rotate-45 translate-y-2' : ''}`} />
        <span className={`block w-6 h-0.5 bg-[var(--color-text-primary)] transition-opacity duration-200 ${open ? 'opacity-0' : ''}`} />
        <span className={`block w-6 h-0.5 bg-[var(--color-text-primary)] transition-transform duration-200 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
      </button>

      {/* Slide-over drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          {/* Panel */}
          <div className="relative ml-auto w-72 h-full bg-[var(--color-bg-primary)] border-l border-[var(--color-border)] flex flex-col p-8 shadow-2xl">
            <div className="mb-10">
              <Link href={brandHref} onClick={() => setOpen(false)} className="text-2xl font-serif font-bold tracking-tight text-[var(--color-text-primary)]">
                {brand}
                {brandTag && <span className="text-sm font-sans tracking-widest uppercase text-[var(--color-text-muted)] italic ml-2">{brandTag}</span>}
              </Link>
            </div>
            <nav className="flex flex-col gap-6 flex-1">
              {items.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors border-b border-[var(--color-border)] pb-4"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <form action="/api/auth/logout" method="POST" className="mt-6">
              <button type="submit" className="w-full py-3 text-sm uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors border border-[var(--color-border)] rounded-lg">
                Sign Out
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
