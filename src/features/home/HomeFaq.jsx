import Link from 'next/link';
import { ArrowRight, ChevronDown, HelpCircle } from 'lucide-react';
import { APP_NAME } from '../../constants/brand';

// TODO: confirm copy, or load from faqService once a public FAQ endpoint exists
const faqs = [
  { q: `What exams does ${APP_NAME} cover?`, a: 'We cover SSC, Banking, Railway, UPSC, State PSC, Teaching and more, with new exams added regularly.' },
  { q: 'Are the mock tests based on the latest exam pattern?', a: 'Yes. Tests follow the latest pattern, marking scheme and difficulty level of each exam.' },
  { q: 'Do you provide detailed solutions?', a: 'Every question comes with a step-by-step solution you can review after the test.' },
  { q: 'Can I access previous year papers?', a: 'Yes. Previous year papers are available alongside mock tests and topic tests.' },
  { q: 'Is there a mobile app available?', a: `You can use ${APP_NAME} on any phone, tablet or desktop browser.` },
];

export default function HomeFaq() {
  return (
    <section className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
            <HelpCircle size={20} className="text-brand-600" /> Frequently Asked Questions
          </h2>
          <p className="mt-1 text-xs text-slate-500">Find answers to common questions about {APP_NAME}.</p>
        </div>
        <Link href="/faqs" className="flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700">
          View All FAQs <ArrowRight size={14} />
        </Link>
      </div>
      <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 dark:border-slate-800">
        {faqs.map((f, i) => (
          <details key={f.q} className="group px-4">
            <summary className="flex cursor-pointer list-none items-center justify-between py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200 [&::-webkit-details-marker]:hidden">
              <span><span className="mr-3 font-semibold text-brand-600">{i + 1}.</span>{f.q}</span>
              <ChevronDown size={16} className="text-slate-400 transition-transform group-open:rotate-180" />
            </summary>
            <p className="pb-4 pl-7 text-xs leading-5 text-slate-500">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
