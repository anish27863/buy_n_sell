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
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen px-4 md:px-8 py-24 flex items-center justify-center">
        <div className="bg-[var(--color-surface)]/80 backdrop-blur-xl p-10 rounded-2xl border border-[var(--color-border)] shadow-2xl max-w-md w-full">

          {submitted ? (
            <div className="text-center">
              <div className="text-4xl mb-4">⏳</div>
              <h2 className="text-2xl font-serif mb-3">Application Submitted</h2>
              <p className="text-[var(--color-text-secondary)] mb-6">
                Your account is pending admin approval. You will be able to log in once an admin reviews your application.
              </p>
              <a href="/" className="text-[var(--color-accent)] text-sm hover:underline">← Back to Login</a>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-serif mb-2">Join Buy&Sell.</h2>
              <p className="text-[var(--color-text-muted)] mb-8">Register as a customer.</p>
              <form onSubmit={handleRegister} className="flex flex-col gap-5">
                {error && <div className="text-[var(--color-danger)] text-sm">{error}</div>}
                <div>
                  <label className="text-sm text-[var(--color-text-secondary)] block mb-1">Username</label>
                  <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} className="bg-transparent" />
                </div>
                <div>
                  <label className="text-sm text-[var(--color-text-secondary)] block mb-1">Password</label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="bg-transparent" />
                </div>
                <Button type="submit" disabled={loading} className="w-full mt-2 py-3 text-lg font-serif italic tracking-wide">
                  {loading ? 'Submitting...' : 'Apply for Access'}
                </Button>
              </form>
              <div className="mt-6 pt-6 border-t border-[var(--color-border)] text-center text-sm text-[var(--color-text-muted)]">
                Already have an account?{' '}
                <a href="/" className="text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors border-b border-transparent hover:border-[var(--color-accent)] pb-0.5">Login</a>
              </div>
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
