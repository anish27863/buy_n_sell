'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AdminProductActions({ productId, isActive }: { productId: number; isActive: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggle = async () => {
    setLoading(true);
    await fetch(`/api/admin/products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: isActive ? 'deactivate' : 'activate' }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-xs px-3 py-1.5 rounded border transition-colors ${
        isActive
          ? 'border-[var(--color-danger)] text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10'
          : 'border-[var(--color-success)] text-[var(--color-success)] hover:bg-[var(--color-success)]/10'
      }`}
    >
      {loading ? '...' : isActive ? 'Deactivate' : 'Activate'}
    </button>
  );
}
