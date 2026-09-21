import { testService } from '@/services/testService';

export const revalidate = 0; // Disable static caching for live catalog data

export default async function HomePage() {
  let seriesList = [];
  let errorMsg = null;

  try {
    const data = await testService.getPublishedSeries();
    // Assuming backend wraps paginated content or returns a list
    seriesList = data?.content || data || [];
  } catch (err) {
    errorMsg = err.message || 'Could not load test series. Ensure backend services are running.';
  }

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto font-sans">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Ed-Tech Platform</h1>
        <p className="text-gray-600 mt-1">Available Test Series & Exams</p>
      </header>

      {errorMsg && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg mb-6">
          {errorMsg}
        </div>
      )}

      {seriesList.length === 0 && !errorMsg ? (
        <p className="text-gray-500">No published test series available yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {seriesList.map((item) => (
            <div key={item.id} className="p-5 border rounded-xl shadow-sm hover:shadow transition bg-white">
              <h2 className="text-xl font-semibold text-gray-800">{item.title}</h2>
              <p className="text-sm text-gray-500 mt-2">Base Price: ₹{item.basePrice}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}