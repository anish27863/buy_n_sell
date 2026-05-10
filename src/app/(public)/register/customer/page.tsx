'use client';

import { PageTransition } from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CustomerRegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch('/api/auth/register/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      
      if (res.ok) {
        router.push(data.redirect);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen px-8 flex items-center justify-center">
        <div className="bg-[var(--color-surface)]/80 backdrop-blur-xl p-10 rounded-2xl border border-[var(--color-border)] shadow-2xl max-w-md w-full">
          <h2 className="text-3xl font-serif mb-2">Join Bazaar.</h2>
          <p className="text-[var(--color-text-muted)] mb-8">Register as a customer.</p>
          
          <form onSubmit={handleRegister} className="flex flex-col gap-5">
            {error && <div className="text-[var(--color-danger)] text-sm">{error}</div>}
            <div>
              <label className="text-sm text-[var(--color-text-secondary)] block mb-1">Username</label>
              <Input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
                minLength={3}
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
                minLength={6}
                className="bg-transparent"
              />
            </div>
            <Button type="submit" className="w-full mt-2 py-3 text-lg font-serif italic tracking-wide">
              Create Account
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--color-border)] text-center text-sm text-[var(--color-text-muted)]">
            Already have an account?{' '}
            <a href="/" className="text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors border-b border-transparent hover:border-[var(--color-accent)] pb-0.5">
              Login
            </a>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
