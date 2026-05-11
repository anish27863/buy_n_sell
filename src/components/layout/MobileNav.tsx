'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

type NavItem = { label: string; href: string };

// All colors hardcoded — no CSS variables so nothing can be transparent by accident
const OVERLAY = 'rgba(0,0,0,0.88)';   // near-black backdrop
const PANEL_BG = '#2C2C28';            // clearly lighter than page (#111110)
const PANEL_BORDER = '#48483E';        // visible border
const TEXT_PRIMARY = '#F5F0E8';
const TEXT_MUTED = '#8A857C';
const ACCENT = '#E8622A';
const DIVIDER = '#3A3A36';

export function MobileNav({
  items,
  brandHref,
  brand,
  brandTag,
}: {
  items: NavItem[];
  brandHref: string;
  brand: string;
  brandTag?: string;
}) {
  const [open, setOpen] = useState(false);

  // Lock body scroll while panel is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* ── Hamburger button (mobile only) ── */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '8px', cursor: 'pointer', background: 'none', border: 'none' }}
        className="md:hidden"
      >
        <span style={{ display: 'block', width: '22px', height: '2px', backgroundColor: TEXT_PRIMARY, borderRadius: '2px' }} />
        <span style={{ display: 'block', width: '22px', height: '2px', backgroundColor: TEXT_PRIMARY, borderRadius: '2px' }} />
        <span style={{ display: 'block', width: '22px', height: '2px', backgroundColor: TEXT_PRIMARY, borderRadius: '2px' }} />
      </button>

      {/* ── Full-screen overlay (only rendered when open) ── */}
      {open && (
        <div
          className="md:hidden"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: 'flex',
          }}
        >
          {/* Dark backdrop — clicking closes the panel */}
          <div
            onClick={() => setOpen(false)}
            style={{
              flex: 1,
              backgroundColor: OVERLAY,
            }}
          />

          {/* Sidebar panel */}
          <div
            style={{
              width: '272px',
              height: '100%',
              backgroundColor: PANEL_BG,
              borderLeft: `1px solid ${PANEL_BORDER}`,
              boxShadow: '-24px 0 60px rgba(0,0,0,0.7)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${DIVIDER}` }}>
              <Link
                href={brandHref}
                onClick={() => setOpen(false)}
                style={{ textDecoration: 'none' }}
              >
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 700, color: TEXT_PRIMARY, letterSpacing: '-0.01em' }}>
                  {brand}
                </span>
                {brandTag && (
                  <span style={{ fontSize: '11px', color: TEXT_MUTED, fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '0.12em', marginLeft: '8px' }}>
                    {brandTag}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: TEXT_MUTED, fontSize: '20px', lineHeight: 1, padding: '4px' }}
              >
                ✕
              </button>
            </div>

            {/* Nav links */}
            <nav style={{ flex: 1, padding: '16px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {items.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', color: TEXT_PRIMARY, fontSize: '15px', fontWeight: 500 }}
                  className="hover:bg-white/5"
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: ACCENT, flexShrink: 0, opacity: 0.8 }} />
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Sign-out footer */}
            <div style={{ padding: '16px 24px 32px', borderTop: `1px solid ${DIVIDER}` }}>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: `1px solid ${DIVIDER}`,
                    backgroundColor: 'transparent',
                    color: TEXT_MUTED,
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    cursor: 'pointer',
                  }}
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
