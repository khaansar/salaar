import React, { useState } from 'react';

const SIZE_CLASSES = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
};

function initialsFor(name) {
  if (!name) return 'A';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'A';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/**
 * Renders `avatarUrl` when present and loadable, otherwise falls back to
 * initials derived from `name` on a solid indigo background.
 */
export function Avatar({ name, avatarUrl, size = 'md', className = '' }) {
  const [imgFailed, setImgFailed] = useState(false);
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  if (avatarUrl && !imgFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name || 'Admin'}
        onError={() => setImgFailed(true)}
        className={`${sizeClass} rounded-full object-cover border border-slate-200 shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-indigo-600 flex items-center justify-center font-semibold text-white shrink-0 ${className}`}
    >
      {initialsFor(name)}
    </div>
  );
}