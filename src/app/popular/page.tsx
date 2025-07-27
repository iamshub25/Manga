'use client';

import { useState, useEffect } from 'react';
import MangaCard from '@/components/MangaCard';
import Loader from '@/components/Loader';

export default function PopularPage() {
  const [manga, setManga] = useState<{ id: string; title: string; cover: string; latestChapter: string; rating: number }[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchManga = async () => {
      try {
        const res = await fetch('/api/manga?sort=popular');
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Loader />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Popular Manga</h1>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {Array.isArray(manga) ? manga.map((item: { id: string; title: string; cover: string; latestChapter: string; rating: number }) => (
          <MangaCard key={item.id} {...item} />
        )) : null}
      </div>
    </div>
  );
}