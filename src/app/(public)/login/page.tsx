'use client';

import { PageTransition } from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get('role') as 'seller' | 'admin') || 'seller';
  const [role, setRole] = useState<'seller' | 'admin'>(initialRole);
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
        body: JSON.stringify({ username, password, role }),
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
    <div className="bg-[var(--color-surface)]/80 backdrop-blur-xl p-10 rounded-2xl border border-[var(--color-border)] shadow-2xl max-w-md w-full mx-auto mt-32">
      <div className="flex justify-center gap-4 mb-8 border-b border-[var(--color-border)] pb-4">
        <button 
          className={`font-serif italic text-lg transition-colors ${role === 'seller' ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}
          onClick={() => setRole('seller')}
        >
          Seller Portal
        </button>
        <span className="text-[var(--color-text-muted)]">/</span>
        <button 
          className={`font-serif italic text-lg transition-colors ${role === 'admin' ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}
          onClick={() => setRole('admin')}
        >
          Admin Portal
        </button>
      </div>
      
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
          Access {role === 'seller' ? 'Shop' : 'System'}
        </Button>
      </form>

      {role === 'seller' && (
        <div className="mt-6 pt-6 border-t border-[var(--color-border)] text-center text-sm text-[var(--color-text-muted)]">
          Want to sell on Buy&Sell?{' '}
          <a href="/register/seller" className="text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors border-b border-transparent hover:border-[var(--color-accent)] pb-0.5">
            Apply as Merchant
          </a>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <PageTransition>
      <div className="min-h-screen px-4 md:px-8 py-24 flex items-center justify-center">
        <Suspense fallback={<div className="mt-32 text-center text-[var(--color-text-muted)]">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </PageTransition>
  );
}
