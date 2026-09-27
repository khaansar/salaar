'use client';
import React, { useRef, useState } from 'react';
import { Sigma, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import { MathText } from '@/components/common/MathText';

/**
 * Inserts `snippet` around the current selection (or at the cursor) in the
 * textarea referenced by `ref`, then reports the new value via `onChange`.
 */
function insertAtCursor(textareaEl, value, onChange, before, after = '', placeholder = '') {
  if (!textareaEl) {
    onChange(value + before + placeholder + after);
    return;
  }
  const start = textareaEl.selectionStart ?? value.length;
  const end = textareaEl.selectionEnd ?? value.length;
  const selected = value.slice(start, end) || placeholder;
  const next = value.slice(0, start) + before + selected + after + value.slice(end);
  onChange(next);
  requestAnimationFrame(() => {
    textareaEl.focus();
    const cursor = start + before.length + selected.length + after.length;
    textareaEl.setSelectionRange(cursor, cursor);
  });
}

export function MathTextarea({ id, label, value, onChange, error, rows = 4, placeholder }) {
  const ref = useRef(null);
  const [showPreview, setShowPreview] = useState(false);

  const insertImage = () => {
    const url = window.prompt('Image URL (there is no file upload yet — paste a hosted image link):');
    if (!url) return;
    insertAtCursor(ref.current, value, onChange, `![figure](${url})`, '', '');
  };

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="rounded-lg border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent">
        <div className="flex items-center gap-1 border-b border-slate-100 bg-slate-50 px-2 py-1.5">
          <button
            type="button"
            title="Insert inline math ($...$)"
            onClick={() => insertAtCursor(ref.current, value, onChange, '$', '$', 'x^2')}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200"
          >
            <Sigma size={13} /> Inline
          </button>
          <button
            type="button"
            title="Insert block math ($$...$$)"
            onClick={() => insertAtCursor(ref.current, value, onChange, '\n$$', '$$\n', '\\int_0^1 x\\,dx')}
            className="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200"
          >
            Block
          </button>
          <button
            type="button"
            title="Insert image"
            onClick={insertImage}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200"
          >
            <ImageIcon size={13} /> Image
          </button>
          <button
            type="button"
            title={showPreview ? 'Hide preview' : 'Show preview'}
            onClick={() => setShowPreview((s) => !s)}
            className="ml-auto inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
          >
            {showPreview ? <EyeOff size={13} /> : <Eye size={13} />}
            {showPreview ? 'Edit' : 'Preview'}
          </button>
        </div>
        {showPreview ? (
          <div className="min-h-[6rem] px-3 py-2.5 text-sm">
            {value ? <MathText text={value} /> : <span className="text-slate-400">Nothing to preview yet.</span>}
          </div>
        ) : (
          <textarea
            id={id}
            ref={ref}
            rows={rows}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="block w-full border-0 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 resize-y"
          />
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}