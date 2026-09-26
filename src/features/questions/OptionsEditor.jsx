'use client';

import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

let counter = 0;
export function newOptionId() {
  counter += 1;
  return `opt_${Date.now().toString(36)}_${counter}`;
}

/**
 * @param {{id:string,text:string}[]} value
 * @param {(next: {id:string,text:string}[]) => void} onChange
 */
export function OptionsEditor({ value = [], onChange, disabled }) {
  const update = (id, text) => onChange(value.map((o) => (o.id === id ? { ...o, text } : o)));
  const remove = (id) => onChange(value.filter((o) => o.id !== id));
  const add = () => onChange([...value, { id: newOptionId(), text: '' }]);
  const move = (index, dir) => {
    const next = [...value];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {value.map((opt, i) => (
        <div key={opt.id} className="flex items-center gap-2">
          <div className="flex flex-col text-slate-300">
            <button type="button" disabled={disabled || i === 0} onClick={() => move(i, -1)} className="disabled:opacity-30 hover:text-slate-500">
              <GripVertical size={14} />
            </button>
          </div>
          <span className="w-6 shrink-0 text-xs font-semibold text-slate-400">{String.fromCharCode(65 + i)}</span>
          <div className="flex-1">
            <Input
              placeholder={`Option ${String.fromCharCode(65 + i)}`}
              value={opt.text}
              disabled={disabled}
              onChange={(e) => update(opt.id, e.target.value)}
            />
          </div>
          <button
            type="button"
            disabled={disabled || value.length <= 2}
            onClick={() => remove(opt.id)}
            className="text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:pointer-events-none shrink-0"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={add} disabled={disabled} className="mt-1">
        <Plus size={14} className="mr-1.5" />
        Add option
      </Button>
    </div>
  );
}
