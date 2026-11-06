'use client';

import React, { useRef } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Sigma, ImagePlus } from 'lucide-react';
import { QuestionImageEditor } from './QuestionImageEditor';

let counter = 0;

export function newOptionId() {
  counter += 1;
  return `opt_${Date.now().toString(36)}_${counter}`;
}

const ICON_BUTTON =
  'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-30 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200';

export function OptionsEditor({ value = [], onChange, disabled }) {
  const inputRefs = useRef({});
  const imageEditorRefs = useRef({});

  const update = (id, patch) =>
    onChange(value.map((option) =>
      option.id === id ? { ...option, ...patch } : option
    ));

  const remove = (id) =>
    onChange(value.filter((option) => option.id !== id));

  const add = () =>
    onChange([...value, { id: newOptionId(), text: '', images: [] }]);

  const move = (index, direction) => {
    const next = [...value];
    const target = index + direction;

    if (target < 0 || target >= next.length) return;

    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const insertMath = (option) => {
    const element = inputRefs.current[option.id];
    const text = option.text || '';
    const start = element?.selectionStart ?? text.length;
    const end = element?.selectionEnd ?? text.length;
    const selected = text.slice(start, end) || 'x^2';

    const next =
      `${text.slice(0, start)}$${selected}$${text.slice(end)}`;

    update(option.id, { text: next });

    requestAnimationFrame(() => {
      if (!element) return;
      element.focus();
      const cursor = start + selected.length + 2;
      element.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div className="space-y-2">
      {value.map((option, index) => {
        const letter = String.fromCharCode(65 + index);
        const imageCount = (option.images || []).length;

        return (
          <div
            key={option.id}
            className="rounded-lg border border-slate-200 bg-white transition-colors focus-within:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:focus-within:border-indigo-500/50"
          >
            <div className="flex items-center gap-1.5 p-1.5 pl-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {letter}
              </span>

              <input
                ref={(element) => {
                  inputRefs.current[option.id] = element;
                }}
                aria-label={`Option ${letter}`}
                placeholder={`Option ${letter} — use $...$ for math`}
                value={option.text || ''}
                disabled={disabled}
                onChange={(event) =>
                  update(option.id, { text: event.target.value })
                }
                className="h-8 min-w-0 flex-1 bg-transparent px-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:opacity-50 dark:text-white dark:placeholder:text-slate-500"
              />

              <button
                type="button"
                title="Wrap selection in math ($...$)"
                aria-label={`Insert math in option ${letter}`}
                disabled={disabled}
                onClick={() => insertMath(option)}
                className={ICON_BUTTON}
              >
                <Sigma size={15} />
              </button>

              <button
                type="button"
                title="Upload images from your device"
                aria-label={`Upload images for option ${letter}`}
                disabled={disabled}
                onClick={() => imageEditorRefs.current[option.id]?.openPicker()}
                className={`${ICON_BUTTON} relative ${imageCount > 0 ? 'text-indigo-600 dark:text-indigo-300' : ''}`}
              >
                <ImagePlus size={15} />
                {imageCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[9px] font-bold text-white">
                    {imageCount}
                  </span>
                )}
              </button>

              <span className="mx-0.5 hidden h-5 w-px bg-slate-200 dark:bg-slate-700 sm:block" />

              <button
                type="button"
                disabled={disabled || index === 0}
                onClick={() => move(index, -1)}
                className={`${ICON_BUTTON} hidden sm:inline-flex`}
                title="Move option up"
                aria-label={`Move option ${letter} up`}
              >
                <ChevronUp size={15} />
              </button>

              <button
                type="button"
                disabled={disabled || index === value.length - 1}
                onClick={() => move(index, 1)}
                className={`${ICON_BUTTON} hidden sm:inline-flex`}
                title="Move option down"
                aria-label={`Move option ${letter} down`}
              >
                <ChevronDown size={15} />
              </button>

              <button
                type="button"
                disabled={disabled || value.length <= 2}
                onClick={() => remove(option.id)}
                className={`${ICON_BUTTON} hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400`}
                title="Remove option"
                aria-label={`Remove option ${letter}`}
              >
                <Trash2 size={15} />
              </button>
            </div>

            <QuestionImageEditor
              ref={(handle) => {
                imageEditorRefs.current[option.id] = handle;
              }}
              compact
              title={`Images for option ${letter}`}
              images={option.images || []}
              disabled={disabled}
              onChange={(images) => update(option.id, { images })}
            />
          </div>
        );
      })}

      <button
        type="button"
        onClick={add}
        disabled={disabled}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:border-indigo-400 hover:bg-indigo-50/40 hover:text-indigo-600 disabled:pointer-events-none disabled:opacity-50 dark:border-slate-700 dark:text-slate-400 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
      >
        <Plus size={15} />
        Add option
      </button>
    </div>
  );
}
