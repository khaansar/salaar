'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Bookmark, Clock, Award, Rocket } from 'lucide-react';
import { useRequireAuth } from '../../hooks/useRequireAuth';

export default function StartPracticing({ tests = [] }) {
  const router = useRouter();
  const requireAuth = useRequireAuth();

  const handleStartTest = requireAuth((testId) => {
    // Step 5: Will wire to attempt-service start
    // For now, mock navigate to attempt screen
    router.push(`/attempt/${testId}`);
  });

  const handleBookmark = requireAuth((testId) => {
    // TODO: implement bookmarking
    console.log('Bookmarking test', testId);
    alert(`Bookmarked test ${testId}!`);
  });

  if (!tests || tests.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Rocket className="text-indigo-600 dark:text-indigo-400" size={24} />
            Start Practicing
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Handpicked mock tests to get you started.</p>
        </div>
        <Link href="/tests" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1">
          View All <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tests.map((test) => (
          <div
            key={test.id}
            className="flex flex-col bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded">
                {test.categoryName}
              </span>
              <button 
                onClick={() => handleBookmark(test.id)}
                className="text-slate-400 hover:text-indigo-600 transition-colors"
                aria-label="Bookmark test"
              >
                <Bookmark size={18} />
              </button>
            </div>
            
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 line-clamp-2">
              {test.title}
            </h3>
            
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 mb-6">
              <span className="flex items-center gap-1.5"><Clock size={14} /> {test.durationMinutes > 60 ? `${test.durationMinutes / 60} hrs` : `${test.durationMinutes} mins`}</span>
              <span className="flex items-center gap-1.5"><Award size={14} /> {test.totalMarks} marks</span>
            </div>

            <button
              onClick={() => handleStartTest(test.id)}
              className="mt-auto w-full flex items-center justify-center py-2.5 bg-[#5e43f3] hover:bg-[#4d36c6] text-white font-medium rounded-xl transition-colors text-sm"
            >
              Start Test <ArrowRight className="ml-1.5 w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
