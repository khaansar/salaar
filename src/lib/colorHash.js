const PALETTE = [
  { bg: 'bg-indigo-50 dark:bg-indigo-500/15', text: 'text-indigo-600 dark:text-indigo-300' },
  { bg: 'bg-emerald-50 dark:bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-300' },
  { bg: 'bg-amber-50 dark:bg-amber-500/15', text: 'text-amber-600 dark:text-amber-300' },
  { bg: 'bg-rose-50 dark:bg-rose-500/15', text: 'text-rose-600 dark:text-rose-300' },
  { bg: 'bg-violet-50 dark:bg-violet-500/15', text: 'text-violet-600 dark:text-violet-300' },
  { bg: 'bg-cyan-50 dark:bg-cyan-500/15', text: 'text-cyan-600 dark:text-cyan-300' },
  { bg: 'bg-orange-50 dark:bg-orange-500/15', text: 'text-orange-600 dark:text-orange-300' },
  { bg: 'bg-teal-50 dark:bg-teal-500/15', text: 'text-teal-600 dark:text-teal-300' },
];

export function colorForKey(key) {
  const str = String(key || '');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}