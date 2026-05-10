'use client';

import { PageTransition } from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewListingPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [mrp, setMrp] = useState('');
  const [quantity, setQuantity] = useState('');
  const [tags, setTags] = useState('');
  const [images, setImages] = useState<string[]>([]); // Scaffold for UploadThing

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleList = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, category, mrp: parseFloat(mrp), quantityAvailable: parseInt(quantity), tags: tags.split(',').map(t => t.trim()) })
      });
      
      if (res.ok) {
        router.push('/seller/listings');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create listing');
      }
    } catch (err) {
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-8 py-12">
        <h1 className="text-4xl font-serif mb-8 border-b border-[var(--color-border)] pb-6">Create New Listing</h1>

        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-12">
          <form onSubmit={handleList} className="space-y-6">
            <div>
              <label className="text-sm text-[var(--color-text-secondary)] block mb-1">Product Title</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[var(--color-text-secondary)] block mb-1">Category</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)} 
                  required
                  className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md p-2 text-sm text-[var(--color-text-primary)] h-10 focus:outline-none focus:border-[var(--color-accent)]"
                >
                  <option value="">Select Category...</option>
                  <option value="chips">Chips</option>
                  <option value="drinks">Drinks</option>
                  <option value="biscuits">Biscuits</option>
                  <option value="namkeen">Namkeen</option>
                  <option value="medicine">Medicine</option>
                  <option value="others">Others</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-[var(--color-text-secondary)] block mb-1">Quantity Available</label>
                <Input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} required />
              </div>
            </div>

            <div>
              <label className="text-sm text-[var(--color-text-secondary)] block mb-1">MRP (Hidden from Buyers)</label>
              <Input type="number" min="0" step="0.01" value={mrp} onChange={e => setMrp(e.target.value)} required />
            </div>

            <div>
              <label className="text-sm text-[var(--color-text-secondary)] block mb-1">Description</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full min-h-[150px] rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] resize-none"
              />
            </div>

            <div>
              <label className="text-sm text-[var(--color-text-secondary)] block mb-1">Tags (Comma separated)</label>
              <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. vintage, rare, gold" />
            </div>

            <div className="pt-4 border-t border-[var(--color-border)]">
              <label className="text-sm text-[var(--color-text-secondary)] block mb-4">Images (UploadThing placeholder)</label>
              <div className="w-full h-32 border-2 border-dashed border-[var(--color-border)] rounded-xl flex items-center justify-center text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors cursor-pointer bg-[var(--color-surface)]">
                Drag & Drop images here
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full py-4 text-lg font-serif tracking-wide italic">
              {loading ? 'Publishing...' : 'Publish Listing'}
            </Button>
          </form>

          {/* Live Preview Panel */}
          <div>
            <div className="sticky top-24">
              <h3 className="font-serif text-lg mb-4 text-[var(--color-text-secondary)]">Live Preview</h3>
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
                <div className="aspect-[4/5] bg-[var(--color-bg-tertiary)] rounded-lg mb-4 flex items-center justify-center text-[var(--color-text-muted)] italic">
                  Image Preview
                </div>
                <div className="text-sm text-[var(--color-accent)] uppercase tracking-widest mb-1">{category || 'Category'}</div>
                <h4 className="font-serif text-lg leading-tight mb-3 text-[var(--color-text-primary)] line-clamp-2">{title || 'Product Title'}</h4>
                <div className="text-xs text-[var(--color-text-muted)] flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[var(--color-bg-primary)] border border-[var(--color-border)]"></div>
                  Your Shop Name
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
