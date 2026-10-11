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
      {faqs.length ? <div className="relative grid items-start gap-3 md:grid-cols-2">
        {faqs.map((faq, i) => (
          <details key={faq.id ?? faq.question} className="group rounded-2xl border border-slate-200/80 bg-white/90 px-4 transition hover:border-indigo-200 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:hover:border-indigo-500/40">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-3 py-4 text-sm font-semibold leading-5 text-slate-800 dark:text-slate-100 [&::-webkit-details-marker]:hidden">
              <span className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-[11px] font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">{String(i + 1).padStart(2, '0')}</span>{faq.question}</span>
              <ChevronDown size={16} className="mt-1 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
            </summary>
            <p className="pb-4 pl-9 text-sm leading-6 text-slate-600 dark:text-slate-300">{faq.answer}</p>
          </details>
        ))}
      </div> : <p className="relative rounded-2xl border border-dashed border-indigo-200 bg-white/70 px-4 py-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">{loading ? 'Loading FAQs…' : failed ? 'FAQs are temporarily unavailable.' : 'No FAQs are available yet.'}</p>}
    </section>
  );
}
