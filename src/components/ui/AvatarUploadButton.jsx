'use client';

import { useRef, useState } from 'react';
import { uploadAvatar } from '@/lib/avatarUpload';

export default function AvatarUploadButton({ onUploaded, disabled = false }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    // Allow selecting the same file again after an upload or failure.
    event.target.value = '';

    if (!file) {
      return;
    }

    setError('');
    setUploading(true);

    try {
      const updatedUser = await uploadAvatar(file);
      onUploaded?.(updatedUser);
    } catch (err) {
      setError(err?.message || 'Failed to upload your avatar.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        disabled={disabled || uploading}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading}
        className="rounded-lg border border-indigo-500/40 px-4 py-2 text-sm font-medium transition-colors hover:border-indigo-500 hover:bg-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {uploading ? 'Uploading…' : 'Change avatar'}
      </button>

      {error && (
        <p role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}