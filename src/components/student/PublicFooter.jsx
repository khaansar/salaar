import Link from 'next/link';
import { ArrowUpRight, Mail } from 'lucide-react';
import { siteConfig } from '../../config/site';

const linkGroups = [
  {
    title: 'Explore',
    links: [
      ['Mock Tests', '/tests'],
      ['Test Series', '/test-series'],
      ['Previous Year Papers', '/previous-year-papers'],
      ['Categories', '/categories'],
    ],
  },
  {
    title: 'Your progress',
    links: [
      ['Analytics', '/analytics'],
      ['Test History', '/history'],
      ['My Profile', '/profile'],
      ['Pricing', '/pricing'],
    ],
  },
  {
    title: 'Support',
    links: [
      ['FAQs', '/faqs'],
      ['Contact us', 'mailto:clearit.root@gmail.com'],
    ],
  },
];

function BrandMark() {
  return (
    <svg viewBox="0 0 32 20" className="h-5 w-8" aria-hidden="true">
      <polygon points="0,20 8,2 16,14 24,2 32,20 26,20 24,13 16,20 8,13 6,20" fill="currentColor" />
    </svg>
  );
}

export default function PublicFooter() {
  return (
    <footer className="relative overflow-hidden bg-white text-slate-900 transition-colors dark:bg-[#0b1020] dark:text-white">
      <div className="pointer-events-none absolute -right-24 -top-40 h-96 w-96 rounded-full bg-brand-600/10 blur-3xl dark:bg-brand-600/15" />
      <div className="pointer-events-none absolute -bottom-48 left-1/4 h-80 w-80 rounded-full bg-indigo-500/5 blur-3xl dark:bg-indigo-500/10" />

      <div className="relative mx-auto max-w-7xl px-6 pb-7 pt-14 sm:px-8 lg:px-10 lg:pt-16">
        <div className="mb-12 flex flex-col gap-5 border-b border-slate-200 pb-9 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-700 dark:text-violet-300">A clearer path to your goal</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Your next milestone starts here.</h2>
          </div>
          <Link href="/tests" className="inline-flex w-fit items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700">
            Explore mock tests <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-5 md:gap-10">
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 text-violet-700 dark:text-violet-300" aria-label={`${siteConfig.name} home`}>
              <BrandMark />
              <span className="text-lg font-extrabold uppercase tracking-[0.09em] text-slate-900 dark:text-white">{siteConfig.name}</span>
            </Link>
            <p className="mt-3 text-sm font-medium text-violet-700 dark:text-violet-300">{siteConfig.tagline}</p>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-400">
              {siteConfig.description}
            </p>
            <a href="mailto:clearit.root@gmail.com" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-700 transition hover:text-brand-700 dark:text-slate-300 dark:hover:text-white">
              <Mail size={16} className="text-violet-700 dark:text-violet-300" /> clearit.root@gmail.com
            </a>
          </div>

          {linkGroups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-800 dark:text-slate-200">{group.title}</h3>
              <ul className="mt-4 space-y-3">
                {group.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-slate-600 transition hover:text-brand-700 dark:text-slate-400 dark:hover:text-white">{label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-slate-200 pt-6 text-xs text-slate-500 dark:border-white/10 dark:text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <p>Made for the goals you&apos;re working toward.</p>
        </div>
      </div>
    </footer>
  );
}
