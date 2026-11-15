import { AlertCircle } from 'lucide-react';

/** Inline, form-level error message announced to screen readers. */
export function FormAlert({ children, className = '' }) {
  if (!children) return null;

  return (
    <div
      role="alert"
      className={`flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 ${className}`}
    >
      <AlertCircle size={18} className="mt-px shrink-0" aria-hidden="true" />
      <span className="font-medium leading-5">{children}</span>
    </div>
  );
}
