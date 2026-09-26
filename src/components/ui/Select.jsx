import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = forwardRef(
  ({ className = '', error, label, id, placeholder, children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <div
          className={`relative flex items-center w-full h-10 rounded-[6px] border bg-white transition-colors ${
            error ? 'border-red-500 focus-within:ring-red-500' : 'border-slate-300 focus-within:ring-[#4F46E5]'
          } focus-within:ring-2 focus-within:ring-offset-0 focus-within:border-transparent shadow-sm`}
        >
          <select
            id={id}
            ref={ref}
            className={`flex-1 w-full h-full bg-transparent px-3 text-[14px] text-slate-900 focus:outline-none appearance-none disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {children}
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute right-3 text-slate-400" />
        </div>
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
