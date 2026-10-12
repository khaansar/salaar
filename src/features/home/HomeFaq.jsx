'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
import { siteConfig } from '../../config/site';
import { faqApi } from '../../services/faqService';

export default function HomeFaq({ targetId = null, title = 'Frequently Asked Questions', subtitle }) {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setFailed(false);

    faqApi.list(targetId)
      .then((items) => {
        if (!active) return;
        const orderedFaqs = (Array.isArray(items) ? items : [])
          .sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));
        setFaqs(targetId == null ? orderedFaqs.slice(-4) : orderedFaqs);
      })
      .catch(() => {
        if (active) {
          setFaqs([]);
          setFailed(true);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [targetId]);

  return (
    <section className="relative mb-6 overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-white via-[#faf9ff] to-indigo-50/80 p-5 shadow-sm sm:p-8 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30">
      <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-500/10" />
      <div className="relative mb-5 flex items-start justify-between gap-4">
        <div>
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-white/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-600 dark:border-indigo-500/20 dark:bg-slate-900/70 dark:text-indigo-300"><Sparkles size={12} /> Quick answers</span>
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
            <HelpCircle size={20} className="text-brand-600" /> {title}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle || `A few helpful answers about ${siteConfig.name}.`}</p>
        </div>
      </div>
      {faqs.length ? <div className="relative w-full space-y-3">
        {faqs.map((faq, i) => (
          <details key={faq.id ?? faq.question} className="group overflow-hidden rounded-2xl border border-indigo-100/90 bg-white/80 shadow-[0_2px_12px_rgba(79,70,229,0.04)] transition duration-200 open:border-indigo-200 open:bg-white open:shadow-[0_12px_32px_rgba(79,70,229,0.09)] hover:border-indigo-200 dark:border-slate-700 dark:bg-slate-900/70 dark:open:border-indigo-500/40 dark:open:bg-slate-900">
            <summary className="flex cursor-pointer list-none items-center gap-4 px-4 py-4 text-sm font-semibold leading-6 text-slate-800 sm:px-5 dark:text-slate-100 [&::-webkit-details-marker]:hidden">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-violet-100 text-xs font-bold tracking-wide text-indigo-600 dark:from-indigo-500/15 dark:to-violet-500/10 dark:text-indigo-300">{String(i + 1).padStart(2, '0')}</span>
              <span className="flex-1">{faq.question}</span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 text-indigo-500 transition group-open:rotate-180 group-open:bg-indigo-50 dark:bg-slate-800 dark:text-indigo-300 dark:group-open:bg-indigo-500/10"><ChevronDown size={16} /></span>
            </summary>
            <div className="ml-[4.25rem] mr-5 border-t border-indigo-50 pb-5 pt-3 text-sm leading-7 text-slate-600 dark:border-slate-800 dark:text-slate-300">
              <p className="whitespace-pre-wrap">{faq.answer}</p>
            </div>
          </details>
        ))}
      </div> : <p className="relative rounded-2xl border border-dashed border-indigo-200 bg-white/70 px-4 py-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">{loading ? 'Loading FAQs…' : failed ? 'FAQs are temporarily unavailable.' : 'No FAQs are available yet.'}</p>}
    </section>
  );
}
