'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { siteConfig } from '../../config/site';
import { faqApi } from '../../services/faqService';

const FALLBACK_FAQS = [
  {
    id: 'f1',
    question: `What is ${siteConfig.name}?`,
    answer: `${siteConfig.name} is a comprehensive mock test and exam prep platform offering realistic computer-based tests, official previous year papers, AI-driven performance insights, and sectional practice for competitive examinations.`,
  },
  {
    id: 'f2',
    question: 'How do the mock tests work?',
    answer: 'Our mock tests emulate the exact exam pattern, interface, countdown timers, and negative marking rules of actual examinations. After submission, you receive instant scorecards, topic-level proficiency breakdowns, and detailed step-by-step solutions.',
  },
  {
    id: 'f3',
    question: 'Are previous year question papers included?',
    answer: 'Yes! We provide extensive collections of official past year papers solved with verified answer keys and detailed explanations to help you understand question patterns.',
  },
  {
    id: 'f4',
    question: 'How does AI-powered performance analysis help me?',
    answer: 'Our analytics engine highlights your accuracy trends, time spent per question, question palette behavior, and subject weaknesses, giving you clear recommendations on where to focus your revision.',
  },
  {
    id: 'f5',
    question: 'Can I practice on mobile or tablet?',
    answer: 'Yes, the platform is fully responsive across desktops, laptops, tablets, and mobile devices. Your test progress and streak sync seamlessly across all your devices.',
  },
  {
    id: 'f6',
    question: 'How do I start practicing?',
    answer: 'Browse the test series catalog on the home page, select your target exam category, and start attempting free mock tests right away. You can track your daily streak and test history on your dashboard.',
  },
];

export default function HomeFaq({ targetId = null, title = 'Frequently Asked Questions', subtitle }) {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    faqApi.list(targetId)
      .then((items) => {
        if (!active) return;
        const orderedFaqs = (Array.isArray(items) ? items : [])
          .sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));
        setFaqs(orderedFaqs.length ? orderedFaqs : (targetId == null ? FALLBACK_FAQS : []));
      })
      .catch(() => {
        if (active) {
          setFaqs(targetId == null ? FALLBACK_FAQS : []);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [targetId]);

  const displayFaqs = faqs.length ? faqs : (!loading && targetId == null ? FALLBACK_FAQS : []);

  const toggleFaq = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  if (!loading && !displayFaqs.length) {
    return null;
  }

  return (
    <section className="relative my-8 sm:my-12">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl dark:text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
            {subtitle}
          </p>
        )}
      </div>

      <div className="w-full space-y-2">
        {displayFaqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={faq.id ?? faq.question ?? i} className="w-full">
              <button
                type="button"
                onClick={() => toggleFaq(i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 rounded-[2px] bg-slate-100 px-6 py-5 text-left text-lg font-medium text-slate-900 transition-colors hover:bg-slate-200/90 sm:py-6 sm:text-xl lg:text-2xl dark:bg-[#2d2d2d] dark:text-white dark:hover:bg-[#414141]"
              >
                <span className="flex-1 leading-snug">{faq.question}</span>
                <Plus
                  size={28}
                  strokeWidth={1.5}
                  className={`shrink-0 text-slate-800 transition-transform duration-300 dark:text-white ${
                    isOpen ? 'rotate-45' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              {isOpen && (
                <div className="mt-0.5 rounded-[2px] bg-slate-100 p-6 text-base leading-relaxed text-slate-700 sm:p-7 sm:text-lg lg:text-xl dark:bg-[#2d2d2d] dark:text-zinc-200">
                  <p className="whitespace-pre-wrap">{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
