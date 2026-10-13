'use client';

import { useEffect, useState } from 'react';
import StudentShell from '../../components/student/StudentShell';
import apiClient from '../../lib/apiClient';
import Link from 'next/link';
import { Trophy } from 'lucide-react';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [testSlugs, setTestSlugs] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const res = await apiClient.get('/attempts-api/history?page=1&perPage=50');
        const attempts = Array.isArray(res) ? res : [];
        setHistory(attempts);

        const testIds = [...new Set(attempts.map((attempt) => attempt.testId).filter(Boolean))];
        const resolvedSlugs = await Promise.all(testIds.map(async (testId) => {
          try {
            const test = await apiClient.get(`/tests-api/catalog/mock-tests/${encodeURIComponent(testId)}/structure`);
            const slug = test?.slug || test?.testSlug;
            return slug ? [testId, slug] : null;
          } catch {
            return null;
          }
        }));

        setTestSlugs(Object.fromEntries(resolvedSlugs.filter(Boolean)));
      } catch (err) {
        setError(err.message || 'Failed to load history');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUBMITTED': return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Completed</span>;
      case 'IN_PROGRESS': return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">In Progress</span>;
      case 'EXPIRED': return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Expired</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{status}</span>;
    }
  };

  return (
    <StudentShell>
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Attempt History</h1></div>
        {isLoading ? <div className="flex justify-center items-center h-48 text-slate-500">Loading history...</div> : error ? <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div> : history.length === 0 ? <div className="bg-white border border-slate-200 rounded-lg p-8 text-center shadow-sm"><h3 className="text-lg font-medium text-slate-900 mb-2">No attempts yet</h3><p className="text-slate-500 mb-6">You haven&apos;t taken any tests yet. Start a mock test to see your history here.</p><Link href="/tests" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">Browse Mock Tests</Link></div> : (
          <div className="bg-white shadow-sm border border-slate-200 rounded-lg overflow-hidden dark:border-slate-800 dark:bg-slate-900"><table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800"><thead className="bg-slate-50 dark:bg-slate-950/60"><tr><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Mock Test</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th><th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th></tr></thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">{history.map((attempt) => { const testSlug = attempt.testSlug || attempt.slug || attempt.test?.slug || testSlugs[attempt.testId]; return <tr key={attempt.attemptId} className="bg-white transition-colors hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/60"><td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">{formatDate(attempt.startedAt)}</td><td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-semibold text-slate-900 dark:text-white">{attempt.testName || 'Unknown Test'}</div><div className="text-xs text-slate-500">{attempt.categoryName || 'Unknown Category'}</div></td><td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(attempt.status)}</td><td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><div className="flex items-center justify-end gap-2">{testSlug && <Link href={`/leaderboard/${encodeURIComponent(testSlug)}`} className="inline-flex items-center gap-1 rounded bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300"><Trophy size={12} />Ranks</Link>}{attempt.status === 'IN_PROGRESS' ? <Link href={`/attempt/${attempt.attemptId}`} className="rounded bg-indigo-50 px-3 py-1.5 text-indigo-600 hover:text-indigo-900 dark:bg-indigo-500/10 dark:text-indigo-300">Resume</Link> : <Link href={`/attempt/${attempt.attemptId}/result`} className="rounded bg-slate-100 px-3 py-1.5 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300">View Result</Link>}</div></td></tr>; })}</tbody></table></div>
        )}
      </div>
    </StudentShell>
  );
}
