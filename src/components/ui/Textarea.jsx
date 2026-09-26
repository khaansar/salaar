import React, { forwardRef } from 'react';

export const Textarea = forwardRef(({ className = '', error, label, id, rows = 4, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div
        className={`relative flex w-full rounded-[6px] border bg-white px-3 py-2 transition-colors ${
          error ? 'border-red-500 focus-within:ring-red-500' : 'border-slate-300 focus-within:ring-[#4F46E5]'
        } focus-within:ring-2 focus-within:ring-offset-0 focus-within:border-transparent shadow-sm`}
      >
        <textarea
          id={id}
          ref={ref}
          rows={rows}
          className={`flex-1 w-full bg-transparent text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none resize-y disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';
