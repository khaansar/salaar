import Link from 'next/link';
import { ArrowLeft, Hourglass } from 'lucide-react';

export default function ComingSoon({
  title = 'Coming soon',
  description = 'This section is still being built. Check back shortly.',
}) {
  return (
    <div className="mx-auto max-w-lg py-16 text-center sm:py-24">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
        <Hourglass size={28} />
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
        {title}
      </h1>

      <p className="mt-3 text-slate-600 dark:text-slate-400">
        {description}
      </p>

      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
      >
        <ArrowLeft size={16} />
        Back to home
      </Link>
    </div>
  );
}
