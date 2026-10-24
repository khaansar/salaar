'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  PlayCircle,
  ClipboardList,
  BarChart3,
  UserCog,
  Wrench,
  ChevronDown,
  Search,
  Mail,
  Phone,
  Clock,
  LifeBuoy,
  ArrowUpRight,
  CircleCheck,
} from 'lucide-react';

import BackButton from '@/components/common/BackButton';

/* ------------------------------------------------------------------ */
/* Edit these to match your real support details                       */
/* ------------------------------------------------------------------ */
const CONTACT = {
  email: 'support@example.com',
  phone: '+91 00000 00000',
  hours: 'Mon to Sat, 10:00 AM to 6:00 PM IST',
};

const CATEGORIES = [
  { id: 'getting-started', label: 'Getting started', icon: PlayCircle, blurb: 'Find and start a mock test.' },
  { id: 'taking-tests', label: 'Taking tests', icon: ClipboardList, blurb: 'Resuming, timers and statuses.' },
  { id: 'results', label: 'Results & review', icon: BarChart3, blurb: 'Scores, answers and ranks.' },
  { id: 'account', label: 'Account & security', icon: UserCog, blurb: 'Profile, photo and password.' },
  { id: 'technical', label: 'Technical issues', icon: Wrench, blurb: 'Pages or images not loading.' },
];

const FAQS = [
  {
    id: 'start-test',
    category: 'getting-started',
    q: 'How do I start a mock test?',
    a: 'Open Browse Mock Tests, choose the test you want and start it from its page. Once you begin, the attempt is saved to your Attempt History so you can come back to it later.',
  },
  {
    id: 'find-attempts',
    category: 'getting-started',
    q: 'Where can I see the tests I have already taken?',
    a: 'Attempt History lists every attempt with its date, test name, category and status. From there you can resume an unfinished attempt, open a result, review answers or check ranks.',
  },
  {
    id: 'resume',
    category: 'taking-tests',
    q: 'My connection dropped or I closed the tab during a test. What now?',
    a: 'Open Attempt History and look for the attempt marked In Progress, then choose Resume. If the time limit has passed before you return, the attempt may be marked Expired instead.',
  },
  {
    id: 'statuses',
    category: 'taking-tests',
    q: 'What do Completed, In Progress and Expired mean?',
    a: 'Completed means you submitted the attempt. In Progress means it is still open and can be resumed. Expired means the time ran out before it was submitted. Completed and Expired attempts both have a result and an answer review.',
  },
  {
    id: 'view-result',
    category: 'results',
    q: 'Where do I find my score and result?',
    a: 'In Attempt History, choose View Result on the attempt. Your final score is also shown at the top of the answer review.',
  },
  {
    id: 'review-answers',
    category: 'results',
    q: 'What does Review answers show?',
    a: 'For each question you see the options, the answer you selected, the correct answer, the marks awarded and an explanation when one is available. You can filter by correct, incorrect or unanswered, filter by section, search question text and jump to any question from the question list.',
  },
  {
    id: 'ranks',
    category: 'results',
    q: 'How do I see my rank?',
    a: 'Use the Ranks button on a finished attempt in Attempt History. It opens the leaderboard for that test. Ranks are not shown for attempts that are still in progress.',
  },
  {
    id: 'negative-marks',
    category: 'results',
    q: 'Why did I lose marks on a question?',
    a: 'Each question in the review lists its positive marks, its negative marks and the marks awarded. A wrong answer can carry negative marking depending on the test, while an unanswered question is shown separately.',
  },
  {
    id: 'edit-profile',
    category: 'account',
    q: 'How do I update my name, phone number or target exam?',
    a: 'Go to Account Settings, edit the fields under Personal Details and Exam Target, then choose Save Profile Changes. The button turns on once you change something.',
  },
  {
    id: 'change-email',
    category: 'account',
    q: 'Can I change my email address?',
    a: 'Your account email cannot be changed directly from Account Settings. If you need it changed, contact support using the details on this page.',
  },
  {
    id: 'photo',
    category: 'account',
    q: 'How do I change or delete my profile photo?',
    a: 'In Account Settings, hover over your photo and click the pencil, then choose Change photo or Delete photo. Use a square JPG, PNG or WebP image up to 5 MB.',
  },
  {
    id: 'password',
    category: 'account',
    q: 'How do I change or reset my password?',
    a: 'To change it, open Password and Security in Account Settings and enter your current and new password. A new password needs at least 8 characters with an uppercase letter, a lowercase letter and a number. If you have forgotten your current password, use the Forgot password link.',
  },
  {
    id: 'page-not-loading',
    category: 'technical',
    q: 'A page or my history is not loading.',
    a: 'Check your internet connection and reload the page. If it still fails, try again in a few minutes or open the site in another browser. If the problem continues, send us a screenshot of the error.',
  },
  {
    id: 'images-missing',
    category: 'technical',
    q: 'Question images or diagrams are not showing.',
    a: 'Images load separately from the question text, so a slow connection or a content blocker can stop them. Reload the page, pause any ad or content blocker for this site and try again.',
  },
];

const QUICK_LINKS = [
  { href: '/history', label: 'Attempt History', hint: 'Resume, results and ranks' },
  { href: '/settings', label: 'Account Settings', hint: 'Profile, photo and password' },
  { href: '/tests', label: 'Browse Mock Tests', hint: 'Start a new attempt' },
];

/* ---------- Theme tokens (same pairs as the settings page) ---------- */
const T = {
  card: 'rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900',
  inset: 'rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40',
  divider: 'border-slate-200 dark:border-slate-800',
  text: 'text-slate-900 dark:text-slate-50',
  body: 'text-slate-700 dark:text-slate-300',
  muted: 'text-slate-500 dark:text-slate-400',
  focus:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
};

const INPUT =
  'w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:placeholder:text-slate-500';

function FaqItem({ item, open, onToggle }) {
  const panelId = `faq-panel-${item.id}`;
  return (
    <li>
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className={`flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-semibold transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 sm:px-6 ${T.text} ${T.focus} focus-visible:ring-inset focus-visible:ring-offset-0`}
        >
          <span>{item.q}</span>
          <ChevronDown
            size={18}
            aria-hidden
            className={`shrink-0 transition-transform ${T.muted} ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </h3>
      {open && (
        <div id={panelId} role="region" className={`px-5 pb-5 text-sm leading-6 sm:px-6 ${T.body}`}>
          <p className="max-w-[70ch]">{item.a}</p>
        </div>
      )}
    </li>
  );
}

export default function HelpSupportPage() {
  const [category, setCategory] = useState('ALL');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(null);

  const counts = useMemo(() => {
    const c = {};
    FAQS.forEach((f) => { c[f.category] = (c[f.category] || 0) + 1; });
    return c;
  }, []);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return FAQS.filter((f) => {
      if (category !== 'ALL' && f.category !== category) return false;
      if (term && !`${f.q} ${f.a}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [category, query]);

  const pickCategory = (id) => {
    setCategory(id);
    setQuery('');
    setOpenId(null);
    setTimeout(() => {
      document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const pill = (active) =>
    `inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${T.focus} ${
      active
        ? 'bg-brand-600 text-white dark:bg-brand-500 dark:text-slate-950'
        : `${T.body} hover:bg-slate-100 dark:hover:bg-slate-800`
    }`;

  return (
    <div className="mx-auto w-full max-w-[1280px] px-6 pb-10 pt-2 sm:px-8 lg:px-10">
      {/* Page Header */}
      <div className="mb-6">
        <BackButton
          fallbackHref="/"
          className={`mb-2 inline-flex items-center gap-1.5 rounded-md py-1 pr-1 text-sm font-semibold text-slate-600 transition-colors hover:text-brand-700 hover:underline dark:text-slate-300 dark:hover:text-brand-300 ${T.focus}`}
          iconSize={14}
        />
        <h1 className={`text-2xl font-bold tracking-tight sm:text-3xl ${T.text}`}>Help &amp; Support</h1>
        <p className={`mt-1.5 text-sm ${T.muted}`}>
          Answers to common questions about tests, results and your account, and how to reach us.
        </p>
      </div>

      {/* Topic cards */}
      <section aria-label="Help topics" className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {CATEGORIES.map(({ id, label, icon: Icon, blurb }) => (
          <button
            key={id}
            type="button"
            onClick={() => pickCategory(id)}
            className={`${T.card} group flex flex-col items-start gap-3 p-4 text-left transition hover:border-brand-300 hover:shadow-sm dark:hover:border-brand-500/50 ${T.focus}`}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
              <Icon size={20} aria-hidden />
            </span>
            <span>
              <span className={`block text-sm font-semibold ${T.text}`}>{label}</span>
              <span className={`mt-0.5 block text-xs leading-5 ${T.muted}`}>{blurb}</span>
            </span>
            <span className={`mt-auto text-xs font-medium ${T.muted}`}>{counts[id] || 0} articles</span>
          </button>
        ))}
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:gap-8">
        {/* ---------- FAQ ---------- */}
        <section id="faq" aria-labelledby="faq-heading" className="min-w-0 scroll-mt-6 space-y-4">
          <div className={`${T.card} space-y-4 p-4 sm:p-5`}>
            <div className="flex items-baseline justify-between gap-3">
              <h2 id="faq-heading" className={`text-base font-semibold ${T.text}`}>Frequently asked questions</h2>
              <p className={`text-sm ${T.muted}`} aria-live="polite">
                {visible.length} {visible.length === 1 ? 'result' : 'results'}
              </p>
            </div>

            <div className="relative">
              <Search size={16} aria-hidden className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 ${T.muted}`} />
              <label htmlFor="faq-search" className="sr-only">Search help articles</label>
              <input
                id="faq-search"
                type="search"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setOpenId(null); }}
                placeholder="Search for answers, e.g. resume, password, rank"
                className={INPUT}
              />
            </div>

            <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by topic">
              <button type="button" aria-pressed={category === 'ALL'} onClick={() => setCategory('ALL')} className={pill(category === 'ALL')}>
                All
              </button>
              {CATEGORIES.map(({ id, label }) => (
                <button key={id} type="button" aria-pressed={category === id} onClick={() => setCategory(id)} className={pill(category === id)}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <div className={`${T.card} p-10 text-center`}>
              <p className={`font-semibold ${T.text}`}>No articles match your search</p>
              <p className={`mx-auto mt-1 max-w-md text-sm ${T.muted}`}>
                Try different words or clear the filters. If you still cannot find what you need, contact support.
              </p>
              <button
                type="button"
                onClick={() => { setQuery(''); setCategory('ALL'); }}
                className={`mt-4 inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 ${T.body} ${T.focus}`}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <ul className={`${T.card} divide-y divide-slate-200 overflow-hidden dark:divide-slate-800`}>
              {visible.map((item) => (
                <FaqItem
                  key={item.id}
                  item={item}
                  open={openId === item.id}
                  onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                />
              ))}
            </ul>
          )}
        </section>

        {/* ---------- Sidebar ---------- */}
        <aside className="space-y-4 lg:sticky lg:top-6">
          <section id="contact" className={`${T.card} scroll-mt-6 p-5 sm:p-6`}>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                <LifeBuoy size={20} aria-hidden />
              </span>
              <div>
                <h2 className={`text-base font-semibold ${T.text}`}>Still need help?</h2>
                <p className={`text-sm ${T.muted}`}>Our team is happy to assist.</p>
              </div>
            </div>

            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <a href={`mailto:${CONTACT.email}`} className={`flex items-center gap-3 rounded-xl ${T.inset} p-3 transition-colors hover:border-brand-300 dark:hover:border-brand-500/50 ${T.focus}`}>
                  <Mail size={16} aria-hidden className="shrink-0 text-brand-700 dark:text-brand-300" />
                  <span className="min-w-0">
                    <span className={`block text-xs ${T.muted}`}>Email</span>
                    <span className={`block truncate font-semibold ${T.text}`}>{CONTACT.email}</span>
                  </span>
                </a>
              </li>
              <li>
                <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} className={`flex items-center gap-3 rounded-xl ${T.inset} p-3 transition-colors hover:border-brand-300 dark:hover:border-brand-500/50 ${T.focus}`}>
                  <Phone size={16} aria-hidden className="shrink-0 text-brand-700 dark:text-brand-300" />
                  <span className="min-w-0">
                    <span className={`block text-xs ${T.muted}`}>Phone</span>
                    <span className={`block truncate font-semibold ${T.text}`}>{CONTACT.phone}</span>
                  </span>
                </a>
              </li>
              <li className={`flex items-center gap-3 px-1 ${T.body}`}>
                <Clock size={16} aria-hidden className={`shrink-0 ${T.muted}`} />
                <span>{CONTACT.hours}</span>
              </li>
            </ul>

            <div className={`mt-5 border-t pt-4 ${T.divider}`}>
              <p className={`text-sm font-semibold ${T.text}`}>To help us reply faster, include</p>
              <ul className={`mt-2 space-y-1.5 text-sm ${T.body}`}>
                {[
                  'The email you registered with',
                  'The test name and attempt date',
                  'A screenshot of any error',
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2">
                    <CircleCheck size={15} aria-hidden className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <nav aria-label="Quick links" className={`${T.card} p-2`}>
            <p className={`px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide ${T.muted}`}>Quick links</p>
            <ul>
              {QUICK_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${T.focus}`}
                  >
                    <span>
                      <span className={`block text-sm font-medium ${T.text}`}>{l.label}</span>
                      <span className={`block text-xs ${T.muted}`}>{l.hint}</span>
                    </span>
                    <ArrowUpRight size={16} aria-hidden className={T.muted} />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
    </div>
  );
}