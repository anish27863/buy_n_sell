'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SellerActions({ sellerId }: { sellerId: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAction = async (action: 'approve' | 'reject') => {
    setLoading(true);
    try {
      await fetch(`/api/admin/sellers/${sellerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-end gap-2">
      <button 
        onClick={() => handleAction('approve')}
        disabled={loading}
        className="px-3 py-1 bg-[var(--color-success)]/10 text-[var(--color-success)] hover:bg-[var(--color-success)]/20 border border-[var(--color-success)]/30 rounded text-xs font-medium uppercase tracking-wider transition-colors disabled:opacity-50"
      >
        Approve
      </button>
      <button 
        onClick={() => handleAction('reject')}
        disabled={loading}
        className="px-3 py-1 bg-[var(--color-danger)]/10 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/20 border border-[var(--color-danger)]/30 rounded text-xs font-medium uppercase tracking-wider transition-colors disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  );
}
