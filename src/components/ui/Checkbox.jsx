import React, { forwardRef } from 'react';

export const Checkbox = forwardRef(({ className = '', label, id, error, ...props }, ref) => {
  return (
    <div className="flex items-start">
      <div className="flex h-5 items-center">
        <input
          id={id}
          type="checkbox"
          ref={ref}
          className={`h-4 w-4 rounded border-slate-300 text-[#4F46E5] focus:ring-[#4F46E5] transition-colors cursor-pointer ${className}`}
          {...props}
        />
      </div>
      {label && (
        <div className="ml-2.5 text-sm">
          <label htmlFor={id} className="font-medium text-gray-700 cursor-pointer select-none">
            {label}
          </label>
          {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';
