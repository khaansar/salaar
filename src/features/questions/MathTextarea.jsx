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
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className={`overflow-hidden rounded-lg border bg-white shadow-sm transition-colors focus-within:border-transparent focus-within:ring-2 dark:bg-slate-800 ${error ? 'border-red-500 focus-within:ring-red-500' : 'border-slate-300 focus-within:ring-[#4F46E5] dark:border-slate-700'}`}>
        <div className="flex items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-1.5 py-1 dark:border-slate-700 dark:bg-slate-900/60">
          <button
            type="button"
            title="Insert inline math ($...$)"
            onClick={() => insertAtCursor(ref.current, value, onChange, '$', '$', 'x^2')}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
          >
            <Sigma size={13} /> Inline
          </button>
          <button
            type="button"
            title="Insert block math ($$...$$)"
            onClick={() => insertAtCursor(ref.current, value, onChange, '\n$$', '$$\n', '\\int_0^1 x\\,dx')}
            className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
          >
            Block
          </button>
          <button
            type="button"
            title="Insert image"
            onClick={insertImage}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
          >
            <ImageIcon size={13} /> Image
          </button>
          <button
            type="button"
            title={showPreview ? 'Hide preview' : 'Show preview'}
            onClick={() => setShowPreview((s) => !s)}
            className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
          >
            {showPreview ? <EyeOff size={13} /> : <Eye size={13} />}
            {showPreview ? 'Edit' : 'Preview'}
          </button>
        </div>
        {showPreview ? (
          <div className="min-h-[6rem] px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200">
            {value ? <MathText text={value} /> : <span className="text-slate-400 dark:text-slate-500">Nothing to preview yet.</span>}
          </div>
        ) : (
          <textarea
            id={id}
            ref={ref}
            rows={rows}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="block w-full resize-y border-0 bg-transparent px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 dark:text-white dark:placeholder:text-slate-500"
          />
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}