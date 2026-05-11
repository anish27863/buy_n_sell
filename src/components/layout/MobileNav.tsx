'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';

type NavItem = { label: string; href: string };

const OVERLAY   = 'rgba(0,0,0,0.90)';
const PANEL_BG  = '#2C2C28';
const BORDER    = '#48483E';
const DIVIDER   = '#3A3A36';
const TEXT      = '#F5F0E8';
const MUTED     = '#8A857C';
const ACCENT    = '#E8622A';

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
  const [mounted, setMounted] = useState(false);

  // Wait for client mount before using portal (SSR safety)
  useEffect(() => { setMounted(true); }, []);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const overlay = open ? (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,      // above everything
        display: 'flex',
      }}
    >
      {/* Click-away backdrop */}
      <div
        onClick={() => setOpen(false)}
        style={{ flex: 1, backgroundColor: OVERLAY }}
      />

      {/* Sidebar panel */}
      <div
        style={{
          width: '272px',
          height: '100%',
          backgroundColor: PANEL_BG,
          borderLeft: `1px solid ${BORDER}`,
          boxShadow: '-24px 0 80px rgba(0,0,0,0.8)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${DIVIDER}` }}>
          <Link href={brandHref} onClick={() => setOpen(false)} style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 700, color: TEXT, letterSpacing: '-0.01em' }}>
              {brand}
            </span>
            {brandTag && (
              <span style={{ fontSize: '11px', color: MUTED, fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '0.12em', marginLeft: '8px' }}>
                {brandTag}
              </span>
            )}
          </Link>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontSize: '20px', lineHeight: 1, padding: '4px' }}
          >
            ✕
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {items.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '13px 16px',
                borderRadius: '10px',
                color: TEXT,
                fontSize: '15px',
                fontWeight: 500,
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: ACCENT, flexShrink: 0, opacity: 0.8 }} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Sign-out footer */}
        <div style={{ padding: '16px 24px 40px', borderTop: `1px solid ${DIVIDER}` }}>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: `1px solid ${DIVIDER}`,
                backgroundColor: 'transparent',
                color: MUTED,
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
  ) : null;

  return (
    <>
      {/* Hamburger — mobile only */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="md:hidden"
        style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '8px', cursor: 'pointer', background: 'none', border: 'none' }}
      >
        <span style={{ display: 'block', width: '22px', height: '2px', backgroundColor: TEXT, borderRadius: '2px' }} />
        <span style={{ display: 'block', width: '22px', height: '2px', backgroundColor: TEXT, borderRadius: '2px' }} />
        <span style={{ display: 'block', width: '22px', height: '2px', backgroundColor: TEXT, borderRadius: '2px' }} />
      </button>

      {/* Portal: renders directly into document.body, bypassing all stacking contexts */}
      {mounted && createPortal(overlay, document.body)}
    </>
  );
}
