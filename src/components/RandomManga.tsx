'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RandomManga() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const getRandomManga = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/manga/random');
      if (res.ok) {
        const manga = await res.json();
        router.push(`/manga/${manga.slug}`);
      }
    } catch (error) {
      console.error('Failed to get random manga:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={getRandomManga}
      disabled={loading}
      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center space-x-2"
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Finding...</span>
        </>
      ) : (
        <>
          <span>🎲</span>
          <span>I'm Feeling Lucky</span>
        </>
      )}
    </button>
  );
}