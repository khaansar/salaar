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

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        multiple
        className="hidden"
        disabled={disabled || uploading}
        onChange={uploadFiles}
      />

      <button
        type="button"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-600 hover:border-indigo-400 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {uploading ? (
          <LoaderCircle size={16} className="animate-spin" />
        ) : (
          <ImagePlus size={16} />
        )}
        {uploading ? 'Uploading images…' : 'Choose images'}
      </button>

      <p className="text-xs text-slate-400">
        JPEG, PNG, WebP or GIF. Maximum 10 MB per image.
      </p>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {images.map((image, index) => (
        <div
          key={`${image.publicId || image.url}-${index}`}
          className="rounded-lg border border-slate-200 p-3"
        >
          <div className="flex items-start gap-3">
            <img
              src={image.url}
              alt={image.altText || ''}
              className="h-20 w-24 shrink-0 rounded-md border border-slate-100 object-contain"
            />

            <div className="min-w-0 flex-1 space-y-2">
              <label className="block text-xs font-medium text-slate-600">
                Alt text
                <input
                  value={image.altText || ''}
                  maxLength={300}
                  disabled={disabled}
                  onChange={(event) =>
                    updateImage(index, { altText: event.target.value })
                  }
                  placeholder="Describe the image for accessibility"
                  className="mt-1 block w-full rounded-md border border-slate-200 px-2.5 py-2 text-sm"
                />
              </label>

              <label className="block text-xs font-medium text-slate-600">
                Caption
                <input
                  value={image.caption || ''}
                  maxLength={500}
                  disabled={disabled}
                  onChange={(event) =>
                    updateImage(index, { caption: event.target.value })
                  }
                  placeholder="Optional caption"
                  className="mt-1 block w-full rounded-md border border-slate-200 px-2.5 py-2 text-sm"
                />
              </label>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              title="Move image up"
              disabled={disabled || index === 0}
              onClick={() => moveImage(index, -1)}
              className="rounded p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
            >
              <ArrowUp size={15} />
            </button>

            <button
              type="button"
              title="Move image down"
              disabled={disabled || index === images.length - 1}
              onClick={() => moveImage(index, 1)}
              className="rounded p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
            >
              <ArrowDown size={15} />
            </button>

            <button
              type="button"
              title="Remove image"
              disabled={disabled}
              onClick={() => removeImage(index)}
              className="rounded p-1.5 text-rose-600 hover:bg-rose-50 disabled:opacity-30"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}