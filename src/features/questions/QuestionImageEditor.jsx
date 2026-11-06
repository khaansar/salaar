'use client';

import React, { useRef, useState } from 'react';
import { ImagePlus, LoaderCircle, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { questionsApi } from '@/services/adminService';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function normalizeImage(image, index) {
  return {
    url: image?.url || '',
    publicId: image?.publicId || '',
    altText: image?.altText || '',
    caption: image?.caption || '',
    sequence: Number.isInteger(image?.sequence) ? image.sequence : index,
  };
}

export function QuestionImageEditor({
  images = [],
  onChange,
  disabled = false,
  title = 'Images',
  description = 'Upload images and add accessible descriptions.',
  compact = false,
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const updateImage = (index, patch) => {
    onChange(
      images.map((image, i) =>
        i === index ? { ...image, ...patch } : image
      )
    );
  };

  const removeImage = (index) => {
    onChange(
      images
        .filter((_, i) => i !== index)
        .map((image, sequence) => ({ ...image, sequence }))
    );
  };

  const moveImage = (index, direction) => {
    const next = [...images];
    const target = index + direction;

    if (target < 0 || target >= next.length) return;

    [next[index], next[target]] = [next[target], next[index]];

    onChange(next.map((image, sequence) => ({ ...image, sequence })));
  };

  const uploadFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';

    if (!files.length) return;

    setError('');
    setUploading(true);

    try {
      const uploaded = [];

      for (const file of files) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          throw new Error(
            `${file.name}: use JPEG, PNG, WebP, or GIF.`
          );
        }

        if (file.size > MAX_FILE_SIZE) {
          throw new Error(`${file.name}: maximum size is 10 MB.`);
        }

        const intent = await questionsApi.createImageUploadIntent();

        if (
          !intent?.uploadUrl ||
          !intent?.apiKey ||
          !intent?.signature ||
          !intent?.publicId ||
          !intent?.timestamp
        ) {
          throw new Error('The image upload intent response is incomplete.');
        }

        const body = new FormData();

        for (const [key, value] of Object.entries(
          intent.uploadParameters || {}
        )) {
          if (value != null) body.append(key, String(value));
        }

        body.set('file', file);
        body.set('api_key', intent.apiKey);
        body.set('timestamp', String(intent.timestamp));
        body.set('signature', intent.signature);
        body.set('public_id', intent.publicId);

        if (intent.assetFolder) {
          body.set('asset_folder', intent.assetFolder);
        }

        const response = await fetch(intent.uploadUrl, {
          method: 'POST',
          body,
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.secure_url || !result.public_id) {
          throw new Error(
            result?.error?.message ||
              `Cloudinary upload failed for ${file.name}.`
          );
        }

        uploaded.push(
          normalizeImage(
            {
              url: result.secure_url,
              publicId: result.public_id,
              altText: '',
              caption: '',
              sequence: images.length + uploaded.length,
            },
            images.length + uploaded.length
          )
        );
      }

      onChange([...images, ...uploaded]);
    } catch (err) {
      setError(err?.message || 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const fieldClass =
    'mt-1 block h-9 w-full rounded-[6px] border border-slate-300 bg-white px-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#4F46E5] disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500';
  const iconButtonClass =
    'inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-30 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200';

  const uploadButton = (
    <button
      type="button"
      disabled={disabled || uploading}
      onClick={() => inputRef.current?.click()}
      className={
        compact || images.length > 0
          ? 'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 transition-colors hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-500/40 dark:hover:text-indigo-300'
          : 'flex w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 bg-slate-50/60 px-4 py-5 text-sm font-medium text-slate-600 transition-colors hover:border-indigo-400 hover:bg-indigo-50/40 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800/30 dark:text-slate-300 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300'
      }
    >
      <span className="inline-flex items-center gap-1.5">
        {uploading ? <LoaderCircle size={15} className="animate-spin" /> : <ImagePlus size={15} />}
        {uploading ? 'Uploading…' : images.length > 0 ? 'Add more' : 'Upload images'}
      </span>
      {!compact && images.length === 0 && !uploading && (
        <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">
          JPEG, PNG, WebP or GIF · up to 10 MB each
        </span>
      )}
    </button>
  );

  return (
    <section className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        multiple
        className="hidden"
        disabled={disabled || uploading}
        onChange={uploadFiles}
      />

      {!compact && (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">{title}</h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>
          </div>
          {images.length > 0 && uploadButton}
        </div>
      )}

      {compact ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
          {uploadButton}
        </div>
      ) : (
        images.length === 0 && uploadButton
      )}

      {error && (
        <p role="alert" className="text-xs text-red-500">
          {error}
        </p>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {images.map((image, index) => (
            <div
              key={`${image.publicId || image.url}-${index}`}
              className="flex gap-3 rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-900"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.altText || ''}
                className="h-20 w-20 shrink-0 rounded-md border border-slate-100 bg-slate-50 object-contain dark:border-slate-800 dark:bg-slate-800"
              />

              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    Image {index + 1}
                  </span>
                  <div className="flex items-center">
                    <button type="button" title="Move image up" disabled={disabled || index === 0} onClick={() => moveImage(index, -1)} className={iconButtonClass}>
                      <ArrowUp size={14} />
                    </button>
                    <button type="button" title="Move image down" disabled={disabled || index === images.length - 1} onClick={() => moveImage(index, 1)} className={iconButtonClass}>
                      <ArrowDown size={14} />
                    </button>
                    <button type="button" title="Remove image" disabled={disabled} onClick={() => removeImage(index)} className={`${iconButtonClass} hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400`}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <label className="sr-only" htmlFor={`img-alt-${index}-${image.publicId || image.url}`}>Alt text</label>
                <input
                  id={`img-alt-${index}-${image.publicId || image.url}`}
                  value={image.altText || ''}
                  maxLength={300}
                  disabled={disabled}
                  onChange={(event) => updateImage(index, { altText: event.target.value })}
                  placeholder="Alt text (for accessibility)"
                  className={fieldClass}
                />

                <label className="sr-only" htmlFor={`img-caption-${index}-${image.publicId || image.url}`}>Caption</label>
                <input
                  id={`img-caption-${index}-${image.publicId || image.url}`}
                  value={image.caption || ''}
                  maxLength={500}
                  disabled={disabled}
                  onChange={(event) => updateImage(index, { caption: event.target.value })}
                  placeholder="Caption (optional)"
                  className={fieldClass}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
