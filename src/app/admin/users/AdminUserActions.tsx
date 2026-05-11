'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AdminUserActions({ userId, isBanned, approvalStatus }: {
  userId: number;
  isBanned: boolean;
  approvalStatus: string;
}) {
  const [loading, setLoading] = useState('');
  const router = useRouter();

  const act = async (action: string) => {
    setLoading(action);
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    setLoading('');
    router.refresh();
  };

  return (
    <div className="flex items-center justify-end gap-2 flex-wrap">
      {approvalStatus === 'pending' && (
        <>
          <button onClick={() => act('approve')} disabled={!!loading} className="text-xs px-3 py-1.5 rounded border border-[var(--color-success)] text-[var(--color-success)] hover:bg-[var(--color-success)]/10 transition-colors">
            {loading === 'approve' ? '...' : 'Approve'}
          </button>
          <button onClick={() => act('reject')} disabled={!!loading} className="text-xs px-3 py-1.5 rounded border border-[var(--color-danger)] text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-colors">
            {loading === 'reject' ? '...' : 'Reject'}
          </button>
        </>
      )}
      <button
        onClick={() => act(isBanned ? 'unban' : 'ban')}
        disabled={!!loading}
        className={`text-xs px-3 py-1.5 rounded border transition-colors ${
          isBanned
            ? 'border-[var(--color-success)] text-[var(--color-success)] hover:bg-[var(--color-success)]/10'
            : 'border-[var(--color-danger)] text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10'
        }`}
      >
        {loading === 'ban' || loading === 'unban' ? '...' : isBanned ? 'Unban' : 'Ban'}
      </button>
    </div>
  );
}
