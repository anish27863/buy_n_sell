'use client';

import { useState, useRef } from 'react';
import { useUploadThing } from '@/lib/uploadthing-client';

type ImageUploaderProps = {
  images: string[];
  onChange: (urls: string[]) => void;
};

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { startUpload } = useUploadThing('productImageUploader', {
    onClientUploadComplete: (res) => {
      const newUrls = res.map((r) => r.ufsUrl);
      onChange([...images, ...newUrls]);
      setUploading(false);
      setError('');
    },
    onUploadError: (err) => {
      setError(err.message || 'Upload failed');
      setUploading(false);
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = 4 - images.length;
    if (remaining <= 0) {
      setError('Maximum 4 images allowed');
      return;
    }

    setUploading(true);
    setError('');
    await startUpload(files.slice(0, remaining));
    // Reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeImage = (url: string) => {
    onChange(images.filter((img) => img !== url));
  };

  return (
    <div className="space-y-3">
      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((url) => (
            <div key={url} className="relative group aspect-square rounded-lg overflow-hidden border border-[var(--color-border)]">
              <img src={url} alt="Product" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop Zone */}
      {images.length < 4 && (
        <div
          onClick={() => inputRef.current?.click()}
          className={`w-full h-28 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
            uploading
              ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
              : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
          } bg-[var(--color-surface)]`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
          {uploading ? (
            <>
              <div className="w-5 h-5 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Uploading...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">Click to upload images</span>
              <span className="text-xs opacity-60">{images.length}/4 · Max 4MB each</span>
            </>
          )}
        </div>
      )}

      {error && <p className="text-[var(--color-danger)] text-xs">{error}</p>}
    </div>
  );
}
