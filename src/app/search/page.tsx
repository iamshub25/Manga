'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MangaCard from '@/components/MangaCard';
import SearchBar from '@/components/SearchBar';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      setLoading(true);
      fetch(`/api/manga/search?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
          console.log('Search results:', data);
          setResults(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [query]);

  return (
    <div className="bg-gray-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <SearchBar className="w-full max-w-md" />
        </div>
        
        {query && (
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Search results for &quot;{query}&quot;
            </h1>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-300 text-lg">Searching...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {results.map((manga: any) => (
              <MangaCard 
                key={manga._id || manga.id} 
                id={manga._id || manga.id}
                title={manga.title}
                cover={manga.cover}
                rating={manga.rating || 0}
                latestChapter="N/A"
              />
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-8 text-gray-400 text-sm sm:text-base">
            No manga found for &quot;{query}&quot;
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="bg-gray-950 min-h-screen flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div><p className="text-gray-300 text-lg">Loading...</p></div></div>}>
      <SearchContent />
    </Suspense>
  );
}