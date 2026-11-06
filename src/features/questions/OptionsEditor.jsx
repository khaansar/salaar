'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, GripVertical, Sigma, ImagePlus } from 'lucide-react';
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
  const handleRefs = useRef({});
  // Drag state: the row is only draggable while its grip handle is pressed,
  // so selecting text inside the option input still works normally.
  const [armedId, setArmedId] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  // Disarm the row if the pointer is released anywhere without a drag.
  useEffect(() => {
    if (!armedId || dragIndex !== null) return undefined;
    const disarm = () => setArmedId(null);
    window.addEventListener('pointerup', disarm);
    return () => window.removeEventListener('pointerup', disarm);
  }, [armedId, dragIndex]);

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

  const reorder = (from, to) => {
    if (from === to || from == null || to == null) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const resetDrag = () => {
    setArmedId(null);
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleKeyReorder = (event, option, index) => {
    const direction = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0;
    if (!direction) return;
    event.preventDefault();
    move(index, direction);
    requestAnimationFrame(() => handleRefs.current[option.id]?.focus());
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
        const isDragging = dragIndex === index;
        const isDropTarget = overIndex === index && dragIndex !== null && dragIndex !== index;

        return (
          <div
            key={option.id}
            draggable={!disabled && armedId === option.id}
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = 'move';
              event.dataTransfer.setData('text/plain', option.id);
              setDragIndex(index);
            }}
            onDragOver={(event) => {
              if (dragIndex === null) return;
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
              if (overIndex !== index) setOverIndex(index);
            }}
            onDrop={(event) => {
              if (dragIndex === null) return;
              event.preventDefault();
              reorder(dragIndex, index);
              resetDrag();
            }}
            onDragEnd={resetDrag}
            className={`rounded-lg border bg-white transition-all dark:bg-slate-900 ${
              isDropTarget
                ? 'border-indigo-400 ring-2 ring-indigo-500/20 dark:border-indigo-500/60'
                : 'border-slate-200 focus-within:border-indigo-300 dark:border-slate-700 dark:focus-within:border-indigo-500/50'
            } ${isDragging ? 'opacity-40' : ''}`}
          >
            <div className="flex items-center gap-1.5 p-1.5 pl-1">
              <button
                type="button"
                ref={(element) => {
                  handleRefs.current[option.id] = element;
                }}
                disabled={disabled || value.length < 2}
                onPointerDown={() => setArmedId(option.id)}
                onKeyDown={(event) => handleKeyReorder(event, option, index)}
                title="Drag to reorder (or focus and use ↑ / ↓)"
                aria-label={`Reorder option ${letter}. Drag, or use the arrow keys.`}
                className="inline-flex h-8 w-6 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:cursor-grabbing disabled:pointer-events-none disabled:opacity-30 dark:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-400"
              >
                <GripVertical size={15} />
              </button>

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
