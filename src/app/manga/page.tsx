'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MangaCard from '@/components/MangaCard';
import { useCachedFetch } from '@/hooks/useCache';

interface MangaResponse {
  mangas: Array<{
    _id: string;
    title: string;
    cover: string;
    slug: string;
    rating: number;
  }>;
  pagination: {
    page: number;
    total: number;
    pages: number;
  };
}

function MangaContent() {
  const searchParams = useSearchParams();
  const [manga, setManga] = useState<Array<{
    _id: string;
    title: string;
    cover: string;
    slug: string;
    rating: number;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [filters, setFilters] = useState({
    genre: searchParams.get('genre') || '',
    status: searchParams.get('status') || '',
    sort: 'latest'
  });

  const genres = ["Action", "Romance", "Comedy", "Drama", "Fantasy", "Horror", "Slice of Life", "Sports", "Supernatural", "Thriller", "Adventure", "Mystery"];
  const statuses = ["ongoing", "completed", "hiatus"];

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [filters.genre, filters.status, filters.sort]);

  const params = new URLSearchParams();
  if (filters.genre) params.append('genre', filters.genre);
  if (filters.status) params.append('status', filters.status);
  params.append('sort', filters.sort);
  params.append('page', pagination.page.toString());
  params.append('limit', '24');
  
  const cacheKey = `manga_${params.toString()}`;
  const { data, loading: fetchLoading } = useCachedFetch<MangaResponse>(`/api/manga?${params}`, cacheKey);
  
  useEffect(() => {
    if (data) {
      setManga(data.mangas || []);
      setPagination(data.pagination || { page: 1, total: 0, pages: 0 });
      setLoading(false);
    }
  }, [data]);
  
  useEffect(() => {
    setLoading(fetchLoading);
  }, [fetchLoading]);



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">All Manga</h1>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
            <select 
              value={filters.genre}
              onChange={(e) => setFilters({...filters, genre: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All Genres</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select 
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All Status</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select 
              value={filters.sort}
              onChange={(e) => setFilters({...filters, sort: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="latest">Latest Updated</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {manga.map((item: { _id: string; title: string; cover: string; slug: string; rating: number }) => (
              <MangaCard key={item._id} id={item._id} title={item.title} cover={item.cover} rating={item.rating} />
            ))}
          </div>
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center mt-8 gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
              >
                Previous
              </button>
              
              <span className="px-4 py-2 text-gray-700">
                Page {pagination.page} of {pagination.pages}
              </span>
              
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function MangaPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>}>
      <MangaContent />
    </Suspense>
  );
}