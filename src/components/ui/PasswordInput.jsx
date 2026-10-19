'use client';

import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const PasswordInput = forwardRef(({ className = '', variant = 'outline', error, label, id, leftIcon, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isFlushed = variant === 'flushed';

  return (
    <div className="w-full">
      {label && !isFlushed && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <div className={`relative flex items-center w-full transition-colors ${
        isFlushed 
          ? 'border-b border-slate-200 dark:border-slate-700 pb-3 focus-within:border-[#4F46E5]' 
          : 'h-10 rounded-[6px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 focus-within:ring-2 focus-within:ring-offset-0 focus-within:ring-[#4F46E5] focus-within:border-transparent'
      } ${error ? (isFlushed ? 'border-red-500' : 'border-red-500 focus-within:ring-red-500') : ''} shadow-sm`}>
        
        {leftIcon && <div className="text-slate-400 dark:text-slate-500 mr-3 shrink-0 flex items-center">{leftIcon}</div>}
        
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          ref={ref}
          className={`flex-1 w-full bg-transparent text-[14px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
          {...props}
        />
        
        <button
          type="button"
          className="ml-3 shrink-0 flex items-center text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 focus:outline-none"
          onClick={() => setShowPassword(!showPassword)}
          tabIndex="-1"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';
