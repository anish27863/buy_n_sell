'use client';

import { PageTransition } from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SellerRegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch('/api/auth/register/seller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, shopName, description }),
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
      <div className="min-h-screen px-8 py-24 flex items-center justify-center">
        <div className="bg-[var(--color-surface)]/80 backdrop-blur-xl p-10 rounded-2xl border border-[var(--color-border)] shadow-2xl max-w-lg w-full">
          <h2 className="text-3xl font-serif mb-2 text-[var(--color-accent)] italic">Become a Merchant.</h2>
          <p className="text-[var(--color-text-muted)] mb-8">Apply to sell your curated goods on Buy&Sell.</p>
          
          <form onSubmit={handleRegister} className="flex flex-col gap-5">
            {error && <div className="text-[var(--color-danger)] text-sm">{error}</div>}
            
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div>
              <label className="text-sm text-[var(--color-text-secondary)] block mb-1">Shop Name</label>
              <Input 
                type="text" 
                value={shopName} 
                onChange={(e) => setShopName(e.target.value)} 
                required 
                minLength={3}
                className="bg-transparent"
              />
            </div>

            <div>
              <label className="text-sm text-[var(--color-text-secondary)] block mb-1">Shop Description (Optional)</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex min-h-[100px] w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] transition-colors resize-none"
                placeholder="What kind of goods do you offer?"
              />
            </div>

            <Button type="submit" className="w-full mt-2 py-3 text-lg font-serif italic tracking-wide">
              Submit Application
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--color-border)] text-center text-sm text-[var(--color-text-muted)]">
            Already a merchant?{' '}
            <a href="/login?role=seller" className="text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors border-b border-transparent hover:border-[var(--color-accent)] pb-0.5">
              Access Shop
            </a>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
