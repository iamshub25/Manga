'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import Link from 'next/link';

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/progress/recent', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-gray-950 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">📖 Reading History</h1>
          <p className="text-gray-400 mb-6">Please login to view your reading history</p>
          <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-950 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">📖 Reading History</h1>
          <p className="text-gray-400">Continue where you left off</p>
        </div>

        {history.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((progress) => (
              <div key={progress._id} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <div className="flex items-start space-x-4">
                  <img
                    src={progress.mangaId.cover}
                    alt={progress.mangaId.title}
                    className="w-16 h-20 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA2NCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjgwIiBmaWxsPSIjMzc0MTUxIi8+Cjx0ZXh0IHg9IjMyIiB5PSI0MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSIjOUNBM0FGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KPHN2Zz4=';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="text-white font-medium mb-1 line-clamp-2">
                      {progress.mangaId.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-2">
                      Chapter {progress.chapterNumber} • Page {progress.pageNumber}
                    </p>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ 
                          width: `${progress.totalPages ? (progress.pageNumber / progress.totalPages) * 100 : 0}%` 
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(progress.lastRead).toLocaleDateString()}
                      </span>
                      <Link
                        href={`/manga/${progress.mangaId.slug}/chapter/${progress.chapterNumber}?page=${progress.pageNumber}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Continue
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-xl font-bold text-white mb-2">No reading history</h3>
            <p className="text-gray-400 mb-6">Start reading manga to build your history</p>
            <Link
              href="/manga"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Browse Manga
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}