'use client';

import React, { useId } from 'react';
import { Check } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

function EmptyOptionsHint() {
  return (
    <p className="rounded-lg border border-dashed border-slate-200 px-3 py-3 text-center text-xs text-slate-400 dark:border-slate-700 dark:text-slate-500">
      Add options above first.
    </p>
  );
}

/** Selectable option card; the native input stays for keyboard + screen readers. */
function AnswerChoice({ type, name, checked, disabled, onChange, letter, text }) {
  return (
    <label
      className={`group flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-indigo-500 ${
        checked
          ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800/60'
      } ${disabled ? 'pointer-events-none opacity-50' : ''}`}
    >
      <input type={type} name={name} disabled={disabled} checked={checked} onChange={onChange} className="sr-only" />
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center text-xs font-bold ${type === 'radio' ? 'rounded-full' : 'rounded-md'} ${
          checked
            ? 'bg-emerald-600 text-white'
            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
        }`}
      >
        {checked ? <Check size={13} strokeWidth={3} /> : letter}
      </span>
      <span className="min-w-0 flex-1 truncate">
        {text || <span className="italic text-slate-400 dark:text-slate-500">Empty option</span>}
      </span>
    </label>
  );
}

/**
 * @param {string} questionType
 * @param {{id:string,text:string}[]} options - options from the primary (first) translation
 * @param {object} value - correctAnswerJson
 * @param {(next: object) => void} onChange
 */
export function CorrectAnswerEditor({ questionType, options = [], value = {}, onChange, disabled }) {
  // Scope the MCQ radio group's `name` to this editor instance so two
  // CorrectAnswerEditors rendered on the same page (e.g. bulk-create) never
  // get grouped together by the browser.
  const uniqueId = useId();

  if (questionType === 'MCQ') {
    // Reads either key gracefully to ensure the radio button reflects the UI state
    const currentSelection = value.key || value.correctOptionId;
    
    return (
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium text-gray-700 dark:text-slate-300">Correct option</legend>
        {options.length === 0 && <EmptyOptionsHint />}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {options.map((opt, i) => (
            <AnswerChoice
              key={opt.id}
              type="radio"
              name={`correct-option-${uniqueId}`}
              disabled={disabled}
              checked={currentSelection === opt.id}
              onChange={() => onChange({ key: opt.id, correctOptionId: opt.id })}
              letter={String.fromCharCode(65 + i)}
              text={opt.text}
            />
          ))}
        </div>
      </fieldset>
    );
  }

  if (questionType === 'MULTI_CORRECT') {
    // Reads either key gracefully to ensure checkboxes reflect the UI state
    const selected = value.keys || value.correctOptionIds || [];
    
    const toggle = (id) => {
      const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
      onChange({ keys: next, correctOptionIds: next });
    };
    
    return (
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium text-gray-700 dark:text-slate-300">
          Correct options <span className="font-normal text-slate-400 dark:text-slate-500">(select all that apply)</span>
        </legend>
        {options.length === 0 && <EmptyOptionsHint />}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {options.map((opt, i) => (
            <AnswerChoice
              key={opt.id}
              type="checkbox"
              disabled={disabled}
              checked={selected.includes(opt.id)}
              onChange={() => toggle(opt.id)}
              letter={String.fromCharCode(65 + i)}
              text={opt.text}
            />
          ))}
        </div>
      </fieldset>
    );
  }

  if (questionType === 'NUMERICAL') {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="Correct value"
          type="number"
          step="any"
          disabled={disabled}
          value={value.value ?? ''}
          onChange={(e) => onChange({ ...value, value: e.target.value === '' ? '' : Number(e.target.value) })}
        />
        <Input
          label="Tolerance (±)"
          type="number"
          step="any"
          min="0"
          disabled={disabled}
          value={value.tolerance ?? ''}
          onChange={(e) => onChange({ ...value, tolerance: e.target.value === '' ? '' : Number(e.target.value) })}
        />
      </div>
    );
  }

  // SUBJECTIVE
  return (
    <Textarea
      label="Model answer (for evaluators)"
      placeholder="Reference answer used when manually grading responses"
      disabled={disabled}
      value={value.modelAnswer || ''}
      onChange={(e) => onChange({ ...value, modelAnswer: e.target.value })}
    />
  );
}