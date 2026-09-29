export async function fetchWithCache(url, options = {}) {
  const { revalidate = 300, tags = [], ...fetchOptions } = options;
  
  // Use server-side internal network URL if available, otherwise fallback to public
  const baseUrl = process.env.INTERNAL_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
  const fullUrl = `${baseUrl}${url}`;

  try {
    const res = await fetch(fullUrl, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
      next: { 
        revalidate, 
        tags 
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}: ${res.status}`);
    }

    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  } catch (error) {
    console.error(`Cache Fetch Error (${url}):`, error);
    throw error;
  }
}
