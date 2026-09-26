'use client';

import React from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

/**
 * @param {string} questionType
 * @param {{id:string,text:string}[]} options - options from the primary (first) translation
 * @param {object} value - correctAnswerJson
 * @param {(next: object) => void} onChange
 */
export function CorrectAnswerEditor({ questionType, options = [], value = {}, onChange, disabled }) {
  if (questionType === 'MCQ') {
    // Reads either key gracefully to ensure the radio button reflects the UI state
    const currentSelection = value.key || value.correctOptionId;
    
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Correct option</p>
        {options.length === 0 && <p className="text-xs text-slate-400">Add options above first.</p>}
        <div className="space-y-1.5">
          {options.map((opt, i) => (
            <label key={opt.id} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="correct-option"
                disabled={disabled}
                checked={currentSelection === opt.id}
                onChange={() => onChange({ key: opt.id, correctOptionId: opt.id })}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-medium text-slate-400 w-5">{String.fromCharCode(65 + i)}</span>
              <span className="truncate">{opt.text || <span className="italic text-slate-400">Empty option</span>}</span>
            </label>
          ))}
        </div>
      </div>
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
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Correct options</p>
        {options.length === 0 && <p className="text-xs text-slate-400">Add options above first.</p>}
        <div className="space-y-1.5">
          {options.map((opt, i) => (
            <label key={opt.id} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                disabled={disabled}
                checked={selected.includes(opt.id)}
                onChange={() => toggle(opt.id)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-medium text-slate-400 w-5">{String.fromCharCode(65 + i)}</span>
              <span className="truncate">{opt.text || <span className="italic text-slate-400">Empty option</span>}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (questionType === 'NUMERICAL') {
    return (
      <div className="grid grid-cols-2 gap-3">
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