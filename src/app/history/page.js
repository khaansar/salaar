'use client';

import { useEffect, useState } from 'react';
import StudentShell from '../../components/student/StudentShell';
import apiClient from '../../lib/apiClient';
import Link from 'next/link';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        // The API returns paginated response, apiClient unwraps data.data implicitly 
        // wait, apiClient unwraps response.data.data. The paginated data is usually in response.data.data.
        // Let's inspect what apiClient returns: it returns response.data.data
        const res = await apiClient.get('/attempts-api/history?page=1&perPage=50');
        // Since it's paginated, usually the content array is returned or the whole paginated object
        // If the backend returned ApiResponse.paginated, the content is in data.data or we might need to handle pagination.
        // Let's assume res is the array if it was unwrapped, or res.content if Spring Boot pagination is used.
        const items = Array.isArray(res) ? res : res.content || [];
        setHistory(items);
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
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Completed</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">In Progress</span>;
      case 'EXPIRED':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Expired</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{status}</span>;
    }
  };

  return (
    <StudentShell>
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Attempt History</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-48 text-slate-500">Loading history...</div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
        ) : history.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-8 text-center shadow-sm">
            <h3 className="text-lg font-medium text-slate-900 mb-2">No attempts yet</h3>
            <p className="text-slate-500 mb-6">You haven&apos;t taken any tests yet. Start a mock test to see your history here.</p>
            <Link href="/tests" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Browse Mock Tests
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow-sm border border-slate-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Mock Test</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Score</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {history.map((attempt) => (
                  <tr key={attempt.attemptId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {formatDate(attempt.startedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900">{attempt.testName || 'Unknown Test'}</div>
                      <div className="text-xs text-slate-500">{attempt.categoryName || 'Unknown Category'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(attempt.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                      {attempt.finalScore !== null ? attempt.finalScore : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {attempt.status === 'IN_PROGRESS' ? (
                        <Link href={`/attempt/${attempt.attemptId}`} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded">
                          Resume
                        </Link>
                      ) : (
                        <Link href={`/attempt/${attempt.attemptId}/result`} className="text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded">
                          View Result
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </StudentShell>
  );
}
