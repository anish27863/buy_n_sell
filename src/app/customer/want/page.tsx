import { PageTransition } from '@/components/layout/PageTransition';
import { db } from '@/db';
import { wantPosts, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { Button } from '@/components/ui/Button';

export default async function WantPage() {
  let posts: any[] = [];
  try {
    posts = await db
      .select({
        id: wantPosts.id,
        title: wantPosts.title,
        description: wantPosts.description,
        budget: wantPosts.budget,
        category: wantPosts.category,
        createdAt: wantPosts.createdAt,
        customerName: users.username,
      })
      .from(wantPosts)
      .innerJoin(users, eq(wantPosts.customerId, users.id))
      .where(eq(wantPosts.isOpen, true))
      .orderBy(desc(wantPosts.createdAt))
      .limit(50);
  } catch (e) {
    console.error('DB fetch failed', e);
  }

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-8 py-12">
        <header className="mb-12 flex justify-between items-center border-b border-[var(--color-border)] pb-6">
          <div>
            <h1 className="text-4xl font-serif mb-2">The Forum.</h1>
            <p className="text-[var(--color-text-secondary)]">Post what you desire. Let the sellers come to you.</p>
          </div>
          <Button variant="primary" className="font-serif italic">+ New Request</Button>
        </header>

        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-[var(--color-border)] rounded-lg">
              <p className="text-[var(--color-text-muted)] italic">No open requests currently.</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-xl hover:border-[var(--color-text-muted)] transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-serif text-[var(--color-text-primary)]">{post.title}</h2>
                    <div className="text-xs text-[var(--color-text-muted)] mt-1 flex gap-3">
                      <span className="uppercase tracking-widest text-[var(--color-accent)]">{post.category || 'General'}</span>
                      <span>•</span>
                      <span>By {post.customerName}</span>
                      <span>•</span>
                      <span>{new Date(post.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {post.budget && (
                    <div className="bg-[var(--color-bg-tertiary)] px-3 py-1 rounded-md text-sm font-medium border border-[var(--color-border)]">
                      Budget: ${Number(post.budget).toFixed(2)}
                    </div>
                  )}
                </div>
                
                <p className="text-[var(--color-text-secondary)] text-sm mb-6 whitespace-pre-wrap">{post.description}</p>
                
                <div className="flex justify-end pt-4 border-t border-[var(--color-border)]">
                  <Button variant="ghost" className="text-xs">View Replies (0)</Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PageTransition>
  );
}
