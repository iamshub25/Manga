'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from "next/link";
import { useParams } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

export default function ChapterReader() {
  const params = useParams();
  const { id, chapter } = params as { id: string; chapter: string };
  const [chapterData, setChapterData] = useState<{ id: string; title: string; mangaTitle: string; pages: { number: number; image: string }[] } | null>(null);
  const [allChapters, setAllChapters] = useState<{ _id: string; number: string; language: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [readingMode, setReadingMode] = useState<'single' | 'double' | 'webtoon'>('webtoon');
  const [showControls, setShowControls] = useState(true);
  const [autoScroll, setAutoScroll] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { user } = useUser();

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
          const sortedChapters = chaptersData.sort((a: { number: string }, b: { number: string }) => {
            return parseFloat(a.number) - parseFloat(b.number);
          });
          
          setAllChapters(sortedChapters);
          const currentChapter = sortedChapters.find((ch: { _id: string }) => ch._id === chapter);
          setCurrentLanguage(currentChapter?.language || '');
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
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    if (pageParam) {
      setCurrentPage(parseInt(pageParam));
    }
  }, []);

  useEffect(() => {
    if (user && chapterData) {
      updateProgress();
    }
  }, [currentPage, user, chapterData]);

  const updateProgress = async () => {
    if (!user || !chapterData) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          mangaId: id,
          chapterNumber: chapter,
          pageNumber: currentPage,
          totalPages: chapterData.pages?.length || 0
        })
      });
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (readingMode === 'webtoon') return;
      
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
          prevPage();
          break;
        case 'ArrowRight':
        case 'd':
          nextPage();
          break;
        case ' ':
          e.preventDefault();
          nextPage();
          break;
        case 'f':
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, readingMode, chapterData]);

  const nextPage = () => {
    if (!chapterData?.pages) return;
    
    if (currentPage < chapterData.pages.length) {
      setCurrentPage(prev => prev + 1);
    } else {
      const sameLanguageChapters = allChapters.filter(ch => ch.language === currentLanguage);
      const currentIndex = sameLanguageChapters.findIndex(ch => ch._id === chapter);
      const nextChapter = sameLanguageChapters[currentIndex + 1];
      
      if (nextChapter) {
        window.location.href = `/manga/${id}/chapter/${nextChapter._id}`;
      }
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    } else {
      const sameLanguageChapters = allChapters.filter(ch => ch.language === currentLanguage);
      const currentIndex = sameLanguageChapters.findIndex(ch => ch._id === chapter);
      const prevChapter = sameLanguageChapters[currentIndex - 1];
      
      if (prevChapter) {
        window.location.href = `/manga/${id}/chapter/${prevChapter._id}`;
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    if (readingMode === 'webtoon') return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const centerX = rect.width / 2;
    
    if (clickX < centerX) {
      prevPage();
    } else {
      nextPage();
    }
  };

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

  if (readingMode === 'webtoon') {
    return (
      <div className="bg-black min-h-screen">
        <div className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 text-white p-3 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link href={`/manga/${id}`} className="text-blue-400 hover:text-blue-300 transition-colors">
              ← Back
            </Link>
            <h1 className="text-lg font-semibold truncate">
              {chapterData?.mangaTitle} - {chapterData?.title}
            </h1>
            <button
              onClick={() => setShowControls(!showControls)}
              className="text-gray-400 hover:text-white"
            >
              ⚙️
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {chapterData?.pages?.map((page, index) => (
            <div key={page.number} className="relative">
              <img
                src={page.image}
                alt={`Page ${page.number}`}
                className="w-full h-auto"
                loading={index < 3 ? "eager" : "lazy"}
                onError={(e) => {
                  if (!e.currentTarget.src.includes('proxy-image')) {
                    e.currentTarget.src = `/api/proxy-image?url=${encodeURIComponent(page.image)}`;
                  }
                }}
              />
            </div>
          ))}
        </div>
        
        <ReaderControls
          currentPage={currentPage}
          totalPages={chapterData?.pages?.length || 0}
          readingMode={readingMode}
          setReadingMode={setReadingMode}
          autoScroll={autoScroll}
          setAutoScroll={setAutoScroll}
          showControls={showControls}
          setShowControls={setShowControls}
          allChapters={allChapters}
          currentChapter={chapter}
          currentLanguage={currentLanguage}
          mangaId={id}
        />
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen flex flex-col">
      <div className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 text-white p-3 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href={`/manga/${id}`} className="text-blue-400 hover:text-blue-300 transition-colors">
            ← Back
          </Link>
          <h1 className="text-lg font-semibold truncate">
            {chapterData?.mangaTitle} - {chapterData?.title}
          </h1>
          <button
            onClick={() => setShowControls(!showControls)}
            className="text-gray-400 hover:text-white"
          >
            ⚙️
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative max-w-4xl w-full">
          {readingMode === 'double' && chapterData?.pages && currentPage < chapterData.pages.length ? (
            <div className="flex gap-2">
              <div className="flex-1">
                <img
                  src={chapterData.pages[currentPage - 1]?.image}
                  alt={`Page ${currentPage}`}
                  className="w-full h-auto cursor-pointer"
                  onClick={handleImageClick}
                  onError={(e) => {
                    if (!e.currentTarget.src.includes('proxy-image')) {
                      e.currentTarget.src = `/api/proxy-image?url=${encodeURIComponent(chapterData.pages[currentPage - 1]?.image)}`;
                    }
                  }}
                />
              </div>
              <div className="flex-1">
                <img
                  src={chapterData.pages[currentPage]?.image}
                  alt={`Page ${currentPage + 1}`}
                  className="w-full h-auto cursor-pointer"
                  onClick={handleImageClick}
                  onError={(e) => {
                    if (!e.currentTarget.src.includes('proxy-image')) {
                      e.currentTarget.src = `/api/proxy-image?url=${encodeURIComponent(chapterData.pages[currentPage]?.image)}`;
                    }
                  }}
                />
              </div>
            </div>
          ) : (
            chapterData?.pages && (
              <img
                src={chapterData.pages[currentPage - 1]?.image}
                alt={`Page ${currentPage}`}
                className="w-full h-auto cursor-pointer"
                onClick={handleImageClick}
                onError={(e) => {
                  if (!e.currentTarget.src.includes('proxy-image')) {
                    e.currentTarget.src = `/api/proxy-image?url=${encodeURIComponent(chapterData.pages[currentPage - 1]?.image)}`;
                  }
                }}
              />
            )
          )}
        </div>
      </div>

      <ReaderControls
        currentPage={currentPage}
        totalPages={chapterData?.pages?.length || 0}
        readingMode={readingMode}
        setReadingMode={setReadingMode}
        autoScroll={autoScroll}
        setAutoScroll={setAutoScroll}
        showControls={showControls}
        setShowControls={setShowControls}
        allChapters={allChapters}
        currentChapter={chapter}
        currentLanguage={currentLanguage}
        mangaId={id}
        onPageChange={setCurrentPage}
      />

      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
        >
          ↑
        </button>
      )}
    </div>
  );
}

interface ReaderControlsProps {
  currentPage: number;
  totalPages: number;
  readingMode: 'single' | 'double' | 'webtoon';
  setReadingMode: (mode: 'single' | 'double' | 'webtoon') => void;
  autoScroll: boolean;
  setAutoScroll: (auto: boolean) => void;
  showControls: boolean;
  setShowControls: (show: boolean) => void;
  allChapters: { _id: string; number: string; language: string }[];
  currentChapter: string;
  currentLanguage: string;
  mangaId: string;
  onPageChange?: (page: number) => void;
}

function ReaderControls({
  currentPage,
  totalPages,
  readingMode,
  setReadingMode,
  autoScroll,
  setAutoScroll,
  showControls,
  setShowControls,
  allChapters,
  currentChapter,
  currentLanguage,
  mangaId,
  onPageChange
}: ReaderControlsProps) {
  if (!showControls) {
    return (
      <button
        onClick={() => setShowControls(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full z-50"
      >
        ⚙️
      </button>
    );
  }

  const sameLanguageChapters = allChapters.filter(ch => ch.language === currentLanguage);
  const currentIndex = sameLanguageChapters.findIndex(ch => ch._id === currentChapter);
  const prevChapter = sameLanguageChapters[currentIndex - 1];
  const nextChapter = sameLanguageChapters[currentIndex + 1];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 p-4 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowControls(false)}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
          
          {readingMode !== 'webtoon' && (
            <div className="flex items-center space-x-2">
              <span className="text-white text-sm">
                {currentPage} / {totalPages}
              </span>
              <input
                type="range"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => onPageChange?.(parseInt(e.target.value))}
                className="w-32"
              />
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={readingMode}
            onChange={(e) => setReadingMode(e.target.value as any)}
            className="bg-gray-800 text-white p-2 rounded border border-gray-600"
          >
            <option value="single">Single Page</option>
            <option value="double">Double Page</option>
            <option value="webtoon">Webtoon</option>
          </select>

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-2 rounded ${autoScroll ? 'bg-blue-600' : 'bg-gray-700'} text-white`}
          >
            🔄
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {prevChapter && (
            <Link
              href={`/manga/${mangaId}/chapter/${prevChapter._id}`}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded"
            >
              ← Prev
            </Link>
          )}
          
          {nextChapter && (
            <Link
              href={`/manga/${mangaId}/chapter/${nextChapter._id}`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded"
            >
              Next →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}