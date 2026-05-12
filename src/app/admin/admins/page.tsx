'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageTransition } from '@/components/layout/PageTransition';
import { useRouter } from 'next/navigation';

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchAdmins = async () => {
    try {
      const res = await fetch('/api/admin/list');
      const data = await res.json();
      setAdmins(data.admins || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const res = await fetch('/api/admin/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setShowModal(false);
      setForm({ username: '', password: '', email: '' });
      fetchAdmins();
    } else {
      setError(data.error || 'Failed to create admin');
    }
    setSubmitting(false);
  };

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-3 sm:px-6 md:px-8 py-6 md:py-12">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 md:mb-10 border-b border-[var(--color-border)] pb-3 md:pb-6 gap-3">
          <h1 className="text-xl sm:text-2xl md:text-4xl font-serif">Admin Management</h1>
          <Button onClick={() => setShowModal(true)} className="font-serif italic text-sm">+ Create Admin</Button>
        </header>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 w-full max-w-md shadow-2xl">
              <h2 className="text-2xl font-serif mb-6">New Admin Account</h2>
              {error && <p className="text-[var(--color-danger)] text-sm mb-4">{error}</p>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest block mb-1">Username</label>
                  <Input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required minLength={3} />
                </div>
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest block mb-1">Email</label>
                  <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                </div>
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest block mb-1">Password</label>
                  <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={submitting} className="flex-1 font-serif italic">
                    {submitting ? 'Creating...' : 'Create Admin'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Mobile cards */}
        <div className="flex flex-col gap-3 md:hidden">
          {loading ? (
            <div className="py-8 text-center text-[var(--color-text-muted)] italic text-sm">Loading...</div>
          ) : admins.length === 0 ? (
            <div className="py-8 text-center text-[var(--color-text-muted)] italic text-sm">No admins found.</div>
          ) : admins.map(a => (
            <div key={a.id} className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
              <div className="font-semibold text-sm">{a.username}</div>
              <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{a.email || '—'}</div>
              <div className="text-[10px] text-[var(--color-text-muted)] mt-1">Joined {new Date(a.createdAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border)] text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
              <tr>
                <th className="p-4 font-medium">ID</th>
                <th className="p-4 font-medium">Username</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-[var(--color-text-muted)] italic">Loading...</td></tr>
              ) : admins.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-[var(--color-text-muted)] italic">No admins found.</td></tr>
              ) : (
                admins.map(a => (
                  <tr key={a.id} className="hover:bg-[var(--color-bg-secondary)] transition-colors">
                    <td className="p-4 font-mono text-[var(--color-text-muted)]">{a.id}</td>
                    <td className="p-4 font-medium">{a.username}</td>
                    <td className="p-4 text-[var(--color-text-secondary)]">{a.email || '—'}</td>
                    <td className="p-4 text-[var(--color-text-secondary)]">{new Date(a.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageTransition>
  );
}
