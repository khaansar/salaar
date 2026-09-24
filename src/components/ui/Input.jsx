import React, { forwardRef } from 'react';

export const Input = forwardRef(({ className = '', variant = 'outline', error, label, id, leftIcon, rightIcon, ...props }, ref) => {
  const isFlushed = variant === 'flushed';
  
  return (
    <div className="w-full">
      {label && !isFlushed && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      
      <div className={`relative flex items-center w-full transition-colors ${
        isFlushed 
          ? 'border-b border-slate-200 pb-3 focus-within:border-[#4F46E5]' 
          : 'h-10 rounded-[6px] border border-slate-300 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-offset-0 focus-within:ring-[#4F46E5] focus-within:border-transparent'
      } ${error ? (isFlushed ? 'border-red-500' : 'border-red-500 focus-within:ring-red-500') : ''} shadow-sm`}>
        
        {leftIcon && <div className="text-slate-400 mr-3 shrink-0 flex items-center">{leftIcon}</div>}
        
        <input
          id={id}
          ref={ref}
          className={`flex-1 w-full bg-transparent text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
          {...props}
        />
        
        {rightIcon && <div className="text-gray-400 ml-3 shrink-0 flex items-center">{rightIcon}</div>}
      </div>
      
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
