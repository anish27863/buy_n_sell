'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export function MarkDeliveredButton({ orderId, currentStatus }: { orderId: number; currentStatus: string }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(currentStatus === 'delivered');
  const router = useRouter();

  if (done) {
    return (
      <span className="text-[var(--color-success)] text-xs uppercase tracking-widest font-semibold px-3 py-1.5 rounded-lg border border-[var(--color-success)]/30 bg-[var(--color-success)]/10">
        ✅ Delivered
      </span>
    );
  }

  const handleDeliver = async () => {
    if (!confirm('Mark this order as delivered? This will permanently reduce your stock.')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deliver' }),
      });
      if (res.ok) {
        setDone(true);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to mark as delivered');
      }
    } catch (e) {
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDeliver}
      disabled={loading}
      className="text-xs bg-[var(--color-success)] hover:bg-[var(--color-success)]/80 text-white border-0 px-4 py-2"
    >
      {loading ? 'Marking...' : '✓ Mark Delivered'}
    </Button>
  );
}
