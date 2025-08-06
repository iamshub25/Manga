'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { useParams } from 'next/navigation';

export default function ChapterReader() {
  const params = useParams();
  const { id, chapter } = params as { id: string; chapter: string };
  const [chapterData, setChapterData] = useState<{ id: string; title: string; mangaTitle: string; pages: { number: number; image: string }[] } | null>(null);
  const [allChapters, setAllChapters] = useState<{ _id: string; number: string; language: string }[]>([]);

  const [currentLanguage, setCurrentLanguage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chapterRes, chaptersRes] = await Promise.all([
          fetch(`/api/manga/${id}/chapter/${chapter}`),
          fetch(`/api/manga/${id}/chapters`)
        ]);
        const chapterData = await chapterRes.json();
        const chaptersData = await chaptersRes.json();
        
        setChapterData(chapterData);
        
        if (Array.isArray(chaptersData)) {
          // Sort chapters by chapter number
          const sortedChapters = chaptersData.sort((a: { number: string }, b: { number: string }) => {
            return parseFloat(a.number) - parseFloat(b.number);
          });
          
          setAllChapters(sortedChapters);
          const currentChapter = sortedChapters.find((ch: { _id: string }) => ch._id === chapter);
          setCurrentLanguage(currentChapter?.language || '');
          
          // Filter chapters by current chapter's language for navigation

          

        } else {
          setAllChapters([]);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, chapter]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="bg-gray-950 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (!chapterData) {
    return (
      <div className="bg-gray-950 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <p className="text-gray-300 text-xl mb-4">Chapter not found</p>
          <Link href={`/manga/${id}`} className="text-blue-400 hover:text-blue-300 underline">
            Back to manga
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 min-h-screen">
      {/* Reader Header */}
      <div className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 text-white p-3 sticky top-0 z-50 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <Link href={`/manga/${id}`} className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Manga
            </Link>
            <select 
              value={chapter}
              onChange={(e) => {
                if (e.target.value) {
                  window.location.href = `/manga/${id}/chapter/${e.target.value}`;
                }
              }}
              className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              {allChapters
                .filter(ch => ch.language === currentLanguage)
                .map(ch => (
                  <option key={ch._id} value={ch._id}>
                    Chapter {ch.number}
                  </option>
                ))
              }
            </select>
          </div>
          <h1 className="text-lg font-semibold text-center text-gray-100 truncate">
            {chapterData.mangaTitle} - {chapterData.title}
          </h1>
        </div>
      </div>

      {/* Reader Content */}
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center">
          {chapterData.pages?.map((page, index) => (
            <div key={page.number} className="w-full max-w-3xl mb-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={page.image}
                alt={`Page ${page.number}`}
                className="w-full h-auto block shadow-lg rounded-sm"
                loading={index < 5 ? "eager" : "lazy"}
                onError={(e) => {
                  if (!e.currentTarget.src.includes('proxy-image')) {
                    e.currentTarget.src = `/api/proxy-image?url=${encodeURIComponent(page.image)}`;
                  } else {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjEyMDAiIHZpZXdCb3g9IjAgMCA4MDAgMTIwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSIxMjAwIiBmaWxsPSIjMzc0MTUxIi8+Cjx0ZXh0IHg9IjQwMCIgeT0iNjAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Q0EzQUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPg==';
                  }
                }}
              />
            </div>
          )) || (
            <div className="text-center py-16 text-gray-400">
              <div className="text-6xl mb-4">📖</div>
              <p className="text-lg">No pages available</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 p-4 mt-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center gap-3">
              {(() => {
                const sameLanguageChapters = allChapters.filter(ch => ch.language === currentLanguage);
                const currentIndex = sameLanguageChapters.findIndex(ch => ch._id === chapter);
                
                return (
                  <>
                    {currentIndex > 0 ? (
                      <Link
                        href={`/manga/${id}/chapter/${sameLanguageChapters[currentIndex - 1]?._id}`}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-center font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        ← Previous Chapter
                      </Link>
                    ) : (
                      <div className="flex-1 bg-gray-700 text-gray-400 py-3 px-4 rounded-lg text-center font-medium cursor-not-allowed">
                        ← Previous Chapter
                      </div>
                    )}
                    
                    <Link
                      href={`/manga/${id}`}
                      className="px-6 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors text-center font-medium"
                    >
                      📚 Chapters
                    </Link>
                    
                    {currentIndex < sameLanguageChapters.length - 1 && currentIndex !== -1 ? (
                      <Link
                        href={`/manga/${id}/chapter/${sameLanguageChapters[currentIndex + 1]?._id}`}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-center font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        Next Chapter →
                      </Link>
                    ) : (
                      <div className="flex-1 bg-gray-700 text-gray-400 py-3 px-4 rounded-lg text-center font-medium cursor-not-allowed">
                        Next Chapter →
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
          aria-label="Back to top"
        >
          ↑
        </button>
      )}
    </div>
  );
}