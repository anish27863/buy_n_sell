'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageTransition } from '@/components/layout/PageTransition';

type Reply = { id: number; message: string; shopName: string; createdAt: string };
type Post = { id: number; title: string; description: string; budget: string | null; category: string | null; createdAt: string; customerName: string; replyCount: number };

const CATEGORIES = ['chips', 'drinks', 'biscuits', 'namkeen', 'medicine', 'others'];

function PostCard({ post }: { post: Post }) {
  const [expanded, setExpanded] = useState(false);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const loadReplies = async () => {
    if (expanded) { setExpanded(false); return; }
    setLoadingReplies(true);
    const res = await fetch(`/api/want-posts/${post.id}/replies`);
    const data = await res.json();
    setReplies(data.replies || []);
    setLoadingReplies(false);
    setExpanded(true);
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-xl hover:border-[var(--color-text-muted)] transition-colors">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
        <div>
          <h2 className="text-xl font-serif text-[var(--color-text-primary)]">{post.title}</h2>
          <div className="text-xs text-[var(--color-text-muted)] mt-1 flex flex-wrap gap-2">
            <span className="uppercase tracking-widest text-[var(--color-accent)]">{post.category || 'General'}</span>
            <span>•</span>
            <span>By {post.customerName}</span>
            <span>•</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        {post.budget && (
          <div className="bg-[var(--color-bg-tertiary)] px-3 py-1 rounded-md text-sm font-medium border border-[var(--color-border)] shrink-0">
            Budget: Rs. {Number(post.budget).toFixed(2)}
          </div>
        )}
      </div>

      {post.description && (
        <p className="text-[var(--color-text-secondary)] text-sm mb-4 whitespace-pre-wrap">{post.description}</p>
      )}

      <div className="flex justify-end pt-4 border-t border-[var(--color-border)]">
        <Button variant="ghost" className="text-xs" onClick={loadReplies}>
          {loadingReplies ? 'Loading...' : expanded ? `Hide Replies (${replies.length})` : `View Replies (${post.replyCount})`}
        </Button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3 pt-4 border-t border-[var(--color-border)]">
          {replies.length === 0 ? (
            <p className="text-[var(--color-text-muted)] italic text-sm text-center py-4">No replies yet.</p>
          ) : replies.map(r => (
            <div key={r.id} className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] border-l-4 border-l-[var(--color-accent)] px-4 py-3 rounded-lg">
              <div className="text-xs text-[var(--color-accent)] uppercase tracking-widest mb-1">{r.shopName}</div>
              <p className="text-sm text-[var(--color-text-primary)] whitespace-pre-wrap">{r.message}</p>
              <div className="text-[10px] text-[var(--color-text-muted)] mt-1">{new Date(r.createdAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function WantPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', budget: '', category: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchPosts = async () => {
    const res = await fetch('/api/want-posts');
    const data = await res.json();
    setPosts(data.posts || []);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const res = await fetch('/api/want-posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, budget: form.budget ? parseFloat(form.budget) : null }),
    });
    const data = await res.json();
    if (res.ok) {
      setShowModal(false);
      setForm({ title: '', description: '', budget: '', category: '' });
      fetchPosts();
    } else {
      setError(data.error || 'Failed to post');
    }
    setSubmitting(false);
  };

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
        <header className="mb-10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-[var(--color-border)] pb-6">
          <div>
            <h1 className="text-4xl font-serif mb-1">The Forum.</h1>
            <p className="text-[var(--color-text-secondary)]">Post what you desire. Let the sellers come to you.</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="font-serif italic shrink-0">+ New Request</Button>
        </header>

        {/* New Post Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 w-full max-w-lg shadow-2xl">
              <h2 className="text-2xl font-serif mb-6">New Request</h2>
              {error && <p className="text-[var(--color-danger)] text-sm mb-4">{error}</p>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest block mb-1">Title *</label>
                  <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="What are you looking for?" />
                </div>
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest block mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="More details..."
                    className="w-full min-h-[100px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest block mb-1">Category</label>
                    <select
                      value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg p-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
                    >
                      <option value="">General</option>
                      {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest block mb-1">Budget (Rs.)</label>
                    <Input type="number" min={0} step={0.01} value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} placeholder="Optional" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={submitting} className="flex-1 font-serif italic">
                    {submitting ? 'Posting...' : 'Post Request'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Posts List */}
        {loading ? (
          <div className="text-center py-24 text-[var(--color-text-muted)] italic">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-[var(--color-border)] rounded-xl">
            <p className="text-[var(--color-text-muted)] italic mb-4">No open requests yet. Be the first!</p>
            <Button onClick={() => setShowModal(true)} className="font-serif italic">+ Post a Request</Button>
          </div>
        ) : (
          <div className="space-y-5">
            {posts.map(p => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
