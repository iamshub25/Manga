'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { useParams } from 'next/navigation';

export default function ChapterReader() {
  const params = useParams();
  const { id, chapter } = params as { id: string; chapter: string };
  const [chapterData, setChapterData] = useState<{ id: string; title: string; mangaTitle: string; pages: { number: number; image: string }[] } | null>(null);
  const [allChapters, setAllChapters] = useState<{ id: string; number: string; language: string }[]>([]);

  const [currentLanguage, setCurrentLanguage] = useState<string>('');
  const [loading, setLoading] = useState(true);

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
          const currentChapter = sortedChapters.find((ch: { id: string }) => ch.id === chapter);
          setCurrentLanguage(currentChapter?.language || '');
          
          // Filter chapters by current chapter's language for navigation
          const sameLanguageChapters = sortedChapters.filter((ch: { language: string }) => 
            ch.language === currentChapter?.language
          );
          
          console.log('Current chapter:', chapter);
          console.log('Current language:', currentChapter?.language);
          console.log('Same language chapters:', sameLanguageChapters.length);
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
                <select 
                  value={chapter}
                  onChange={(e) => {
                    if (e.target.value) {
                      window.location.href = `/manga/${id}/chapter/${e.target.value}`;
                    }
                  }}
                  className="bg-gray-800 text-white px-2 py-1 rounded text-xs max-w-24"
                >
                  {allChapters
                    .filter(ch => ch.language === currentLanguage)
                    .map(ch => (
                      <option key={ch.id} value={ch.id}>
                        Ch {ch.number}
                      </option>
                    ))
                  }
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
          {chapterData.pages?.map((page, index) => (
            <div key={page.number} className="w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={page.image}
                alt={`Page ${page.number}`}
                className="w-full h-auto block"
                loading={index < 5 ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={index < 3 ? "high" : "low"}
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/800x1200?text=Image+Not+Available';
                }}
              />
              {/* Preload next few images */}
              {chapterData.pages && index < chapterData.pages.length - 1 && index < 10 && (
                <link
                  rel="preload"
                  as="image"
                  href={chapterData.pages[index + 1]?.image}
                />
              )}
            </div>
          )) || <div className="text-center py-8 text-white">No pages available</div>}
        </div>

        {/* Navigation */}
        <div className="bg-gray-900 p-3">
          <div className="flex justify-between items-center gap-2">
            {(() => {
              const sameLanguageChapters = allChapters.filter(ch => ch.language === currentLanguage);
              const currentIndex = sameLanguageChapters.findIndex(ch => ch.id === chapter);
              
              return (
                <>
                  {currentIndex > 0 ? (
                    <Link
                      href={`/manga/${id}/chapter/${sameLanguageChapters[currentIndex - 1]?.id}`}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm font-medium"
                    >
                      ← Previous
                    </Link>
                  ) : (
                    <div className="flex-1 bg-gray-400 text-white py-3 rounded-lg text-center text-sm font-medium cursor-not-allowed">
                      ← Previous
                    </div>
                  )}
                  
                  <Link
                    href={`/manga/${id}`}
                    className="px-4 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors text-center text-sm font-medium"
                  >
                    List
                  </Link>
                  
                  {currentIndex < sameLanguageChapters.length - 1 && currentIndex !== -1 ? (
                    <Link
                      href={`/manga/${id}/chapter/${sameLanguageChapters[currentIndex + 1]?.id}`}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm font-medium"
                    >
                      Next →
                    </Link>
                  ) : (
                    <div className="flex-1 bg-gray-400 text-white py-3 rounded-lg text-center text-sm font-medium cursor-not-allowed">
                      Next →
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}