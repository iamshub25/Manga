'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import Link from 'next/link';

interface ReadingProgressProps {
  mangaId: string;
  mangaSlug: string;
  totalChapters?: number;
}

export default function ReadingProgress({ mangaId, mangaSlug, totalChapters }: ReadingProgressProps) {
  const [progress, setProgress] = useState<any>(null);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user, mangaId]);

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/progress/${mangaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProgress(data);
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    }
  };

  if (!user || !progress) return null;

  const progressPercentage = progress.totalPages 
    ? Math.round((progress.pageNumber / progress.totalPages) * 100)
    : 0;

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-medium">📖 Continue Reading</h3>
        <span className="text-gray-400 text-sm">
          {progress.pageNumber}/{progress.totalPages || '?'} pages
        </span>
      </div>
      
      <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-300">
          Chapter {progress.chapterNumber}
          {progress.lastRead && (
            <div className="text-xs text-gray-500">
              {new Date(progress.lastRead).toLocaleDateString()}
            </div>
          )}
        </div>
        
        <Link
          href={`/manga/${mangaSlug}/chapter/${progress.chapterNumber}?page=${progress.pageNumber}`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Continue
        </Link>
      </div>
    </div>
  );
}