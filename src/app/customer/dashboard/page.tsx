'use client';

import { PageTransition } from '@/components/layout/PageTransition';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CustomerDashboard() {
  return (
    <PageTransition>
      <div className="flex h-[calc(100vh-73px)] w-full">
        {/* Shop Split */}
        <Link href="/customer/shop" className="group relative w-1/2 h-full overflow-hidden flex items-center justify-center border-r border-[var(--color-border)]">
          <div className="absolute inset-0 bg-[var(--color-surface)] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          {/* Subtle noise */}
          <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%22")' }}></div>
          
          <motion.div 
            className="relative z-10 text-center"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-5xl font-serif mb-4 group-hover:text-[var(--color-accent)] transition-colors duration-500">Shop Products</h2>
            <p className="text-[var(--color-text-secondary)] font-light tracking-wide uppercase text-sm">Discover curated listings</p>
          </motion.div>
        </Link>

        {/* Want/Forum Split */}
        <Link href="/customer/want" className="group relative w-1/2 h-full overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-[var(--color-surface)] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%22")' }}></div>
          
          <motion.div 
            className="relative z-10 text-center"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-5xl font-serif mb-4 group-hover:text-[var(--color-accent)] transition-colors duration-500">Post a Want</h2>
            <p className="text-[var(--color-text-secondary)] font-light tracking-wide uppercase text-sm">Request specific items</p>
          </motion.div>
        </Link>
      </div>
    </PageTransition>
  );
}
