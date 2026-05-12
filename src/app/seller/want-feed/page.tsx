'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { PageTransition } from '@/components/layout/PageTransition';

type Post = { id: number; title: string; description: string; budget: string | null; category: string | null; createdAt: string; customerName: string; replyCount: number };

function ReplyModal({ postId, postTitle, onClose, onSuccess }: { postId: number; postTitle: string; onClose: () => void; onSuccess: () => void }) {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const res = await fetch(`/api/want-posts/${postId}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    if (res.ok) { onSuccess(); onClose(); }
    else { setError(data.error || 'Failed to send reply'); }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-serif mb-1">Reply to Request</h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-6 italic">"{postTitle}"</p>
        {error && <p className="text-[var(--color-danger)] text-sm mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
            placeholder="Describe what you can offer..."
            className="w-full min-h-[120px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] resize-none"
          />
          <div className="flex gap-3">
            <Button type="submit" disabled={submitting || !message.trim()} className="flex-1 font-serif italic">
              {submitting ? 'Sending...' : 'Send Reply'}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function WantFeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyTarget, setReplyTarget] = useState<{ id: number; title: string } | null>(null);

  const fetchPosts = async () => {
    const res = await fetch('/api/want-posts');
    const data = await res.json();
    setPosts(data.posts || []);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
        <header className="mb-10 border-b border-[var(--color-border)] pb-6">
          <h1 className="text-4xl font-serif mb-1">Want Feed.</h1>
          <p className="text-[var(--color-text-secondary)]">Customers request items. You provide the supply.</p>
        </header>

        {replyTarget && (
          <ReplyModal
            postId={replyTarget.id}
            postTitle={replyTarget.title}
            onClose={() => setReplyTarget(null)}
            onSuccess={fetchPosts}
          />
        )}

        {loading ? (
          <div className="text-center py-24 text-[var(--color-text-muted)] italic">Loading requests...</div>
        ) : posts.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-[var(--color-border)] rounded-xl">
            <p className="text-[var(--color-text-muted)] italic">No customer requests currently available.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {posts.map(post => (
              <div key={post.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-xl hover:border-[var(--color-text-muted)] transition-colors">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                  <div>
                    <h2 className="text-xl font-serif text-[var(--color-text-primary)]">{post.title}</h2>
                    <div className="text-xs text-[var(--color-text-muted)] mt-1 flex flex-wrap gap-2">
                      <span className="uppercase tracking-widest text-[var(--color-accent)]">{post.category || 'General'}</span>
                      <span>•</span>
                      <span>Requested by {post.customerName}</span>
                      <span>•</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {post.budget && (
                    <div className="bg-[var(--color-bg-tertiary)] px-3 py-1 rounded-md text-sm font-medium border border-[var(--color-border)] text-[var(--color-success)] shrink-0">
                      Budget: Rs. {Number(post.budget).toFixed(2)}
                    </div>
                  )}
                </div>

                {post.description && (
                  <p className="text-[var(--color-text-secondary)] text-sm mb-4 whitespace-pre-wrap">{post.description}</p>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-4 border-t border-[var(--color-border)]">
                  <span className="text-xs text-[var(--color-text-muted)]">{post.replyCount} {post.replyCount === 1 ? 'reply' : 'replies'}</span>
                  <Button
                    className="text-xs font-serif italic"
                    onClick={() => setReplyTarget({ id: post.id, title: post.title })}
                  >
                    Contact Customer →
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
