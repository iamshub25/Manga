'use client';

import { useState, useEffect } from 'react';
import MangaCard from '@/components/MangaCard';
import Loader from '@/components/Loader';

export default function LatestPage() {
  const [manga, setManga] = useState<{ id: string; title: string; cover: string; latestChapter: string; rating: number }[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchManga = async () => {
      try {
        const res = await fetch('/api/manga?sort=latest');
        if (res.ok) {
          const data = await res.json();
          setManga(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Failed to fetch manga:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchManga();
  }, []);
  
  if (loading) {
    return (
      <div className="bg-gray-950 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading latest manga...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Latest Updates</h1>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {Array.isArray(manga) ? manga.map((item: { id: string; title: string; cover: string; latestChapter: string; rating: number }) => (
            <MangaCard key={item.id} {...item} />
          )) : null}
        </div>
      </div>
    </div>
  );
}