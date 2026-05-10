'use client';

import { PageTransition } from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role: 'customer' }),
      });
      const data = await res.json();
      
      if (res.ok) {
        router.push(data.redirect);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  return (
    <PageTransition>
      <div className="relative min-h-screen flex items-center justify-center">
        {/* Animated Background Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-accent-muted)] rounded-full mix-blend-screen filter blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#2A2A26] rounded-full mix-blend-screen filter blur-[120px] opacity-50"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 max-w-7xl w-full mx-auto px-8 gap-16 items-center">
          
          {/* Hero Typography */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-6xl md:text-8xl font-serif leading-tight mb-6">
              Discover.<br/>
              <span className="text-[var(--color-text-secondary)] italic">Negotiate.</span><br/>
              Own.
            </h1>
            <p className="text-xl text-[var(--color-text-secondary)] max-w-md font-light">
              An exclusive curation of extraordinary goods. Engage directly with sellers. Set your price.
            </p>
          </motion.div>

          {/* Login Form Centrepiece */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-[var(--color-surface)]/80 backdrop-blur-xl p-10 rounded-2xl border border-[var(--color-border)] shadow-2xl lg:ml-auto max-w-md w-full"
          >
            <h2 className="text-3xl font-serif mb-2">Enter Buy&Sell.</h2>
            <p className="text-[var(--color-text-muted)] mb-8">Login as a customer to continue.</p>
            
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              {error && <div className="text-[var(--color-danger)] text-sm">{error}</div>}
              <div>
                <label className="text-sm text-[var(--color-text-secondary)] block mb-1">Username</label>
                <Input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                  className="bg-transparent"
                />
              </div>
              <div>
                <label className="text-sm text-[var(--color-text-secondary)] block mb-1">Password</label>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="bg-transparent"
                />
              </div>
              <Button type="submit" className="w-full mt-2 py-3 text-lg font-serif italic tracking-wide">
                Login
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-[var(--color-border)] text-center text-sm text-[var(--color-text-muted)]">
              New to Buy&Sell?{' '}
              <a href="/register/customer" className="text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors border-b border-transparent hover:border-[var(--color-accent)] pb-0.5">
                Apply for access
              </a>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Scroll Section */}
      <div className="bg-[var(--color-bg-secondary)] py-32 px-8 border-t border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div>
            <h3 className="font-serif text-2xl mb-4 italic">I. Browse</h3>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">Discover a handpicked selection of rare items, curated daily.</p>
          </div>
          <div>
            <h3 className="font-serif text-2xl mb-4 italic">II. Negotiate</h3>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">Enter private sessions with sellers to agree on your terms.</p>
          </div>
          <div>
            <h3 className="font-serif text-2xl mb-4 italic">III. Own</h3>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">Seal the deal and add to your personal collection.</p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
