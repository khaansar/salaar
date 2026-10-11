'use client';

import React, { useRef } from 'react';
import { Plus, Trash2, GripVertical, Sigma } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { QuestionImageEditor } from './QuestionImageEditor';

let counter = 0;

export function newOptionId() {
  counter += 1;
  return `opt_${Date.now().toString(36)}_${counter}`;
}

export function OptionsEditor({ value = [], onChange, disabled }) {
  const inputRefs = useRef({});

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
    <div className="space-y-4">
      {value.map((option, index) => (
        <div
          key={option.id}
          className="rounded-lg border border-slate-200 p-3"
        >
          <div className="flex items-center gap-2">
            <div className="flex flex-col text-slate-300">
              <button
                type="button"
                disabled={disabled || index === 0}
                onClick={() => move(index, -1)}
                className="disabled:opacity-30 hover:text-slate-500"
                title="Move option up"
              >
                <GripVertical size={14} />
              </button>
            </div>

            <span className="w-6 shrink-0 text-xs font-semibold text-slate-400">
              {String.fromCharCode(65 + index)}
            </span>

            <div className="flex-1">
              <Input
                ref={(element) => {
                  inputRefs.current[option.id] = element;
                }}
                placeholder={`Option ${String.fromCharCode(65 + index)} — use $...$ for math`}
                value={option.text || ''}
                disabled={disabled}
                onChange={(event) =>
                  update(option.id, { text: event.target.value })
                }
              />
            </div>

            <button
              type="button"
              title="Wrap selection in math ($...$)"
              disabled={disabled}
              onClick={() => insertMath(option)}
              className="shrink-0 text-slate-400 hover:text-indigo-600 disabled:opacity-30"
            >
              <Sigma size={15} />
            </button>

            <button
              type="button"
              disabled={disabled || value.length <= 2}
              onClick={() => remove(option.id)}
              className="shrink-0 text-slate-400 hover:text-rose-600 disabled:pointer-events-none disabled:opacity-30"
              title="Remove option"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="mt-3 pl-8">
            <QuestionImageEditor
              title={`Images for option ${String.fromCharCode(65 + index)}`}
              description="Optional. Add diagrams or figures associated with this option."
              images={option.images || []}
              disabled={disabled}
              onChange={(images) => update(option.id, { images })}
            />
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={add}
        disabled={disabled}
        className="mt-1"
      >
        <Plus size={14} className="mr-1.5" />
        Add option
      </Button>
    </div>
  );
}