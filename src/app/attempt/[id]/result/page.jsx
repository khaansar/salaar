'use client';
import Link from 'next/link';

export default function ResultPage({ params }) {
  // Await params if needed in Next 15, but this is a client component so React.use(params) is technically needed. 
  // We'll just read from url for a placeholder.
  
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Test Submitted Successfully!</h1>
        <p className="text-slate-600 mb-8">
          Your answers have been securely recorded. The final score is being calculated by the server.
        </p>
        
        <Link 
          href="/" 
          className="inline-flex h-11 px-6 bg-slate-900 hover:bg-indigo-600 text-white font-semibold rounded-md items-center justify-center transition-colors w-full shadow-sm"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
