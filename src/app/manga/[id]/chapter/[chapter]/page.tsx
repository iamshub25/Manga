'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { useParams } from 'next/navigation';

export default function ChapterReader() {
  const params = useParams();
  const { id, chapter } = params as { id: string; chapter: string };
  const [chapterData, setChapterData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChapterData = async () => {
      try {
        const res = await fetch(`/api/manga/${id}/chapter/${chapter}`);
        const data = await res.json();
        setChapterData(data);
      } catch (error) {
        console.error('Failed to fetch chapter data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChapterData();
  }, [id, chapter]);

  if (loading) {
    return <div className="bg-black min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  if (!chapterData) {
    return <div className="bg-black min-h-screen flex items-center justify-center text-white">Chapter not found</div>;
  }

  return (
    <div className="bg-black min-h-screen">
      {/* Reader Header */}
      <div className="bg-gray-900 text-white p-2 sticky top-0 z-50">
        <div className="max-w-full mx-auto">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Link href={`/manga/${id}`} className="text-blue-400 hover:text-blue-300 text-sm">
                ← Back
              </Link>
              <div className="flex items-center space-x-2">
                <select className="bg-gray-800 text-white px-2 py-1 rounded text-xs">
                  <option>Ch {chapter}</option>
                </select>
                <button className="bg-blue-600 px-2 py-1 rounded hover:bg-blue-700 text-xs">
                  ⚙
                </button>
              </div>
            </div>
            <h1 className="text-xs font-medium truncate text-center">{chapterData.mangaTitle} - {chapterData.title}</h1>
          </div>
        </div>
      </div>

      {/* Reader Content */}
      <div className="w-full">
        <div className="space-y-0">
          {chapterData.pages.map((page, index) => (
            <div key={page.number} className="w-full">
              <img
                src={page.image}
                alt={`Page ${page.number}`}
                className="w-full h-auto block"
                loading={index < 3 ? "eager" : "lazy"}
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/800x1200?text=Image+Not+Available';
                }}
              />
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="bg-gray-900 p-3">
          <div className="flex justify-between items-center gap-2">
            <Link
              href={`/manga/${id}/chapter/${parseInt(chapter) - 1}`}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm font-medium"
            >
              ← Previous
            </Link>
            
            <Link
              href={`/manga/${id}`}
              className="px-4 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors text-center text-sm font-medium"
            >
              List
            </Link>
            
            <Link
              href={`/manga/${id}/chapter/${parseInt(chapter) + 1}`}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm font-medium"
            >
              Next →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}