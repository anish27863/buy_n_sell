'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export function BuyNowButton({ productId, available }: { productId: number; available: number }) {
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleBuy = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push(`/customer/chat/${data.orderId}`), 1500);
      } else {
        setError(data.error || 'Failed to place order');
      }
    } catch (e) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-[var(--color-success)] font-serif italic text-lg animate-pulse">
        Order placed! Redirecting...
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0">
      <div className="flex items-center justify-between sm:justify-start border border-[var(--color-border)] rounded-lg overflow-hidden">
        <button
          onClick={() => setQuantity(q => Math.max(1, q - 1))}
          className="px-4 py-3 sm:px-3 sm:py-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] transition-colors"
        >
          −
        </button>
        <span className="px-4 py-2 text-center min-w-[3rem] font-medium">{quantity}</span>
        <button
          onClick={() => setQuantity(q => Math.min(available, q + 1))}
          className="px-4 py-3 sm:px-3 sm:py-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] transition-colors"
        >
          +
        </button>
      </div>
      <div className="flex flex-col gap-1 w-full sm:w-auto">
        <Button
          onClick={handleBuy}
          disabled={loading || available <= 0}
          className="w-full sm:w-auto px-6 md:px-8 py-4 text-base md:text-lg font-serif italic shadow-[0_0_20px_var(--color-accent-muted)]"
        >
          {loading ? 'Placing...' : 'Buy Now →'}
        </Button>
        {error && <span className="text-[var(--color-danger)] text-xs">{error}</span>}
      </div>
    </div>
  );
}
