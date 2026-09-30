import { cookies } from 'next/headers';
import { fetchWithCache } from '@/lib/cache';
import InstructionsClient from './InstructionsClient';

export const metadata = {
  title: 'Test Instructions - PrepHub',
};

export default async function InstructionsPage({ params }) {
  const { slug } = await params;
  
  let testDetails = null;
  let hasError = false;

  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(slug);

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('ACCESS_TOKEN')?.value;

    const endpoint = isUuid
      ? `/tests-api/catalog/mock-tests/${slug}/structure`
      : `/tests-api/catalog/mock-tests/slug/${slug}/structure`;

    const res = await fetchWithCache(
      endpoint,
      {
        revalidate: 0, // No cache for authenticated user requests
        headers: token ? { Cookie: `ACCESS_TOKEN=${token}` } : {},
      }
    );
    
    testDetails = res;
  } catch (error) {
    console.error('Failed to load test structure for instructions on server:', error.message);
    hasError = true;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-6">
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">General Instructions</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
        {!hasError && testDetails ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
              {testDetails.title || 'Mock Test'}
            </h2>
            <div className="flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                Duration: <span className="text-slate-900 dark:text-slate-200 font-bold">{testDetails.durationMinutes || 180} mins</span>
              </div>
              <div>
                Total Questions: <span className="text-slate-900 dark:text-slate-200 font-bold">
                  {testDetails.sections?.reduce((acc, sec) => acc + (sec.questions?.length || 0), 0) || 0}
                </span>
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
              
              {testDetails.instructions && (
                <div className="mb-8 p-6 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Test Specific Instructions</h3>
                  <div className="whitespace-pre-wrap">{testDetails.instructions}</div>
                </div>
              )}

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">General Platform Rules:</h3>
              <ul className="list-disc pl-5 space-y-3 mb-8">
                <li>This test contains multiple sections. You can navigate between sections using the top navigation bar.</li>
                <li>The clock will be set at the server. The countdown timer in the top right corner will display the remaining time available for you to complete the examination.</li>
                <li>When the timer reaches zero, the examination will end by itself. You will not be required to end or submit your examination.</li>
                <li>Do not press F5 or refresh the page during the exam.</li>
                <li><strong>Warning:</strong> Navigating away from the fullscreen window may result in automatic submission of the test.</li>
              </ul>
              
              <h4 className="font-bold text-slate-900 dark:text-white mb-3">Answering a Question:</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>To select your answer for a multiple-choice question, click on the button of one of the options.</li>
                <li>To deselect your chosen answer, click on the button of the chosen option again or click on the <em>Clear Response</em> button.</li>
                <li>To change your chosen answer, click on the button of another option.</li>
                <li>To save your answer, you MUST click on the <strong>Save & Next</strong> button.</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-6 rounded-xl text-center">
            Unable to load instructions for this test. Please check the URL and try again.
          </div>
        )}
      </main>

      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 shrink-0">
        <div className="max-w-4xl mx-auto">
          <InstructionsClient 
            testId={testDetails?.id || testDetails?.testId} 
            durationMinutes={testDetails?.durationMinutes || 180} 
            disabled={hasError || !testDetails}
          />
        </div>
      </footer>
    </div>
  );
}
