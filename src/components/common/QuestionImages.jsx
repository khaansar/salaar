'use client';

import React from 'react';

export function QuestionImages({
  images,
  className = '',
  imageClassName = '',
}) {
  if (!Array.isArray(images) || images.length === 0) return null;

  const orderedImages = [...images]
    .filter(
      (image) =>
        typeof image?.url === 'string' && image.url.trim().length > 0
    )
    .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));

  if (!orderedImages.length) return null;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {orderedImages.map((image, index) => (
        <figure
          key={`${image.publicId || image.url}-${index}`}
          className="min-w-0"
        >
          <img
            src={image.url}
            alt={image.altText || `Question image ${index + 1}`}
            loading="lazy"
            className={`h-auto max-w-full rounded-md object-contain ${imageClassName}`}
          />

          {image.caption && (
            <figcaption className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              {image.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}