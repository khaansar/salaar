import Link from 'next/link';
import { ArrowUp, Mail } from 'lucide-react';
import { siteConfig } from '../../config/site';
import BrandLogo from '../common/BrandLogo';

const CONTACT_EMAIL = 'clearit.root@gmail.com';

// Static, user-facing routes only (no auth, dynamic or flow pages).
const linkGroups = [
  {
    title: 'Practice',
    links: [
      { label: 'Mock tests', href: '/tests' },
      { label: 'Test series', href: '/test-series' },
      { label: 'Categories', href: '/categories' },
    ],
  },
  {
    title: 'Your space',
    links: [
      { label: 'My learning', href: '/my-learning' },
      { label: 'Analytics', href: '/analytics' },
      { label: 'Test history', href: '/history' },
      { label: 'Profile', href: '/profile' },
      { label: 'Settings', href: '/settings' },
    ],
  },
];

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600';

export default function PublicFooter() {
  return (
    <footer className="relative mt-10 border-t border-zinc-200 bg-zinc-50 transition-colors dark:border-white/5 dark:bg-black/30">
      {/* Brand accent line along the top edge */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-600/70 to-transparent"
      />

      <div className="w-full px-6 pt-12 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-4">
            <Link
              href="/"
              className={`inline-flex items-center rounded-md ${focusRing}`}
              aria-label={`${siteConfig.name} home`}
            >
              <BrandLogo href={null} />
            </Link>
            <p className="mt-4 text-sm font-semibold text-zinc-900 dark:text-white">
              {siteConfig.tagline}
            </p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {siteConfig.description}
            </p>
          </div>

          {/* Link columns */}
          {linkGroups.map((group, i) => (
            <nav
              key={group.title}
              aria-label={group.title}
              className={i === 0 ? 'lg:col-span-2 lg:col-start-6' : 'lg:col-span-2'}
            >
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                {group.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {group.links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className={`group inline-flex items-center rounded-sm text-sm text-zinc-600 transition-colors hover:text-brand-600 dark:text-zinc-400 dark:hover:text-brand-300 ${focusRing}`}
                    >
                      <span
                        aria-hidden="true"
                        className="h-px w-0 bg-brand-600 transition-all duration-200 group-hover:mr-2 group-hover:w-3 dark:bg-brand-400"
                      />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Contact */}
          <div className="sm:col-span-2 lg:col-span-3 lg:col-start-10">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Need help?</h3>
            <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Questions, feedback or a test that needs fixing? Write to us and we&apos;ll get back to you.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className={`group mt-4 inline-flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 transition-colors hover:border-brand-600/50 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-brand-500/50 ${focusRing}`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600/10 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white dark:text-brand-400 dark:group-hover:text-white">
                <Mail size={16} aria-hidden="true" />
              </span>
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                {CONTACT_EMAIL}
              </span>
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-3 border-t border-zinc-200 py-5 text-xs text-zinc-500 dark:border-white/5 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <p>Made for the goals you&apos;re working toward.</p>
            <a
              href="#"
              aria-label="Back to top"
              className={`flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 transition-colors hover:border-brand-600 hover:bg-brand-600 hover:text-white dark:border-white/10 dark:text-zinc-300 dark:hover:border-brand-600 ${focusRing}`}
            >
              <ArrowUp size={15} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}